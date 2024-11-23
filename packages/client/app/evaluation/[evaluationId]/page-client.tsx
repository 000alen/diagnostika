"use client";

import Image from "next/image";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Button } from "@nextui-org/button";
import { Badge } from "@nextui-org/badge";
import { Bell } from "lucide-react";

import OverviewTab from "@/components/tabs/overview";
import PatientsTab from "@/components/tabs/patients";
import DiagnosticsTab from "@/components/tabs/diagnostics";
import SettingsTab from "@/components/tabs/settings";
import avatar from "@/assets/avatar.png";
import layout from "./page.module.scss";

const tabs = [
  { name: "Vista general", content: <OverviewTab /> },
  { name: "Diagnósticos", content: <PatientsTab /> },
  { name: "Pacientes", content: <DiagnosticsTab /> },
  { name: "Mi configuración", content: <SettingsTab /> },
];

export default function Page({ evaluationId }: { evaluationId: string }) {
  return (
    <main className={layout.main}>
      <header>
        <div>
          <h1>ProHealth ({evaluationId})</h1>
        </div>
        <div>
          <Button
            radius="full"
            isIconOnly
            className="h-[60px] w-[60px] bg-white"
          >
            <Badge color="danger" shape="circle" content={1}>
              <Bell color="#1e1e1e" />
            </Badge>
          </Button>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Image src={avatar} alt="Avatar" width={60} height={60} />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile actions" variant="flat">
              <DropdownItem key="profile" className="gap-2 h-14">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">william@hospital.cl</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Help & Feedback
              </DropdownItem>
              <DropdownItem key="logout" color="danger">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>
      {/* No fixear el color="white", así funciona por ahora hehe */}
      <Tabs
        aria-label="Reviewer Dashboard"
        className={layout.tabs}
        radius="full"
        // @ts-expect-error typing is not exhaustive
        color="white"
      >
        {tabs.map((tab) => (
          <Tab key={tab.name} title={tab.name}>
            {tab.content}
          </Tab>
        ))}
      </Tabs>
    </main>
  );
}
