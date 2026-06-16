import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { code, name, category, level, definition } = body;

    const competency = await prisma.competency.update({
      where: { id },
      data: {
        code,
        name,
        category,
        level,
        definition,
      },
    });

    return NextResponse.json(competency);
  } catch (error: any) {
    console.error("Error updating competency:", error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "ID (Kode) Kompetensi sudah digunakan." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update competency" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.competency.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting competency:", error);
    return NextResponse.json({ error: "Failed to delete competency" }, { status: 500 });
  }
}
