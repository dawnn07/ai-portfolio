import { Folder, Github, Info, RotateCcw } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Clock } from "./clock";
import Link from "next/link";
import InfoModal from "./info-modal";
import ProjectModal from "./project-modal";

export async function Navbar() {

    return (
        <header className="bg-card border-b border-background sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center space-x-2 flex-1">
                    <InfoModal>
                        <Button
                            variant="ghost" size="icon">
                            <Info />
                            <span className="sr-only">Info</span>
                        </Button>
                    </InfoModal>
                    <ProjectModal>
                        <Button
                            variant="ghost" size="icon">
                            <Folder />
                            <span className="sr-only">Projects</span>
                        </Button>
                    </ProjectModal>
                    <Link href="https://github.com/dawnn07" target="_blank" rel="noopener noreferrer">
                    <Button
                        variant="ghost" size="icon">
                        <Github />
                        <span className="sr-only">Github</span>
                    </Button>
                    </Link>
                </div>
                <Clock />
                <div className="flex items-center space-x-2 flex-1 justify-end">
                    <Button
                        variant="ghost" size="icon">
                        <RotateCcw />
                        <span className="sr-only">Refresh</span>
                    </Button>
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}