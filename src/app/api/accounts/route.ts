import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/api-utils";

function serializeUser(u: {
  id: string; name: string; email: string; role: string;
  status: string; lastLogin: Date | null; createdAt: Date;
  nik?: string | null;
}) {
  return {
    id: u.id,
    name: u.name,
    nik: u.nik,
    email: u.email,
    role: u.role,
    status: u.status,
    lastLogin: u.lastLogin
      ? u.lastLogin.toISOString().slice(0, 16).replace("T", " ")
      : "-",
    createdAt: formatDate(u.createdAt) ?? "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (role && role !== "ALL") where.role = role;
    if (status && status !== "ALL") where.status = status;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, nik: true, email: true, role: true,
        status: true, lastLogin: true, createdAt: true,
      },
    });

    return Response.json({ accounts: users.map(serializeUser) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, status, nik } = await request.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Nama, email, dan password wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        nik: nik || null,
        password: hashed,
        role: role ?? "USER",
        status: status ?? "AKTIF",
      },
      select: {
        id: true, name: true, nik: true, email: true, role: true,
        status: true, lastLogin: true, createdAt: true,
      },
    });

    return Response.json({ account: serializeUser(user) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
