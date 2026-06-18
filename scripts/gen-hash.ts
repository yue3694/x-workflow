/**
 * Generate bcrypt hash for password
 * Usage: npx tsx scripts/gen-hash.ts
 */
import { hash } from "../packages/auth/node_modules/bcryptjs/dist/bcrypt.js";

async function main() {
  const password = "admin123456";
  const rounds = 10;

  const hashed = await hash(password, rounds);
  console.log("Password:", password);
  console.log("Hash:", hashed);
}

main();
