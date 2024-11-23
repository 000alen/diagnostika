import Image from "next/image";
import { Button } from "@nextui-org/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

import avatar from "@/assets/avatar.png";
import layout from "./page.module.scss";

export default async function CardsPage({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = await params;

  return (
    <main className={layout.main}>
      <section className={layout.wrapper}>
        <div className={layout.card}>
          <div>
            <Image src={avatar} alt="avatar" height={65} width={60} />
            <p>William ({evaluationId})</p>
          </div>
          <h1>¿Está experimentando dificultad para respirar?</h1>
          <div>
            <Button size="lg">
              <ThumbsUp className="w-6 h-6 mr-1" />
              Sí
            </Button>
            <Button size="lg">
              <ThumbsDown className="w-6 h-6 mr-1" />
              No
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
