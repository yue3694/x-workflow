/**
 * Create test user using better-auth API
 * Usage: npx tsx scripts/create-test-user.ts
 */
import "dotenv/config";
import { createAuth } from "../packages/auth/src/index.ts";

async function main() {
  const auth = createAuth();

  console.log("Attempting to create user...");

  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: "admin@example.com",
        password: "admin123456",
        name: "Admin",
      },
    } as any);

    console.log("Success!");
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (error: any) {
    console.error("Error:", error.message || error);
    console.error("Full error:", error);
  }
}

main();