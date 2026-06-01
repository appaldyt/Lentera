import { type NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|aviation_bg.png).*)"],
};
