"use client";
//
import Image from "next/image";
import { Button } from "@nextui-org/button";
import { Badge } from "@nextui-org/badge";
import { Bell, FileTextIcon, Search } from 'lucide-react';
//
import { BentoCard, BentoGrid } from "../components/bento";
import { Marquee } from "../components/marquee";
import { cn } from "../lib/utils";

import avatar from "../assets/avatar.png";
import layout from "./page.module.scss";

// Dummy data

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
    name: "Save your files",
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
    name: "Save your files",
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
  },
  {
    Icon: FileTextIcon,
    name: "Save your files",
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
  }
];
// Ignore above

const subpages = [
  { name: "Overview", onClick: () => {} },
  { name: "Patients", onClick: () => {} },
  { name: "Diagnostics", onClick: () => {} },
  { name: "Settings", onClick: () => {} }
];

const ReviewerDashboard = () => {
  return (
    <main className={layout.main}>
      <header>
        <div>
          <h1>ProHealth</h1>
        </div>
        <div>
          {subpages.map((subpage) => (
            <Button key={subpage.name} onClick={subpage.onClick} radius="full">
              {subpage.name}
            </Button>
          ))}
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

      <section className="grid grid-cols-2 gap-5 mx-[1.5rem]">
        <div className="bg-blue-300"> 
          <div className="m-4">
            <h1 className="text-4xl font-bold"> Overview </h1>
            <h2 className="text-3xl"> Marcelo Lemus </h2>
          </div>
        </div>

        {/* El div de la derecha RGB(0, 98, 241)*/}

        <div>
          <div className="flex items-center">
          <div className="m-2 bg-white rounded-full p-5 flex items-center">
            <p className="text-xl font-bold p-2">Search reviews</p>
            <div className="flex gap-2 bg-slate-100 items-center p-2 rounded-full">
              <Search/>
              <input className="bg-slate-100 w-[14vw]" type="text" name="" placeholder="Search..."/>
            </div>
          </div>          
          <Button style={{backgroundColor: "rgb(0, 98, 241"}} className="text-white rounded-full p-8 font-bold"> Consultation </Button>
        </div>



        
        <BentoGrid className="w-full ">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
        </div>
      </section>

    </main>
  );
}

export default ReviewerDashboard;