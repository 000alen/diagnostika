"use client";
//
import Image from "next/image";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Button } from "@nextui-org/button";
import { Badge } from "@nextui-org/badge";
import { Bell } from 'lucide-react';
//
import OverviewTab from "../components/tabs/overview";
import PatientsTab from "../components/tabs/patients";
import DiagnosticsTab from "../components/tabs/diagnostics";
import avatar from "../assets/avatar.png";
import layout from "./page.module.scss";

import {Input} from "@nextui-org/input";

const SettingsTab = () => {
  return (
    <div className={layout.settingsTab}>
      <h2>Account Settings</h2>
      <div className={layout.card}>
        <form className={layout.form}>
          <div className={layout.formGroup}>
          <Input
            type="email"
            label="Email"
            defaultValue="cxrlos@kenobi.dev"
            className="max-w-xs"
          />
          </div>
          <div className={layout.formGroup}>
          <Input
            type="email"
            label="Email"
            defaultValue="cxrlos@kenobi.dev"
            className="max-w-xs"
          />
          </div>
          <div className={layout.formGroup}>
            <label htmlFor="birthdate">Date of Birth</label>
            <Input id="birthdate" type="date" />
          </div>
          <div className={layout.formGroup}>
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div className={layout.formButtons}>
            <Button color="primary" radius="full">
              Save Changes
            </Button>
            <Button color="secondary" radius="full" variant="ghost">
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


const tabs = [
  { name: "Overview", content: <OverviewTab /> },
  { name: "Patients", content: <PatientsTab /> },
  { name: "Diagnostics", content: <DiagnosticsTab /> },
  { name: "Settings", content: <SettingsTab/> },
];

const ReviewerDashboard = () => {
  return (
    <main className={layout.main}>
      <header>
        <div>
          <h1>ProHealth</h1>
        </div>
        <div>
          <Button radius="full" isIconOnly>
            <Badge color="danger" shape="circle" content={1}>
              <Bell color="#1e1e1e" />
            </Badge>
          </Button>
          <Image
            src={avatar}
            alt="Avatar"
            width={60}
            height={60}
          />
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
