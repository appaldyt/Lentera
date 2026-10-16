import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        subtasks: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task detail:", error);
    return NextResponse.json({ error: "Gagal mengambil data task" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: any = {};

    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.status !== undefined) data.status = body.status;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.category !== undefined) data.category = body.category?.trim() || "Umum";
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.picName !== undefined) data.picName = body.picName?.trim() || null;
    if (body.picNik !== undefined) data.picNik = body.picNik?.trim() || null;
    if (body.linkOutput !== undefined) data.linkOutput = body.linkOutput?.trim() || null;
    if (body.order !== undefined) data.order = Number(body.order);

    // If subtasks array is sent for full sync in edit modal
    if (Array.isArray(body.subtasks)) {
      // Delete existing subtasks and recreate
      await prisma.taskSubtask.deleteMany({
        where: { taskId: id },
      });

      data.subtasks = {
        create: body.subtasks
          .filter((st: any) => (typeof st === "string" ? st.trim() : st?.title?.trim()))
          .map((st: any, index: number) => ({
            title: typeof st === "string" ? st.trim() : st.title.trim(),
            isCompleted: typeof st === "object" ? !!st.isCompleted : false,
            order: index,
          })),
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data,
      include: {
        subtasks: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Gagal memperbarui task" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Task berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Gagal menghapus task" }, { status: 500 });
  }
}
