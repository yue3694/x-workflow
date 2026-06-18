import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@x-workflow/api/routers/index";

export const trpc = createTRPCReact<AppRouter>();
