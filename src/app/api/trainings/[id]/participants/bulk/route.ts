import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { parseDate, formatDate } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { participants } = await request.json();

  if (!Array.isArray(participants) || participants.length === 0) {
    return Response.json({ error: "Data peserta tidak valid" }, { status: 400 });
  }

  const results: { success: any[]; failed: { nik: string; reason: string }[] } = {
    success: [],
    failed: [],
  };

  for (const p of participants) {
    try {
      if (!p.nik || !p.name || !p.department || !p.trainingDate) {
         throw new Error("Field wajib tidak lengkap");
      }

      const participant = await prisma.trainingParticipant.create({
        data: {
          trainingId: id,
          nik: p.nik,
          name: p.name,
          department: p.department,
          trainingDate: parseDate(p.trainingDate)!,
          attendedHours: p.attendedHours !== undefined ? Number(p.attendedHours) : 0,
        },
      });

      results.success.push({
        id: participant.id,
        nik: participant.nik,
        name: participant.name,
        department: participant.department,
        trainingDate: formatDate(participant.trainingDate),
        attendedHours: participant.attendedHours,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      results.failed.push({
        nik: p.nik || "Unknown",
        reason: msg,
      });
    }
  }

  return Response.json(results, { status: 207 });
}
