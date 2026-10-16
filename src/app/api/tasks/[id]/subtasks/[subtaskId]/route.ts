import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const { subtaskId } = await params;
    const body = await request.json();

    const data: any = {};
    if (body.isCompleted !== undefined) data.isCompleted = !!body.isCompleted;
    if (body.title !== undefined) data.title = body.title.trim();

    const subtask = await prisma.taskSubtask.update({
      where: { id: subtaskId },
      data,
    });

    return NextResponse.json({ subtask });
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json({ error: "Gagal memperbarui subtask" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const { subtaskId } = await params;
    await prisma.taskSubtask.delete({
      where: { id: subtaskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return NextResponse.json({ error: "Gagal menghapus subtask" }, { status: 500 });
  }
}
