import SystemInfo from "./system-info";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

export default function InfoModal({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent 
                showCloseButton={false} 
                className="
                    w-[95vw] max-w-none sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[60vw] 2xl:max-w-[50vw]
                    max-h-[90vh] overflow-y-auto
                    gap-0 p-3 sm:p-4 lg:p-6
                    bg-card/95 border-[3px] rounded-none
                "
            >
                <DialogHeader>
                    <DialogTitle className="sr-only">Info</DialogTitle>
                </DialogHeader>
                
                <div className="
                    flex flex-col lg:flex-row 
                    gap-4 sm:gap-6 lg:gap-8 xl:gap-12 2xl:gap-16
                    items-center lg:items-start lg:justify-between
                ">
                    {/* Left Section - ASCII Art & Bio */}
                    <div className="flex flex-col space-y-3 sm:space-y-4 w-full lg:w-auto lg:flex-shrink-0">
                        {/* ASCII Art */}
                        <pre className="
                            leading-[1.09375] text-muted-foreground pt-2 sm:pt-4
                            text-[0.5rem] xs:text-[0.6rem] sm:text-xs md:text-sm
                            overflow-x-auto whitespace-pre
                            max-w-full
                        ">
{`▄███████▄     ▄████████  ▄█     █▄  ███▄▄▄▄   
███    ███   ███    ███ ███     ███ ███▀▀▀██▄ 
███    ███   ███    ███ ███     ███ ███   ███ 
███    ███   ███    ███ ███     ███ ███   ███ 
███    ███ ▀███████████ ███     ███ ███   ███ 
███    ███   ███    ███ ███     ███ ███   ███ 
███  ▀ ███   ███    ███ ███ ▄█▄ ███ ███   ███ 
 ▀██████▀▄▄  ███    █▀   ▀███▀███▀   ▀█   █▀`}
                        </pre>
                        
                        {/* Terminal Bio Section */}
                        <div className="
                            font-mono text-xs sm:text-sm 
                            space-y-2 sm:space-y-3 
                            text-muted-foreground 
                            w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
                        ">
                            {/* whoami command */}
                            <div className="flex items-center gap-2">
                                <span className="text-chart-1 flex-shrink-0">$</span>
                                <span className="text-foreground break-all">whoami</span>
                            </div>
                            <div className="pl-3 sm:pl-4 space-y-1">
                                <p className="break-words leading-relaxed">
                                    Full Stack Developer passionate about creating
                                </p>
                                <p className="break-words leading-relaxed">
                                    elegant solutions with modern web technologies.
                                </p>
                            </div>
                            
                            {/* cat about.txt command */}
                            <div className="flex items-center gap-2 pt-1 sm:pt-2">
                                <span className="text-chart-1 flex-shrink-0">$</span>
                                <span className="text-foreground break-all">cat about.txt</span>
                            </div>
                            <div className="pl-3 sm:pl-4 space-y-1">
                                <p className="break-words leading-relaxed">
                                    I specialize in JavaScript/TypeScript ecosystem,
                                </p>
                                <p className="break-words leading-relaxed">
                                    building scalable applications with React, Next.js,
                                </p>
                                <p className="break-words leading-relaxed">
                                    and Node.js. Always learning, always coding.
                                </p>
                            </div>
                            
                            {/* status command */}
                            <div className="flex items-center gap-2 pt-1 sm:pt-2">
                                <span className="text-chart-1 flex-shrink-0">$</span>
                                <span className="text-foreground break-all">status --current</span>
                            </div>
                            <div className="pl-3 sm:pl-4 space-y-1">
                                <p className="flex items-center gap-2 break-words leading-relaxed">
                                    <span className="w-2 h-2 bg-chart-2 rounded-full animate-pulse flex-shrink-0"></span>
                                    <span>Available for new opportunities</span>
                                </p>
                                <p className="break-words leading-relaxed">Located in Vietnam 🇻🇳</p>
                            </div>
                            
                            {/* Cursor */}
                            <div className="flex items-center gap-2 pt-1 sm:pt-2">
                                <span className="text-chart-1 flex-shrink-0">$</span>
                                <span className="animate-pulse">_</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Section - System Info */}
                    <div className="w-full lg:w-auto lg:flex-shrink lg:min-w-0">
                        <SystemInfo />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}