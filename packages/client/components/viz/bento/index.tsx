"use client";
//
import { FC } from "react";
import Image from "next/image";
import { Button } from "@nextui-org/button";
import { ArrowUpRight as ArrowIcon } from "lucide-react";
//
import avatar from "@/assets/avatar.png";
import layout from "./index.module.scss";

interface Props {
  patientName: string;
  diagnosis: {
    name: string;
    description: string;
  } | null;
  symptoms: any[]; // eslint-disable-line
}

export const BentoGridSide: FC<Props> = ({ patientName, diagnosis, symptoms }) => {
  console.info("[dev] received diagnosis", diagnosis);
  console.info("[dev] received symptoms", symptoms);

  const symptomsLength = symptoms.length ?? 0; 

  return (
    <>
      <div className={layout.gridRow} style={{ marginBottom: 24 }}>
        {(symptoms && symptoms.length > 0) ? (
          symptoms.map((symptom, index) => (
            <>
              <div key={index} className={`${layout.gridCardTypeD} flex flex-col items-center justify-items-center`}>
                <span className="font-bold mt-4 text-left w-[100%]">
                  {symptom.name}
                </span>
                <p>
                  {symptom.description}
                </p>
              </div>
              <div className={layout.gridCardTypeC}>
                <Button size="lg" radius="full" isIconOnly>
                  <ArrowIcon />
                </Button>
                <span>
                  Cantidad <br />
                  de síntomas
                </span>
                <p>{symptomsLength}</p>
              </div>
            </>
          ))
        ) : (
          <div className={`${layout.gridCardTypeD} flex flex-col items-center justify-items-center`}>
            <span className="font-bold mt-4 text-left w-[100%]">
              No se encontraron síntomas
            </span>
            <p>
              No se encontraron síntomas
            </p>
          </div>
        )}
        {/* <div className={`${layout.gridCardTypeD} flex flex-col items-center justify-items-center`}>
          <span className="font-bold mt-4 text-left w-[100%]">
            {symptoms[0].name}
          </span>
          <p>
            {symptoms[0].description}
          </p>
        </div>
        {symptomsList.length > 1 && (
          <div className={layout.gridCardTypeD}>
            <span className="font-bold mt-4 text-left w-[100%]">
              {symptoms[1].name}
            </span>
            <p>
              {symptoms[1].description}
            </p>
          </div>
        )} */}
        <div className={layout.gridCardTypeC}>
          <Button size="lg" radius="full" isIconOnly>
            <ArrowIcon />
          </Button>
          <span>
            Cantidad <br />
            de síntomas
          </span>
          <p>{symptomsLength}</p>
        </div>
      </div>
      <div className={layout.gridRow}>
        <div className={layout.gridCardTypeA}>
          <div>
            <Image src={avatar} alt="avatar" height={35} width={45} />
            <p>{patientName}</p>
          </div>
          <div className={layout.biometric}>
            <p>Síntomas</p>
            <span>{symptoms!.length ?? 0}</span>
          </div>
          <div className={layout.biometric}>
            <p>Temperatura</p>
            <span>34.7°C</span>
          </div>
          <div className={layout.biometric}>
            <p>SpO2</p>
            <span>96%</span>
          </div>
          <Button size="lg" radius="full" isIconOnly>
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
          <Button size="lg" radius="full" isIconOnly>
            <ArrowIcon />
          </Button>
        </div>
      </div>
    </>
  );
};
