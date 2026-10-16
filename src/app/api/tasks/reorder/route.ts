import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body; // Array of { id: string, status: string, order: number }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Data item reorder tidak valid" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.task.update({
          where: { id: item.id },
          data: {
            status: item.status,
            order: item.order,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    console.error("Error batch reordering tasks:", error);
    return NextResponse.json({ error: "Gagal memperbarui urutan task" }, { status: 500 });
  }
}
