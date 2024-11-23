"use client";
//
import Image from "next/image";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Button } from "@nextui-org/button";
import { Badge } from "@nextui-org/badge";
import { Bell } from 'lucide-react';
//
import OverviewTab from "../components/tabs/overview";
import PatientsTab from "../components/tabs/patients";
import DiagnosticsTab from "../components/tabs/diagnostics";
import SettingsTab from "../components/tabs/settings";
import avatar from "../assets/avatar.png";
import layout from "./page.module.scss";

const tabs = [
  { name: "Overview", content: <OverviewTab /> },
  { name: "Patients", content: <PatientsTab /> },
  { name: "Diagnostics", content: <DiagnosticsTab /> },
  { name: "Settings", content: <SettingsTab/> }
];

const ReviewerDashboard = () => {
  return (
    <main className={layout.main}>
      <header>
        <div>
          <h1>ProHealth</h1>
        </div>
        <div>
          <Button radius="full" isIconOnly className="h-[60px] w-[60px] bg-white">
            <Badge color="danger" shape="circle" content={1}>
              <Bell color="#1e1e1e" />
            </Badge>
          </Button>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Image
                src={avatar}
                alt="Avatar"
                width={60}
                height={60}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">william@hospital.cl</p>
              </DropdownItem>
              <DropdownItem key="logout" color="danger">
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>
      <Tabs aria-label="Reviewer Dashboard" className={layout.tabs}  radius="full" color="white">
        {tabs.map((tab) => (
          <Tab key={tab.name} title={tab.name}>
            {tab.content}
          </Tab>
        ))}
      </Tabs>
    </main>
  );
}

export default ReviewerDashboard;
