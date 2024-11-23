import type { AppRouter } from "@/trpc/routers/app";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
