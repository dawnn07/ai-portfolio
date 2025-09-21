"use client";

import { Button } from "@/components/ui/button";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { RotateCcw } from "lucide-react";
import { useContext } from "react";

export function ReloadToggle() {
  const {viewer} = useContext(ViewerContext);

  return (
    <Button
      onClick={() => {
        viewer.playAnimation("./VRMA_04.vrma")
      }}
      variant="ghost" size="icon">
      <RotateCcw className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all active:rotate-[360deg]" />
      <span className="sr-only">Refresh</span>
    </Button>
  );
}
