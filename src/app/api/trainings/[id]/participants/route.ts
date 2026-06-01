import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { nik, name, department, trainingDate } = await request.json();

  if (!nik || !name || !department || !trainingDate) {
    return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const participant = await prisma.trainingParticipant.create({
    data: {
      trainingId: id,
      nik,
      name,
      department,
      trainingDate: parseDate(trainingDate)!,
      attendedHours: 0,
    },
  });

  return Response.json({
    participant: {
      id: participant.id,
      nik: participant.nik,
      name: participant.name,
      department: participant.department,
      trainingDate: formatDate(participant.trainingDate),
      attendedHours: participant.attendedHours,
    },
  }, { status: 201 });
}
