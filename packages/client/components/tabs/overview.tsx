"use client";
//
import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from "@client/components/ui/resizable";
//
import { NodesComponent } from "../viz/nodes";
import { BentoGridSide } from "../viz/bento";
import layout from "./overview.module.scss";

const OverviewTab = () => {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <div>
          <h1 className="text-4xl font-bold mb-3">Vista General</h1>
          <h2 className="text-5xl">Marcelo Lemus</h2>
          <div className={layout.graphs}>
            <NodesComponent />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle className="ml-3 mr-3" />
      <ResizablePanel>
        <BentoGridSide />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default OverviewTab;
