import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {};
    if (year) where.year = year;

    const entries = await prisma.selfLearning.findMany({
      where,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    });

    return Response.json({ entries });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nik, name, department, year, platform, hours } = await request.json();

    if (!nik || !name || !hours) {
      return Response.json({ error: "NIK, Nama, dan Total Jam wajib diisi" }, { status: 400 });
    }

    const entry = await prisma.selfLearning.create({
      data: {
        nik,
        name,
        department: department ?? "",
        year: year ?? "",
        platform: platform ?? "",
        hours: parseFloat(hours) || 0,
      },
    });

    return Response.json({ entry }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
