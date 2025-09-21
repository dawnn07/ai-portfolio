import TerminalChat from "@/components/chat";
import { Navbar } from "@/components/navbar";
import VrmViewer from "@/components/vrm-viewer";


export default async function Home() {

  return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
    <div className="flex-1 overflow-auto bg-pattern">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <VrmViewer />
        <div className="absolute w-full sm:w-fit sm:right-4 sm:bottom-4 bottom-0 flex pt-4 z-20">
          <TerminalChat />
        </div>
      </main>
    </div>
    </div>
  );
}
