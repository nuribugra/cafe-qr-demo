import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Next.js 16 renamed "middleware" to "proxy" — same mechanism, runs before
// routes are rendered. See node_modules/next/dist/docs/.../proxy.md.
export const config = {
  matcher: ["/admin/:path*", "/api/menu"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/api/menu") {
    // The public menu (customer view + the admin panel's initial load) reads
    // via GET with no auth required; every other method needs a session.
    // (route.ts re-checks this too — see the comment there on why.)
    if (request.method === "GET" || isAuthed) return NextResponse.next();
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (pathname === "/admin/login") {
    // Already logged in? Skip straight to the panel instead of the form.
    if (isAuthed) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  // Every other /admin/* page requires a session.
  if (!isAuthed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}
