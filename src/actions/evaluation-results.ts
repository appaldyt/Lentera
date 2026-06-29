"use server";

import prisma from "@/lib/prisma";
import { getCriteria } from "./evaluation-criteria";

export type EvaluationResult = {
  id: string;
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
      answers: true
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
    };
  });
}

export async function getEvaluationResultById(id: string): Promise<EvaluationResult | null> {
  const allResults = await getEvaluationResults();
  return allResults.find(r => r.id === id) || null;
}
