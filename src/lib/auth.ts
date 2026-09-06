import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "admin_session";
const SESSION_DURATION = "12h";
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Missing ADMIN_SESSION_SECRET. Generate one with " +
        "`node scripts/generate-session-secret.mjs` and add it to your env vars."
    );
  }
  return new TextEncoder().encode(secret);
}

/** Signs a short-lived admin session token. */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSessionSecret());
}

/**
 * Verifies a session token, returning whether it's a valid, unexpired admin
 * session. Any failure (missing token, bad signature, expired, missing
 * ADMIN_SESSION_SECRET) resolves to `false` rather than throwing — callers
 * should always fail closed to "not authenticated".
 */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/** Convenience wrapper for checking a request's session cookie directly. */
export async function isRequestAuthed(request: NextRequest): Promise<boolean> {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

/** Verifies a plaintext password against the configured bcrypt hash. */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error(
      "Missing ADMIN_PASSWORD_HASH. Generate one with " +
        "`node scripts/hash-password.mjs <password>` and add it to your env vars."
    );
  }
  return bcrypt.compare(password, hash);
}
