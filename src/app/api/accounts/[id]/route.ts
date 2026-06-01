import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/api-utils";

function serializeUser(u: {
  id: string; name: string; email: string; role: string;
  status: string; lastLogin: Date | null; createdAt: Date;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    lastLogin: u.lastLogin
      ? u.lastLogin.toISOString().slice(0, 16).replace("T", " ")
      : "-",
    createdAt: formatDate(u.createdAt) ?? "",
  };
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, email, password, role, status } = await request.json();

    if (!name || !email) {
      return Response.json({ error: "Nama dan email wajib diisi" }, { status: 400 });
    }

    const conflict = await prisma.user.findFirst({
      where: { email, NOT: { id } },
    });
    if (conflict) {
      return Response.json({ error: "Email sudah digunakan akun lain" }, { status: 409 });
    }

    const data: Record<string, unknown> = { name, email, role, status };
    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, role: true,
        status: true, lastLogin: true, createdAt: true,
      },
    });

    return Response.json({ account: serializeUser(user) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
