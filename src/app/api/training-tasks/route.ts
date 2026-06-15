import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const tasks = await prisma.trainingPreparation.findMany({
      include: {
        training: {
          select: {
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching training tasks:", error);
    return NextResponse.json({ error: "Gagal mengambil data tasks" }, { status: 500 });
  }
}
