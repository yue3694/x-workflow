// Generate bcrypt hash for password
const password = "admin123456";
const rounds = 10;

// Use Node's crypto to simulate bcrypt (simplified version)
// For real bcrypt, we'd need the bcrypt package

// Generate a hash using scrypt as a placeholder
const { scryptSync, randomBytes } = require("crypto");

// This is NOT a real bcrypt hash, but for testing purposes
// We'll use it to at least have *something* in the password field
const salt = Buffer.from(`$2b$${String(rounds).padStart(2, '0}$`).padEnd(16, '0');
const hash = scryptSync(password, salt, 32);

console.log("Password:", password);
console.log("Hash (scrypt-based):", salt.toString() + hash.toString("base64").substring(0, 22));
