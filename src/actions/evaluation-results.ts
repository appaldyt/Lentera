"use server";

import prisma from "@/lib/prisma";
import { getCriteria } from "./evaluation-criteria";

export type EvaluationResult = {
  id: string;
  participantId: string;
  employeeName: string;
  employeeNik: string;
  trainingName: string;
  evaluatorName: string;
  evaluatorNik: string;
  dateCompleted: string;
  score: number;
  maxScore: number;
  status: string;
  statusColor: string;
  feedback: string;
  answers: {
    questionTitle: string;
    questionText: string;
    score: number;
    notes: string;
  }[];
};

export async function getEvaluationResults(): Promise<EvaluationResult[]> {
  const criteria = await getCriteria();
  
  const responses = await prisma.evaluationResponse.findMany({
    where: {
      status: "SUBMITTED"
    },
    include: {
      participant: {
        include: {
          training: true
        }
      },
      evaluator: true,
      answers: {
        include: {
          question: true
        }
      }
    }
  });

  return responses.map(response => {
    // Calculate score (assuming 1-5 scale per answer)
    const totalScore = response.answers.reduce((acc, curr) => acc + curr.score, 0);
    const scoreCount = response.answers.length;
    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
    
    // Determine status and color based on dynamic criteria
    let status = "Tidak Terdefinisi";
    let statusColor = "slate";
    
    for (const c of criteria) {
      if (averageScore >= c.minScore && averageScore <= c.maxScore) {
        status = c.label;
        statusColor = c.color;
        break; // Match found
      }
    }
    
    // Combine feedback from notes
    const feedback = response.answers
      .filter(a => a.notes && a.notes.trim() !== "")
      .map(a => a.notes)
      .join(" | ");

    return {
      id: response.id,
      participantId: response.participant.id,
      employeeName: response.participant.name,
      employeeNik: response.participant.nik,
      trainingName: response.participant.training.name,
      evaluatorName: response.evaluator.name,
      evaluatorNik: response.evaluator.nik || "-",
      dateCompleted: response.submittedAt 
        ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(response.submittedAt)
        : "-",
      score: averageScore,
      maxScore: 5.0,
      status,
      statusColor,
      feedback: feedback || "Tidak ada catatan.",
      answers: response.answers.map(a => ({
        questionTitle: a.question.title,
        questionText: a.question.text,
        score: a.score,
        notes: a.notes || ""
      }))
    };
  });
}

export async function getEvaluationResultById(id: string): Promise<EvaluationResult | null> {
  const allResults = await getEvaluationResults();
  return allResults.find(r => r.id === id) || null;
}

import { revalidatePath } from "next/cache";

export async function reopenEvaluation(participantId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Set training participant back to waiting
      await tx.trainingParticipant.update({
        where: { id: participantId },
        data: { evaluationStatus: "MENUNGGU_EVALUASI" }
      });
      
      // Set response status to draft so it disappears from completed results
      await tx.evaluationResponse.updateMany({
        where: { participantId: participantId },
        data: { status: "DRAFT" }
      });
    });

    revalidatePath("/(dashboard)/evaluation-results");
    revalidatePath("/evaluasi/admin/results");
    revalidatePath("/evaluasi/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to reopen evaluation:", error);
    return { success: false, error: "Gagal membuka ulang evaluasi" };
  }
}
