import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string }> };

function serializeFull(t: Awaited<ReturnType<typeof fetchOne>>) {
  if (!t) return null;
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    jobFamilies: t.jobFamilies,
    classification: t.classification,
    trainingType: t.trainingType,
    organizer: t.organizer,
    room: t.room,
    startDate: formatDate(t.startDate),
    endDate: formatDate(t.endDate),
    duration: t.duration,
    cost: t.cost,
    status: t.status,
    preparations: t.preparations.map((p) => ({
      id: p.id,
      activityName: p.activityName,
      category: p.category,
      startDate: p.startDate ? formatDate(p.startDate) : "",
      workHours: p.workHours,
      dueDate: formatDate(p.dueDate),
      priority: p.priority,
      pic: p.pic,
      team: p.team,
      isCompleted: p.isCompleted,
      progress: p.progress,
      linkOutput: p.linkOutput ?? "-",
      note: p.note ?? "",
    })),
    participants: t.participants.map((p) => ({
      id: p.id,
      nik: p.nik,
      name: p.name,
      department: p.department,
      bodLevel: p.bodLevel,
      trainingDate: formatDate(p.trainingDate),
      attendedHours: p.attendedHours,
    })),
  };
}

async function fetchOne(id: string) {
  return prisma.training.findUnique({
    where: { id },
    include: {
      preparations: { orderBy: { order: "asc" } },
      participants: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const training = await fetchOne(id);
  if (!training) return Response.json({ error: "Tidak ditemukan" }, { status: 404 });
  return Response.json({ training: serializeFull(training) });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name, description, jobFamilies, classification, trainingType, organizer, room,
      startDate, endDate, duration, cost, status,
    } = body;

    const training = await prisma.training.update({
      where: { id },
      data: {
        name,
        description: description ?? null,
        jobFamilies: Array.isArray(jobFamilies)
          ? jobFamilies
          : (jobFamilies as string ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
        classification: classification ?? "",
        trainingType,
        organizer,
        room,
        startDate: parseDate(startDate)!,
        endDate: parseDate(endDate),
        duration,
        cost,
        status,
      },
      include: {
        preparations: { orderBy: { order: "asc" } },
        participants: { orderBy: { createdAt: "asc" } },
      },
    });

    return Response.json({ training: serializeFull(training) });
  } catch (error) {
    console.error("PUT /api/trainings/[id] error:", error);
    return Response.json({ error: "Gagal memperbarui data training" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.training.delete({ where: { id } });
  return Response.json({ success: true });
}
