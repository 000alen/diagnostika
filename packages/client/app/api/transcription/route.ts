import { z } from "zod";
import OpenAI, { toFile } from "openai";
import { createAsyncCaller } from "@/trpc/routers/app";

const openai = new OpenAI();

const formDataSchema = z.object({
  id: z.string(),
});

export const maxDuration = 60;

export const POST = async (request: Request) => {
  const trpc = await createAsyncCaller();

  const formData = await request.formData();

  const result = formDataSchema.safeParse({
    id: formData.get("id"),
  });

  if (!result.success)
    return new Response("Boo", {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });

  const blob = formData.get("audio") as Blob;
  if (!blob) return new Response("No audio", { status: 400 });

  const mimeType = blob.type.split(";")[0];
  const extension = mimeType.split("/")[1];

  const file = await toFile(blob, `audio.${extension}`, {
    type: mimeType,
  });

  const { text } = await openai.audio.transcriptions.create({
    file,
    language: "es",
    model: "whisper-1",
    response_format: "verbose_json",
  });

  await trpc.buildGraph({
    id: result.data.id,
    snapshot: {
      t: new Date(),
      descriptions: [text],
      exams: [],
    },
  });

  return new Response(JSON.stringify(text), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
