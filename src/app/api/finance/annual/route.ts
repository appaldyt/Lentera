import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const annualBudgets = await prisma.annualBudget.findMany({
      orderBy: { year: "desc" },
    });
    return NextResponse.json({ annualBudgets });
  } catch (error) {
    console.error("GET Annual Budgets Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { year, approvedDate, amount, link, notes } = body;

    // Check if year already exists
    const existing = await prisma.annualBudget.findUnique({
      where: { year },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Anggaran untuk tahun ini sudah ada." },
        { status: 400 }
      );
    }

    const budget = await prisma.annualBudget.create({
      data: {
        year,
        approvedDate: approvedDate || "",
        amount: Number(amount) || 0,
        link: link || "",
        notes: notes || "",
      },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error("POST Annual Budget Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
