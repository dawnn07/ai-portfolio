import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Github, ExternalLink, Folder } from "lucide-react";
import Link from "next/link";

export default function ProjectModal({ children }: { children: React.ReactNode }) {
    const projects = [
        {
            name: "Esportify",
            description: "Full-featured esports management platform designed to help organizers create, run, and scale competitive gaming tournaments",
            tech: ["Next.js", "TypeScript", "MongoDB", "PostgreSQL", "ASP.NET Core 8", "Go", "Redis"],
            github: "",
            live: "https://www.esportify.org",
            status: "production",
        },
        {
            name: "Blog Application",
            description: "A modern, full-stack blog application built with Next.js, TypeScript, Prisma, and more",
            tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
            github: "https://github.com/dawnn07/blog-app",
            live: "https://blog-app-virid-nine.vercel.app",
            status: "active",
        },
        {
            name: "ChroniQ - Task Manager",
            description: "The AI-powered todo app that helps you manage your tasks efficiently and effectively",
            tech: ["Next.js", "TypeScript", "Convex", "AI SDK"],
            github: "",
            live: "https://chroniq-tau.vercel.app",
            status: "active",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'production': return 'text-chart-2';
            case 'active': return 'text-chart-1';
            case 'maintenance': return 'text-chart-4';
            case 'development': return 'text-chart-3';
            default: return 'text-muted-foreground';
        }
    };

    const getStatusSymbol = (status: string) => {
        switch (status) {
            case 'production': return '●';
            case 'active': return '▲';
            case 'maintenance': return '■';
            case 'development': return '◆';
            default: return '○';
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent 
                showCloseButton={false} 
                className="
                    w-[95vw] max-w-none sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] 2xl:max-w-[65vw]
                    max-h-[90vh] 
                    gap-0 p-0
                    bg-card/95 border-[3px] rounded-none
                    flex flex-col
                "
            >
                <DialogHeader>
                    <DialogTitle className="sr-only">Projects</DialogTitle>
                </DialogHeader>
                
                <div className="font-mono flex flex-col h-full min-h-0">
                    {/* Terminal Header - Fixed */}
                    <div className="flex items-center gap-3 p-3 sm:p-4 lg:p-6 pb-3 sm:pb-4 border-b border-border flex-shrink-0 bg-card">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-destructive"></div>
                            <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                            <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                        </div>
                        <span className="text-muted-foreground text-sm">
                            user@portfolio:~/projects$
                        </span>
                    </div>

                    {/* Terminal Commands - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                        <div className="space-y-6 sm:space-y-8">
                        {/* ls -la command */}
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-chart-1">$</span>
                                <span className="text-foreground">ls -la projects/</span>
                            </div>
                            <div className="pl-4 space-y-1 text-xs sm:text-sm text-muted-foreground">
                                <p>total {projects.length} repositories</p>
                                <p>drwxr-xr-x  {projects.length + 2} user user 4096 Jan 20 2024 .</p>
                                <p>drwxr-xr-x  3 user user 4096 Jan 15 2024 ..</p>
                            </div>
                        </div>

                        {/* Project listings */}
                        <div className="space-y-4 sm:space-y-6">
                            {projects.map((project, index) => (
                                <div key={index} className="space-y-2 sm:space-y-3">
                                    {/* cat project command */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-chart-1">$</span>
                                        <span className="text-foreground text-sm sm:text-base">
                                            cat {project.name.toLowerCase().replace(/\s+/g, '-')}.json
                                        </span>
                                    </div>
                                    
                                    {/* Project details */}
                                    <div className="pl-4 bg-accent/20 border-l-2 border-chart-1 p-3 sm:p-4 rounded-r-md space-y-2 sm:space-y-3">
                                        {/* Project header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Folder className="w-4 h-4 text-chart-1" />
                                                <h3 className="text-foreground font-medium text-sm sm:text-base">
                                                    {project.name}
                                                </h3>
                                                <span className={`text-xs ${getStatusColor(project.status)}`}>
                                                    {getStatusSymbol(project.status)} {project.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {project.description}
                                        </p>

                                        {/* Tech stack */}
                                        <div className="flex flex-wrap gap-1 sm:gap-2">
                                            {project.tech.map((tech, techIndex) => (
                                                <span 
                                                    key={techIndex}
                                                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded border border-primary/20"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Links */}
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            <Link
                                                href={project.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                                            >
                                                <Github className="w-4 h-4" />
                                                <span>Source</span>
                                            </Link>
                                            {project.live && (
                                                <Link
                                                    href={project.live}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span>Live Demo</span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Terminal cursor */}
                        <div className="flex items-center gap-2 pt-2">
                            <span className="text-chart-1">$</span>
                            <span className="animate-pulse">_</span>
                        </div>
                    </div>
                </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}