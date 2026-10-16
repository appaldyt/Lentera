import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const pic = searchParams.get("pic");

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { picName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (pic && pic !== "ALL") {
      where.picName = pic;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        subtasks: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Gagal mengambil data tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      status = "TODO",
      priority = "MEDIUM",
      category = "Umum",
      startDate,
      dueDate,
      picName,
      picNik,
      linkOutput,
      subtasks = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Judul tugas wajib diisi" }, { status: 400 });
    }

    // Get the highest order in this status column
    const highestTask = await prisma.task.findFirst({
      where: { status },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (highestTask?.order ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status,
        priority,
        category: category?.trim() || "Umum",
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        picName: picName?.trim() || null,
        picNik: picNik?.trim() || null,
        linkOutput: linkOutput?.trim() || null,
        order: nextOrder,
        subtasks: {
          create: subtasks
            .filter((st: any) => (typeof st === "string" ? st.trim() : st?.title?.trim()))
            .map((st: any, index: number) => ({
              title: typeof st === "string" ? st.trim() : st.title.trim(),
              isCompleted: typeof st === "object" ? !!st.isCompleted : false,
              order: index,
            })),
        },
      },
      include: {
        subtasks: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Gagal membuat task baru" }, { status: 500 });
  }
}
