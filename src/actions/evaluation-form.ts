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
      include: { training: true }
    });

    if (!participant) return { error: "Peserta tidak ditemukan" };
    if (participant.evaluatorId !== evaluatorId) return { error: "Anda tidak berhak mengevaluasi peserta ini" };
    if (participant.evaluationStatus === "SELESAI_DIEVALUASI") return { error: "Evaluasi sudah diselesaikan" };

    // Fetch active questions
    const questions = await prisma.evaluationQuestion.findMany({
      where: { status: "Aktif" },
      orderBy: { order: 'asc' }
    });

    return { participant, questions, evaluatorId };
  } catch (error) {
    console.error("Failed to load evaluation form data", error);
    return { error: "Terjadi kesalahan server" };
  }
}

export async function submitEvaluationResponse(data: {
  participantId: string,
  evaluatorId: string,
  answers: { questionId: string, score: number }[],
  feedback?: string
}) {
  try {
    // Verify it doesn't exist yet
    const existing = await prisma.evaluationResponse.findUnique({
      where: {
        participantId_evaluatorId: {
          participantId: data.participantId,
          evaluatorId: data.evaluatorId
        }
      }
    });

    if (existing) {
      return { success: false, error: "Evaluasi sudah disubmit sebelumnya" };
    }

    // Use transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Create Response
      const response = await tx.evaluationResponse.create({
        data: {
          participantId: data.participantId,
          evaluatorId: data.evaluatorId,
          status: "SUBMITTED",
          submittedAt: new Date(),
        }
      });

      // 2. Create Answers
      if (data.answers.length > 0) {
        await tx.evaluationAnswer.createMany({
          data: data.answers.map(ans => ({
            responseId: response.id,
            questionId: ans.questionId,
            score: ans.score,
            notes: data.feedback // saving overall feedback to the first question's notes as a hack if needed, wait, schema has answers.notes. But maybe we don't have a top-level feedback field in EvaluationResponse?
          }))
        });
      }

      // 3. Update Participant Status
      await tx.trainingParticipant.update({
        where: { id: data.participantId },
        data: { evaluationStatus: "SELESAI_DIEVALUASI" }
      });
    });

    revalidatePath("/evaluasi/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit evaluation", error);
    return { success: false, error: "Gagal menyimpan evaluasi" };
  }
}
