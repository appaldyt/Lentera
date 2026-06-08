import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { approvedDate, amount, link, notes, year } = body;

    const budget = await prisma.annualBudget.update({
      where: { id: id },
      data: {
        ...(year ? { year: year } : {}),
        approvedDate: approvedDate || "",
        amount: Number(amount) || 0,
        link: link || "",
        notes: notes || "",
      },
    });

    return NextResponse.json({ budget });
  } catch (error: any) {
    console.error("PUT Annual Budget Error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Anggaran untuk tahun tersebut sudah ada." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.annualBudget.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Annual Budget Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
