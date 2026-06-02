import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

function serializeTraining(t: Awaited<ReturnType<typeof fetchTrainings>>[number]) {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    jobFamilies: t.jobFamilies,
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
      trainingDate: formatDate(p.trainingDate),
      attendedHours: p.attendedHours,
    })),
  };
}

async function fetchTrainings() {
  return prisma.training.findMany({
    include: { 
      preparations: { orderBy: { createdAt: "asc" } },
      participants: { orderBy: { createdAt: "asc" } }
    },
    orderBy: { startDate: "desc" },
  });
}

export async function GET() {
  const trainings = await fetchTrainings();
  return Response.json({ trainings: trainings.map(serializeTraining) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name, description, jobFamilies, trainingType, organizer, room,
    startDate, endDate, duration, cost, status,
  } = body;

  if (!name || !organizer || !room || !startDate) {
    return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const training = await prisma.training.create({
    data: {
      name,
      description: description ?? null,
      jobFamilies: Array.isArray(jobFamilies)
        ? jobFamilies
        : (jobFamilies as string ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
      trainingType: trainingType ?? "MANDATORY",
      organizer,
      room,
      startDate: parseDate(startDate)!,
      endDate: parseDate(endDate),
      duration: duration ?? "",
      cost: cost ?? "",
      status: status ?? "PLANNING",
    },
    include: { preparations: true },
  });

  return Response.json({ training: serializeTraining(training) }, { status: 201 });
}
