import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const competencies = await prisma.competency.findMany({
      orderBy: { code: 'asc' }
    });
    return NextResponse.json(competencies);
  } catch (error) {
    console.error("Error fetching competencies:", error);
    return NextResponse.json({ error: "Failed to fetch competencies" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, category, level, definition } = body;

    const competency = await prisma.competency.create({
      data: {
        code,
        name,
        category,
        level,
        definition,
      },
    });

    return NextResponse.json(competency, { status: 201 });
  } catch (error: any) {
    console.error("Error creating competency:", error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "ID (Kode) Kompetensi sudah digunakan." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create competency" }, { status: 500 });
  }
}
