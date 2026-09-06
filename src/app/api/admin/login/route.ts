import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionToken,
  verifyPassword,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";
import { getLoginRateLimit, getClientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login — checks the password against ADMIN_PASSWORD_HASH
 * and, if it matches, issues an HttpOnly session cookie. Rate-limited per IP
 * to blunt brute-force attempts. Returns a stable error `code` (not raw
 * English text) so the client can show a localized message.
 */
export async function POST(req: NextRequest) {
  const { success } = await getLoginRateLimit().limit(getClientIp(req));
  if (!success) {
    return NextResponse.json({ code: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = await verifyPassword(parsed.data.password);
  } catch {
    return NextResponse.json({ code: "server_error" }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ code: "incorrect_password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.json({ ok: true });
}
