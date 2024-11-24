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
      <div className={layout.gridRow} style={{ marginBottom: 24}}>
        <div className={layout.gridCardTypeD}>
        </div>
        <div className={layout.gridCardTypeC}>
          <Button size="lg" radius="full" isIconOnly>
            <ArrowIcon />
          </Button>
          <span>Scan <br/>Cardiology</span>
          <p>1,276</p>
        </div>
      </div>
      <div className={layout.gridRow}>
        <div className={layout.gridCardTypeA}>
          <div>
            <Image src={avatar} alt="avatar" height={35} width={45} />
            <p>William ({1})</p>
          </div>
          <div className={layout.biometric}>
            <p>Heart Rate</p>
            <span>110 bpm</span>
          </div>
          <div className={layout.biometric}>
            <p>Temperatura</p>
            <span>34.7°C</span>
          </div>
          <div className={layout.biometric}>
            <p>SpO2</p>
            <span>96%</span>
          </div>
          <Button size="lg" radius="full" isIconOnly onClick={goToPerfilPaciente}>
            <ArrowIcon />
          </Button>
        </div>
        <div className={layout.gridCardTypeB}>
          <div>
            <div className="flex items-center w-fit px-3 py-1 mb-1 rounded-full backdrop-filter backdrop-blur-sm bg-white/15 text-sm font-light select-none border-1 border-[#8D959D] tracking-wider">
              87% probable
            </div>
            <span>Osteoporosis</span>
          </div>
          <Button size="lg" radius="full" isIconOnly onClick={goToPerfilPaciente}>
            <ArrowIcon />
          </Button>
        </div>
      </div>
    </>
  );
}