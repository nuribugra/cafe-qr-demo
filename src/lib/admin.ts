/**
 * Shared admin-auth constants. This is a simple PIN gate meant for a single
 * café's staff, not a real auth system — the PIN is visible in the client
 * bundle and sent as a plain header. Override the default via a
 * NEXT_PUBLIC_ADMIN_PIN env var if you want to change it without editing code.
 */
export const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "1234";

/** Header the client sends on every mutating /api/menu request. */
export const ADMIN_PIN_HEADER = "x-admin-pin";

/** sessionStorage key used to remember a successful PIN entry for the tab session. */
export const ADMIN_SESSION_KEY = "cafe-admin-authed";
