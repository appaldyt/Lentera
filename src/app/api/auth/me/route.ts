import { type NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return Response.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({
    user: {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
  });
}
