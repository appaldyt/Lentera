"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const EVALUASI_JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_lentera_key_2026"
);

export async function getEvaluationFormData(participantId: string) {
  try {
    // Check session
    const sessionToken = (await cookies()).get("session_token")?.value;
    if (!sessionToken) return { error: "Unauthenticated" };

    const { payload } = await jwtVerify(sessionToken, EVALUASI_JWT_SECRET);
    const evaluatorId = payload.userId as string;

    // Fetch participant
    const participant = await prisma.trainingParticipant.findUnique({
      where: { id: participantId },
      include: { training: true, participantEvaluators: true }
    });

    if (!participant) return { error: "Peserta tidak ditemukan" };

    const is360 = participant.training.evaluationMode === "360_DEGREE";
    let evaluatorRole = "ATASAN";

    if (is360) {
      const pe = participant.participantEvaluators.find(p => p.evaluatorId === evaluatorId);
      if (!pe) return { error: "Anda tidak berhak mengevaluasi peserta ini" };
      evaluatorRole = pe.role;
    } else {
      if (participant.evaluatorId !== evaluatorId) return { error: "Anda tidak berhak mengevaluasi peserta ini" };
    }

    const existingResponse = await prisma.evaluationResponse.findUnique({
      where: {
        participantId_evaluatorId: {
          participantId,
          evaluatorId
        }
      },
      include: { answers: true }
    });

    // Fetch active questions
    const questions = await prisma.evaluationQuestion.findMany({
      where: { 
        status: "Aktif",
        OR: [
          { isGlobal: true },
          { trainingId: participant.trainingId }
        ]
      },
      orderBy: { order: 'asc' }
    });

    return { participant, questions, evaluatorId, evaluatorRole, existingResponse };
  } catch (error) {
    console.error("Failed to load evaluation form data", error);
    return { error: "Terjadi kesalahan server" };
  }
}

export async function submitEvaluationResponse(data: {
  participantId: string,
  evaluatorId: string,
  answers: { questionId: string, score: number | null, textAnswer?: string }[],
  feedback?: string
}) {
  try {
    // Use transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Create or Update Response
      const response = await tx.evaluationResponse.upsert({
        where: {
          participantId_evaluatorId: {
            participantId: data.participantId,
            evaluatorId: data.evaluatorId
          }
        },
        update: {
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
        create: {
          participantId: data.participantId,
          evaluatorId: data.evaluatorId,
          status: "SUBMITTED",
          submittedAt: new Date(),
        }
      });

      // 2. Delete existing answers if any
      await tx.evaluationAnswer.deleteMany({
        where: { responseId: response.id }
      });

      // 3. Create Answers
      if (data.answers.length > 0) {
        await tx.evaluationAnswer.createMany({
          data: data.answers.map(ans => ({
            responseId: response.id,
            questionId: ans.questionId,
            score: ans.score,
            notes: ans.textAnswer !== undefined ? ans.textAnswer : (data.feedback || null)
          }))
        });
      }

      // 4. Update Participant Status and ParticipantEvaluator status
      const participant = await tx.trainingParticipant.findUnique({
        where: { id: data.participantId },
        include: { training: true, participantEvaluators: true }
      });

      const is360 = participant?.training?.evaluationMode === "360_DEGREE";

      if (is360) {
        // Update specific evaluator status
        await tx.participantEvaluator.updateMany({
          where: { participantId: data.participantId, evaluatorId: data.evaluatorId },
          data: { status: "SELESAI_DIEVALUASI" }
        });

        // Check if all evaluators are done
        const allEvaluators = await tx.participantEvaluator.findMany({
          where: { participantId: data.participantId }
        });
        const allDone = allEvaluators.every(pe => pe.status === "SELESAI_DIEVALUASI" || (pe.evaluatorId === data.evaluatorId)); 
        
        if (allDone) {
          await tx.trainingParticipant.update({
            where: { id: data.participantId },
            data: { evaluationStatus: "SELESAI_DIEVALUASI" }
          });
        }
      } else {
        await tx.trainingParticipant.update({
          where: { id: data.participantId },
          data: { evaluationStatus: "SELESAI_DIEVALUASI" }
        });
      }
    });

    revalidatePath("/evaluasi/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit evaluation", error);
    return { success: false, error: "Gagal menyimpan evaluasi" };
  }
}
