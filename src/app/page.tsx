import VrmViewer from "@/components/vrm-viewer";

export default function Home() {
  return (
    <div className="flex-1 overflow-auto bg-pattern">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <VrmViewer />
      </main>
    </div>
  );
}
