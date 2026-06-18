import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@x-workflow/api/routers/index";
import { getBaseUrl } from "./utils";

export function createClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/trpc`,
      }),
    ],
  });
}

// Create the base client
export const trpc = createClient();