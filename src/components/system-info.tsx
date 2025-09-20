import { Cpu, Github, Laptop, Linkedin, Mail, Terminal } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const SystemInfo = () => {
    const technologies = [
        {
            name: "JavaScript",
            icon: Cpu,
            version: "ES2023"
        },
        {
            name: "TypeScript",
            icon: Cpu,
            version: "5.3+"
        },
        {
            name: "React",
            icon: Cpu,
            version: "18.x"
        },
        {
            name: "NextJS",
            icon: Cpu,
            version: "14.x"
        },
        {
            name: "NodeJS",
            icon: Terminal,
            version: "20.x"
        },
        {
            name: "NestJS",
            icon: Terminal,
            version: "10.x"
        }
    ];

    const contact = [
        {
            link: "mailto:haidangdavid.work@gmail.com",
            icon: Mail,
            name: "Email",
            handle: "haidangdavid.work@gmail.com"
        },
        {
            link: "https://www.linkedin.com/in/dawnn07/",
            icon: Linkedin,
            name: "LinkedIn",
            handle: "@dawnn07"
        },
        {
            link: "https://github.com/dawnn07",
            icon: Github,
            name: "GitHub",
            handle: "@dawnn07"
        },
    ];

    return (
        <div className="w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl relative">
            {/* Main Container with Pattern Background */}
            <div className="bg-card border border-border overflow-hidden shadow-sm rounded-none">
                <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 sm:space-y-6 md:space-y-8">
                    {/* Technologies Section */}
                    <section>
                        <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-sm flex-shrink-0"></div>
                            <h2 className="text-foreground font-mono text-sm sm:text-base md:text-lg font-medium truncate">
                                Technologies
                            </h2>
                            <div className="flex-1 h-px bg-border ml-2 sm:ml-4 min-w-0"></div>
                        </div>

                        <div className="tree">
                            <ul className="tree-list">
                                <li className="tree-item">
                                    <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground font-mono text-xs sm:text-sm mb-1 sm:mb-2">
                                        <Laptop className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="truncate">stack/</span>
                                    </div>
                                    <ul className="tree-list">
                                        {technologies.map((tech, index) => (
                                            <li key={index} className="tree-item group">
                                                <div className="flex items-center justify-between py-1 sm:py-1.5 px-2 sm:px-3 rounded-md hover:bg-accent/50 transition-colors min-w-0">
                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                        <tech.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                                        <span className="font-mono text-foreground text-xs sm:text-sm truncate">
                                                            {tech.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0 hidden xs:block">
                                                        {tech.version}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section>
                        <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-chart-1 rounded-sm flex-shrink-0"></div>
                            <h2 className="text-foreground font-mono text-sm sm:text-base md:text-lg font-medium truncate">
                                Contact
                            </h2>
                            <div className="flex-1 h-px bg-border ml-2 sm:ml-4 min-w-0"></div>
                        </div>

                        <div className="tree">
                            <ul className="tree-list">
                                <li className="tree-item">
                                    <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground font-mono text-xs sm:text-sm mb-1 sm:mb-2">
                                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="truncate">social/</span>
                                    </div>
                                    <ul className="tree-list">
                                        {contact.map((item, index) => (
                                            <li key={index} className="tree-item group">
                                                <Link 
                                                    href={item.link}
                                                    className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 rounded-md hover:bg-accent/50 transition-all duration-200 hover:translate-x-1 min-w-0"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                        <item.icon className="w-3 h-3 sm:w-4 sm:h-4 text-chart-1 group-hover:text-primary transition-colors flex-shrink-0" />
                                                        <span className="font-mono text-foreground text-xs sm:text-sm truncate">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0 hidden sm:block truncate max-w-[120px] md:max-w-none">
                                                        {item.handle}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Footer with Grid Pattern */}
                <div className="bg-pattern-grid h-2 sm:h-3 md:h-4 border-t border-border"></div>
            </div>
        </div>
    );
};

export default SystemInfo;