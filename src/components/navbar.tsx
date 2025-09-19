import { Folder, Github, Info, RotateCcw } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Clock } from "./clock";

export async function Navbar() {

    return (
        <header className="bg-card border-b border-background sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center space-x-2 flex-1">
                    <Button
                        variant="ghost" size="icon">
                        <Info />
                        <span className="sr-only">Info</span>
                    </Button>
                    <Button
                        variant="ghost" size="icon">
                        <Folder />
                        <span className="sr-only">Projects</span>
                    </Button>
                    <Button
                        variant="ghost" size="icon">
                        <Github />
                        <span className="sr-only">Github</span>
                    </Button>
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