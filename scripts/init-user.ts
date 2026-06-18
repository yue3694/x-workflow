/**
 * Initialize test user - direct DB insert with bcrypt password
 * Usage: npx tsx scripts/init-user.ts
 */
import "dotenv/config";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./packages/db/src/schema/auth";
import { hash } from "bcryptjs";

const dbPath = "./packages/db/data.db";

async function initUser() {
  const email = "admin@example.com";
  const password = "admin123456";
  const name = "Admin";

  const db = drizzle(new Database(dbPath), { schema });

  // Check if user exists
  const existingUsers = db.select().from(schema.user).where(eq(schema.user.email, email))).all();

  if (existingUsers.length > 0) {
    console.log(`User ${email} already exists`);
    const hashedPassword = await hash(password, 10);

    // Check if account exists
    const existingAccount = db.select().from(schema.account).where(eq(schema.account.userId, existingUsers[0].id)).all();

    if (existingAccount.length > 0) {
      db.update(schema.account)
        .set({ password: hashedPassword, updatedAt: Date.now() })
        .where(eq(schema.account.userId, existingUsers[0].id))
        .run();
      console.log(`Password updated`);
    } else {
      db.insert(schema.account).values({
        id: crypto.randomUUID(),
        accountId: email,
        providerId: "credential",
        userId: existingUsers[0].id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).run();
      console.log(`Account created with password`);
    }
    return;
  }

  // Hash password
  const hashedPassword = await hash(password, 10);

  // Create user
  const userId = crypto.randomUUID();
  const now = new Date();

  db.insert(schema.user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  }).run();

  db.insert(schema.account).values({
    id: crypto.randomUUID(),
    accountId: email,
    providerId: "credential",
    userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  }).run();

  console.log(`User created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

initUser().catch(console.error);
