"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getParticipantsForEvaluation() {
  try {
    const participants = await prisma.trainingParticipant.findMany({
      include: {
        training: true,
        evaluator: true,
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
        dateEnded: p.training.endDate ? new Date(p.training.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        masaTraining,
        evaluatorId: p.evaluatorId,
        evaluatorName: p.evaluator ? p.evaluator.name : "Belum Dievaluasi",
        status: p.evaluationStatus,
        isSent: p.evaluationStatus !== "BELUM_DITUGASKAN"
      };
    });
  } catch (error) {
    console.error("Failed to fetch participants for evaluation", error);
    return [];
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
      where: { id: participantId }
    });
    
    if (!participant?.evaluatorId) {
      return { success: false, error: "Atasan belum ditugaskan" };
    }

    await prisma.trainingParticipant.update({
      where: { id: participantId },
      data: {
        evaluationStatus: "MENUNGGU_EVALUASI",
        evaluationSentAt: new Date()
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
        evaluatorId: userId,
        evaluationStatus: {
          in: ["MENUNGGU_EVALUASI", "SELESAI_DIEVALUASI"]
        }
      },
      include: {
        training: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return participants.map(p => {
      // Calculate due date (approx 3 months after end date)
      const endDate = p.training.endDate ? new Date(p.training.endDate) : new Date();
      const dueDate = new Date(endDate);
      dueDate.setMonth(dueDate.getMonth() + 3);

      return {
        id: p.id,
        employeeName: p.name,
        position: p.department || "Karyawan",
        trainingName: p.training.name,
        trainingDate: p.training.endDate ? new Date(p.training.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        dueDate: dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: p.evaluationStatus === "SELESAI_DIEVALUASI" ? "COMPLETED" : "PENDING",
      };
    });
  } catch (error) {
    console.error("Failed to fetch dashboard tasks", error);
    return [];
  }
}
