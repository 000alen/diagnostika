"use client";
//
import Image from "next/image";
import { Button } from "@nextui-org/button";
import { Search } from "lucide-react";
import { ArrowUpRight as ArrowIcon } from 'lucide-react';
//
import avatar from "@/assets/avatar.png";
import layout from "./index.module.scss";

interface Props {
  setActiveTab: (tab: string) => void;
}

export const BentoGridSide = ({ setActiveTab }: Props) => {
  const goToPacientesTab = () => setActiveTab("Pacientes");

  const goToPerfilPaciente = () => {
    // set chosen patient data
    setActiveTab("Pacientes");
  }

  return (
    <>
      <div className={layout.wrapper}>
        <div>
          <p>Diagnósticos</p>
          <div className="flex gap-2 bg-slate-100 items-center p-2 rounded-full">
            <Search className="ml-2"/>
            <input
              className="bg-slate-100 w-full px-1 py-2 rounded-lg text-gray-600 focus:outline-none"
              type="text"
              name="search-diagnostics"
              placeholder="Buscar ..."
            />
          </div>
        </div>
        <Button onClick={goToPacientesTab}>
          Mis pacientes
          <ArrowIcon />
        </Button>
      </div>
      <div className={layout.customGrid}>
        <div className={layout.gridCard}>
          <div>
            <Image src={avatar} alt="avatar" height={35} width={45} />
            <p>William ({1})</p>
          </div>
          <Button size="lg" radius="full" isIconOnly onClick={goToPerfilPaciente}>
            <ArrowIcon />
          </Button>
        </div>
      </div>
    </>
  );
}