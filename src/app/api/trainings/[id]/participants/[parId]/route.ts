import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string; parId: string }> };

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { parId } = await params;
  const { trainingDate, attendedHours } = await request.json();

  const participant = await prisma.trainingParticipant.update({
    where: { id: parId },
    data: {
      trainingDate: trainingDate ? parseDate(trainingDate)! : undefined,
      attendedHours: attendedHours !== undefined ? Number(attendedHours) : undefined,
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
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { parId } = await params;
  await prisma.trainingParticipant.delete({ where: { id: parId } });
  return Response.json({ success: true });
}
