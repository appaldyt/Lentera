import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return Response.json(
      { error: "Email dan password wajib diisi" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "SUPER_ADMIN" | "ADMIN" | "USER",
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}
