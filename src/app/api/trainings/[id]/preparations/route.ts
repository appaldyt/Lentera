import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string }> };

// Bulk replace all preparations for a training
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { preparations } = await request.json();

  if (!Array.isArray(preparations)) {
    return Response.json({ error: "preparations harus berupa array" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.trainingPreparation.deleteMany({ where: { trainingId: id } });
    if (preparations.length > 0) {
      await tx.trainingPreparation.createMany({
        data: preparations.map((p) => ({
          trainingId: id,
          activityName: p.activityName,
          category: p.category,
          dueDate: parseDate(p.dueDate)!,
          priority: p.priority ?? "Normal",
          pic: p.pic,
          team: p.team,
          isCompleted: p.isCompleted ?? false,
          progress: p.progress ?? "0%",
          linkOutput: p.linkOutput && p.linkOutput !== "-" ? p.linkOutput : null,
          note: p.note ?? null,
        })),
      });
    }
  });

  const newPreps = await prisma.trainingPreparation.findMany({
    where: { trainingId: id },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({
    preparations: newPreps.map((p) => ({
      id: p.id,
      activityName: p.activityName,
      category: p.category,
      dueDate: formatDate(p.dueDate),
      priority: p.priority,
      pic: p.pic,
      team: p.team,
      isCompleted: p.isCompleted,
      progress: p.progress,
      linkOutput: p.linkOutput ?? "-",
      note: p.note ?? "",
    })),
  });
}
