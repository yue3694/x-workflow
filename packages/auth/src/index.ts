import { createDb } from "@x-workflow/db";
import * as schema from "@x-workflow/db/schema/auth";
import { env } from "@x-workflow/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendResetPasswordEmail } from "./email";

export function createAuth() {
  const db = createDb();

  // Build social providers only if credentials are configured
  const socialProviders: {
    google?: { clientId: string; clientSecret: string };
    github?: { clientId: string; clientSecret: string };
  } = {};

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    socialProviders.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  }

  const isHttps = env.BETTER_AUTH_URL.startsWith("https://");

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",

      schema: schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPasswordEmail({ to: user.email, resetUrl: url });
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        // "Secure" cookies are silently dropped by browsers over plain HTTP,
        // which breaks session persistence on HTTP-only deployments (e.g. bare IP, no TLS yet).
        sameSite: isHttps ? "none" : "lax",
        secure: isHttps,
        httpOnly: true,
      },
    },
    ...(Object.keys(socialProviders).length > 0 && { socialProviders }),
  });
}

export const auth = createAuth();
