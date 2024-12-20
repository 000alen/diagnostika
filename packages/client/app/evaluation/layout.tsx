/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { ArrowUpRight } from "lucide-react";

import avatar from "@/assets/avatar.png";
import layout from "./[evaluationId]/page.module.scss";

export default function Layout({ children }: { children: any }) {
  return (
    <main className={layout.main}>
      <header>
        <div>
          <Button>
            Mis pacientes
            <ArrowUpRight />
          </Button>
        </div>
        <div>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Image src={avatar} alt="Avatar" width={60} height={60} />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile actions" variant="flat">
              <DropdownItem key="profile" className="gap-2 h-14">
                <p className="font-semibold">Iniciar sesión como</p>
                <p className="font-semibold">usuario@invitado.com</p>
              </DropdownItem>
              <DropdownItem key="settings">Mis ajustes</DropdownItem>
              <DropdownItem key="logout" color="danger">
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>
      {children}
    </main>
  );
}
