"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getParticipantsForEvaluation() {
  try {
    const participants = await prisma.trainingParticipant.findMany({
      include: {
        training: true,
        evaluator: true, // Legacy
        participantEvaluators: {
          include: { evaluator: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to a cleaner format if needed for the UI, or just return as is
    return participants.map(p => {
      let masaTraining = "-";
      if (p.training.endDate) {
        const end = new Date(p.training.endDate);
        const now = new Date();

        let months = (now.getFullYear() - end.getFullYear()) * 12 + (now.getMonth() - end.getMonth());
        if (now.getDate() < end.getDate()) {
          months--;
        }

        if (months < 3) {
          masaTraining = "Kurang dari 3 bulan";
        } else if (months >= 12) {
          masaTraining = "Lewat Setahun";
        } else if (months >= 6) {
          masaTraining = "Lewat 6 Bulan";
        } else {
          masaTraining = "Lewat 3 bulan";
        }
      }

      return {
        id: p.id,
        nik: p.nik,
        name: p.name,
        training: p.training.name,
        evaluationMode: p.training.evaluationMode,
        dateEnded: p.training.endDate ? new Date(p.training.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        masaTraining,
        evaluatorId: p.evaluatorId, // Legacy
        evaluatorName: p.evaluator ? ((p.evaluator as any).nik ? `${(p.evaluator as any).nik} - ${p.evaluator.name}` : p.evaluator.name) : "Belum Dievaluasi", // Legacy
        evaluators: p.participantEvaluators.map(pe => ({
          id: pe.id,
          evaluatorId: pe.evaluatorId,
          nik: (pe.evaluator as any).nik || null,
          name: pe.evaluator.name,
          role: pe.role,
          status: pe.status
        })),
        status: p.evaluationStatus, // Legacy
        isSent: p.evaluationStatus !== "BELUM_DITUGASKAN" // Legacy
      };
    });
  } catch (error) {
    console.error("Failed to fetch participants for evaluation", error);
    return [];
  }
}

export async function assignMultipleEvaluators(participantId: string, assignments: { evaluatorId: string, role: string }[]) {
  try {
    const participant = await prisma.trainingParticipant.findUnique({ where: { id: participantId } });
    if (!participant) {
      return { success: false, error: "Peserta tidak ditemukan." };
    }
    if (participant.evaluationStatus === "SELESAI_DIEVALUASI") {
      return { success: false, error: "Evaluasi sudah diselesaikan." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Clear existing assignments
      await tx.participantEvaluator.deleteMany({ where: { participantId } });

      // 2. Insert new assignments
      if (assignments.length > 0) {
        await tx.participantEvaluator.createMany({
          data: assignments.map(a => ({
            participantId,
            evaluatorId: a.evaluatorId,
            role: a.role,
            status: participant.evaluationStatus === "MENUNGGU_EVALUASI" ? "MENUNGGU_EVALUASI" : "BELUM_DITUGASKAN"
          }))
        });
      }

      // 3. Keep legacy evaluatorId updated for backward compatibility if it's supervisor only
      // We pick the first "ATASAN" as the main evaluator
      const mainAtasan = assignments.find(a => a.role === "ATASAN");
      await tx.trainingParticipant.update({
        where: { id: participantId },
        data: { evaluatorId: mainAtasan ? mainAtasan.evaluatorId : null }
      });
    });

    revalidatePath("/evaluasi/admin/assignments");
    return { success: true };
  } catch (error) {
    console.error("Failed to assign evaluators", error);
    return { success: false, error: "Gagal menugaskan evaluator" };
  }
}

export async function assignEvaluator(participantId: string, evaluatorId: string) {
  try {
    const participant = await prisma.trainingParticipant.findUnique({ where: { id: participantId } });
    if (participant?.evaluationStatus === "SELESAI_DIEVALUASI") {
      return { success: false, error: "Evaluasi sudah diselesaikan. Silakan Open Evaluasi terlebih dahulu." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.trainingParticipant.update({
        where: { id: participantId },
        data: {
          evaluatorId: evaluatorId,
        }
      });

      // Delete any draft responses if the evaluator is changed
      await tx.evaluationResponse.deleteMany({
        where: {
          participantId: participantId,
          status: "DRAFT"
        }
      });
    });

    revalidatePath("/evaluasi/admin/assignments");
    return { success: true };
  } catch (error) {
    console.error("Failed to assign evaluator", error);
    return { success: false, error: "Failed to assign evaluator" };
  }
}

export async function sendEvaluationForm(participantId: string) {
  try {
    // We check if it's assigned first
    const participant = await prisma.trainingParticipant.findUnique({
      where: { id: participantId },
      include: { training: true, participantEvaluators: true }
    });

    const is360 = participant?.training?.evaluationMode === "360_DEGREE";

    if (is360) {
      if (!participant || participant.participantEvaluators.length === 0) {
        return { success: false, error: "Evaluator belum ditugaskan" };
      }
    } else {
      if (!participant?.evaluatorId) {
        return { success: false, error: "Atasan belum ditugaskan" };
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.trainingParticipant.update({
        where: { id: participantId },
        data: {
          evaluationStatus: "MENUNGGU_EVALUASI",
          evaluationSentAt: new Date()
        }
      });

      if (is360) {
        await tx.participantEvaluator.updateMany({
          where: { participantId: participantId },
          data: { status: "MENUNGGU_EVALUASI" }
        });
      }
    });

    revalidatePath("/evaluasi/admin/assignments");
    return { success: true };
  } catch (error) {
    console.error("Failed to send evaluation form", error);
    return { success: false, error: "Failed to send evaluation form" };
  }
}

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const EVALUASI_JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_lentera_key_2026"
);

export async function getMyDashboardTasks() {
  try {
    const sessionToken = (await cookies()).get("session_token")?.value;
    if (!sessionToken) return [];

    const { payload } = await jwtVerify(sessionToken, EVALUASI_JWT_SECRET);
    const userId = payload.userId as string;

    const participants = await prisma.trainingParticipant.findMany({
      where: {
        OR: [
          {
            evaluatorId: userId,
            evaluationStatus: {
              in: ["MENUNGGU_EVALUASI", "SELESAI_DIEVALUASI"]
            }
          },
          {
            participantEvaluators: {
              some: {
                evaluatorId: userId,
                status: {
                  in: ["MENUNGGU_EVALUASI", "SELESAI_DIEVALUASI"]
                }
              }
            }
          }
        ]
      },
      include: {
        training: true,
        participantEvaluators: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return participants.map(p => {
      // Calculate due date (approx 3 months after end date)
      const endDate = p.training.endDate ? new Date(p.training.endDate) : new Date();
      const dueDate = new Date(endDate);
      dueDate.setMonth(dueDate.getMonth() + 3);

      const is360 = p.training.evaluationMode === "360_DEGREE";
      let status = "PENDING";
      let role = "Atasan";

      if (is360) {
        const pe = p.participantEvaluators.find(e => e.evaluatorId === userId);
        if (pe) {
          status = pe.status === "SELESAI_DIEVALUASI" ? "COMPLETED" : "PENDING";
          role = pe.role === "ATASAN" ? "Atasan" : pe.role === "REKAN" ? "Rekan Kerja" : "Bawahan";
        }
      } else {
        status = p.evaluationStatus === "SELESAI_DIEVALUASI" ? "COMPLETED" : "PENDING";
      }

      return {
        id: p.id,
        employeeName: p.name,
        position: p.department || "Karyawan",
        trainingName: p.training.name,
        trainingDate: p.training.endDate ? new Date(p.training.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        dueDate: dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: status,
        role: role
      };
    });
  } catch (error) {
    console.error("Failed to fetch dashboard tasks", error);
    return [];
  }
}
