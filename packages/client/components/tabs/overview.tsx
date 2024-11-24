"use client";
//
import { FC, Dispatch, SetStateAction } from "react";
import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from "@client/components/ui/resizable";
//
import { NodesComponent } from "../viz/nodes";
import { BentoGridSide } from "../viz/bento";
import layout from "./overview.module.scss";

interface Props {
  setActiveTab: Dispatch<SetStateAction<string>>;
}

const OverviewTab: FC<Props> = ({ setActiveTab }) => {
  return (
    <div className={layout.container}>
      <ResizablePanelGroup direction="horizontal" className="pl-5 pr-5">
        <ResizablePanel>
          <div className={layout.leftPanel}>
            <div className={layout.content}>
              <h1 className="text-4xl font-bold mb-1">Vista General</h1>
              <h2 className="text-5xl">Marcelo Lemus</h2>
            </div>
            <div className={layout.graphs}>
              <NodesComponent />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="ml-3 mr-3" />
        <ResizablePanel>
          <BentoGridSide setActiveTab={setActiveTab} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default OverviewTab;
