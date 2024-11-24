import { createCallerFactory, procedure, router } from "@/trpc/trpc";
import { createContext } from "@/trpc/context";
import { z } from "zod";
import {
  Snapshot,
  buildGraph,
  sonnet,
  titanEmbeddings,
  Models,
} from "@bananus/g";

const models: Models = {
  language: sonnet,
  embedding: titanEmbeddings,
};

export const appRouter = router({
  buildGraph: procedure
    .input(
      z.object({
        id: z.string(),
        snapshot: Snapshot,
      })
    )
    .mutation(async ({ input: { id, snapshot } }) => {
      console.log("Building graph for", id);

      const { symptoms, graph } = await buildGraph(models, [snapshot]);

      return {
        id,
        symptoms,
        graph,
      };
    }),
});

export const createCaller = createCallerFactory(appRouter);

export const createAsyncCaller = async () => {
  const context = await createContext();
  return createCaller(context);
};

export type AppRouter = typeof appRouter;
