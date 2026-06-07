import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nik, name, department, year, platform, hours } = await request.json();

    if (!nik || !name || !hours) {
      return Response.json({ error: "NIK, Nama, dan Total Jam wajib diisi" }, { status: 400 });
    }

    const entry = await prisma.selfLearning.update({
      where: { id },
      data: {
        nik,
        name,
        department: department ?? "",
        year: year ?? "",
        platform: platform ?? "",
        hours: parseFloat(hours) || 0,
      },
    });

    return Response.json({ entry });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.selfLearning.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
