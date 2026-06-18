/**
 * Initialize test user using better-auth's internal API
 * Run with: node --import ./scripts/init-user.mjs
 */
import { createAuth } from "../packages/auth/src/index.ts";
import { createDb } from "../packages/db/src/index.ts";
import { user, account } from "../packages/db/src/schema/auth.ts";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/lib/utils.js";

const db = createDb();

async function initUser() {
  const email = "admin@example.com";
  const password = "admin123456";
  const name = "Admin";

  // Check if user exists
  const existingUsers = db.select().from(user).where(eq(user.email, email)).all();

  if (existingUsers.length > 0) {
    console.log(`User ${email} already exists`);
    // Update password if needed
    const hashedPassword = await hashPassword(password);
    db.update(account)
      .set({ password: hashedPassword })
      .where(eq(account.userId, existingUsers[0].id))
      .run();
    console.log(`Password updated`);
    return;
  }

  // Create user
  const userId = crypto.randomUUID();
  const now = Date.now();
  const hashedPassword = await hashPassword(password);

  db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    role: "admin",
    createdAt: new Date(now),
    updatedAt: new Date(now),
  }).run();

  db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: email,
    providerId: "credential",
    userId,
    password: hashedPassword,
    createdAt: new Date(now),
    updatedAt: now,
  }).run();

  console.log(`User created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

initUser().catch(console.error);
