"use client";
//
import { Button } from "@nextui-org/button";
import { FileTextIcon, Search, MoveUpRight } from "lucide-react";
//
import { NodesComponent } from "../viz/nodes";
import { BentoCard, BentoGrid } from "../ui/bento";
import { Marquee } from "../ui/marquee";
import { cn } from "../../lib/utils";
import layout from "./overview.module.scss";

/** Bento Grid ~ Dummy data  */
const files = [
  {
    name: "bitcoin.pdf",
    body: "Bitcoin is a cryptocurrency invented in 2008 by an unknown person or group of people using the name Satoshi Nakamoto.",
  },
  {
    name: "finances.xlsx",
    body: "A spreadsheet or worksheet is a file made of rows and columns that help sort data, arrange data easily, and calculate numerical data.",
  },
  {
    name: "logo.svg",
    body: "Scalable Vector Graphics is an Extensible Markup Language-based vector image format for two-dimensional graphics with support for interactivity and animation.",
  },
  {
    name: "keys.gpg",
    body: "GPG keys are used to encrypt and decrypt email, files, directories, and whole disk partitions and to authenticate messages.",
  },
  {
    name: "seed.txt",
    body: "A seed phrase, seed recovery phrase or backup seed phrase is a list of words which store all the information needed to recover Bitcoin funds on-chain.",
  },
];
 
const features = [
  {
    Icon: FileTextIcon,
    name: "1",
    description: "We automatically save your files as you type.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: FileTextIcon,
    name: "Dos",
    description: "We automatically save your files as you type.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  }
];


const OverviewTab = () => {
  return (
    <section className={layout.layoutWrapper}>
      <div className={layout.leftWrapper}>
        <div className="m-4">
          <h1 className="text-4xl font-bold mb-3">Vista General</h1>
          <h2 className="text-5xl">Marcelo Lemus</h2>
          <div className={layout.graphs}>
            <NodesComponent />
          </div>
        </div>
      </div>
      <div className={layout.rightWrapper}>
        <div>
          <div className="m-2 bg-white rounded-full p-4 flex items-center" style={{ flex: 3}}>
            <p className="text-xl font-bold p-2 mr-4">Diagnósticos</p>
            <div className="flex gap-2 bg-slate-100 items-center p-2 rounded-full w-full">
              <Search className="ml-2"/>
              <input
                className="bg-slate-100 w-full px-4 py-2 rounded-lg text-gray-600 focus:outline-none"
                type="text"
                name="search-diagnostics"
                placeholder="Buscar ..."
              />
            </div>
          </div>
          <Button style={{flex: 1, backgroundColor: "rgb(0, 98, 241"}} className="text-white rounded-full p-8 font-bold w-35">
            Consultation
            <MoveUpRight/>
          </Button>
        </div>
        <BentoGrid className="w-full">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

export default OverviewTab;
