#!/usr/bin/env node
// Generates a random secret used to sign admin session tokens.
//
// Usage: node scripts/generate-session-secret.mjs

import { randomBytes } from "node:crypto";

const secret = randomBytes(32).toString("base64");

console.log("\nAdd this to your env vars as ADMIN_SESSION_SECRET:\n");
console.log(secret);
console.log();
