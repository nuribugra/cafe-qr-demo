#!/usr/bin/env node
// Hashes an admin password for storage in ADMIN_PASSWORD_HASH. Run locally —
// the plaintext password never leaves your machine.
//
// Usage: node scripts/hash-password.mjs "your-chosen-password"

import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <your-password>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Choose a password with at least 8 characters.");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

// Next.js expands unescaped "$VAR" references when it parses a .env FILE,
// and a bcrypt hash is full of "$" — without escaping, it silently mangles
// the value into something that will never match. This only applies to
// .env files; Vercel's dashboard (and `vercel env add`) stores values
// literally, with no expansion, so use the raw hash there instead.
const escapedForDotenvFile = hash.replaceAll("$", "\\$");

console.log("\nADMIN_PASSWORD_HASH — use the version matching where you're pasting it:\n");
console.log(`In a .env / .env.local FILE:  ADMIN_PASSWORD_HASH=${escapedForDotenvFile}`);
console.log(`In the Vercel dashboard UI:   ${hash}`);
console.log();
