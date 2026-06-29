import { type NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { jwtVerify } from "jose";

const EVALUASI_JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_lentera_key_2026"
);

const PROTECTED_PATHS = [
  "/dashboard",
  "/training",
  "/learning-hours",
  "/calendar",
  "/licenses",
  "/employees",
  "/finance",
  "/rooms",
  "/accounts",
  "/settings",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from the login page
  if (pathname === "/" && token) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // --- EVALUASI MODULE AUTHENTICATION ---
  // Protect /evaluasi/* except for /evaluasi/login
  if (pathname.startsWith("/evaluasi") && !pathname.startsWith("/evaluasi/login")) {
    const evaluasiToken = request.cookies.get("session_token")?.value;

    if (!evaluasiToken) {
      return NextResponse.redirect(new URL("/evaluasi/login", request.url));
    }

    try {
      // Verify JWT
      await jwtVerify(evaluasiToken, EVALUASI_JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL("/evaluasi/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|aviation_bg.png).*)"],
};
