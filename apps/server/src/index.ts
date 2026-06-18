import "dotenv/config";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@x-workflow/api/context";
import { appRouter } from "@x-workflow/api/routers/index";
import { auth } from "@x-workflow/auth";
import { env } from "@x-workflow/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Sign-up endpoint using better-auth handler
app.post("/api/sign-up", async (c) => {
  const body = await c.req.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    // Forward to better-auth's sign-up handler
    const response = await auth.api.signUpEmail({
      body: { email, password, name },
    } as any);

    if ((response as any).status === false) {
      return c.json({ error: (response as any).message || "Signup failed" }, 400);
    }

    return c.json({ success: true, user: (response as any).user });
  } catch (error: any) {
    console.error("Sign-up error:", error);
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

import { serve } from "@hono/node-server";

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
