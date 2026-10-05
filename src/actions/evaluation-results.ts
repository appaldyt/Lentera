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
  is360: boolean;
  evaluators: {
    id: string;
    name: string;
    role: string;
  }[];
  breakdown?: {
    role: string;
    evaluatorName: string;
    score: number;
    weight: number;
    weightedScore: number;
  }[];
  answers: {
    questionTitle: string;
    questionText: string;
    questionType: string;
    score: number | null;
    notes: string;
    role?: string;
    evaluatorName?: string;
    evaluatorNik?: string;
  }[];
};

export async function getEvaluationResults(): Promise<EvaluationResult[]> {
  const criteria = await getCriteria();
  
  const participants = await prisma.trainingParticipant.findMany({
    where: {
      evaluationStatus: "SELESAI_DIEVALUASI"
    },
    include: {
      training: true,
      participantEvaluators: {
        include: { evaluator: true }
      },
      evaluationResponses: {
        where: { status: "SUBMITTED" },
        include: {
          evaluator: true,
          answers: {
            include: { question: true }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return participants.map(participant => {
    const is360 = participant.training.evaluationMode === "360_DEGREE";
    
    let finalScore = 0;
    let evaluatorName = "";
    let evaluatorNik = "";
    let breakdown = [];
    const allAnswers: any[] = [];
    const evaluatorsList: {id: string, name: string, role: string}[] = [];
    
    if (is360) {
      evaluatorName = "Berbagai Penilai (360°)";
      evaluatorNik = "-";
      
      const weights = {
        ATASAN: participant.training.weightSupervisor,
        REKAN: participant.training.weightPeer,
        BAWAHAN: participant.training.weightSubordinate
      };
      
      // Calculate average score per role
      const roleScores: Record<string, { total: number, count: number, evaluatorNames: string[] }> = {
        ATASAN: { total: 0, count: 0, evaluatorNames: [] },
        REKAN: { total: 0, count: 0, evaluatorNames: [] },
        BAWAHAN: { total: 0, count: 0, evaluatorNames: [] }
      };

      for (const response of participant.evaluationResponses) {
        // Find role of this evaluator
        const pe = participant.participantEvaluators.find(e => e.evaluatorId === response.evaluatorId);
        const role = pe ? pe.role : "ATASAN";
        
        evaluatorsList.push({
          id: response.evaluatorId,
          name: response.evaluator.name,
          role: role
        });
        
        const ratingAnswers = response.answers.filter(a => a.question.type === "RATING" && a.score !== null);
        const total = ratingAnswers.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const count = ratingAnswers.length;
        const avg = count > 0 ? total / count : 0;
        
        if (roleScores[role]) {
          roleScores[role].total += avg;
          roleScores[role].count += 1;
          roleScores[role].evaluatorNames.push(response.evaluator.name);
        }

        // Collect answers
        for (const ans of response.answers) {
          allAnswers.push({
            questionTitle: ans.question.title,
            questionText: ans.question.text,
            questionType: ans.question.type,
            score: ans.score,
            notes: ans.notes || "",
            role: role,
            evaluatorName: response.evaluator.name,
            evaluatorNik: (response.evaluator as any).nik || "-"
          });
        }
      }

      // Calculate weighted score
      let activeWeightTotal = 0;
      let calculatedScore = 0;

      for (const r of ["ATASAN", "REKAN", "BAWAHAN"]) {
        const stats = roleScores[r];
        const weight = weights[r as keyof typeof weights];
        
        if (stats.count > 0 && weight > 0) {
          const avgScoreForRole = stats.total / stats.count;
          const weightedPart = avgScoreForRole * (weight / 100);
          calculatedScore += weightedPart;
          activeWeightTotal += weight;
          
          breakdown.push({
            role: r,
            evaluatorName: stats.evaluatorNames.join(", "),
            score: avgScoreForRole,
            weight: weight,
            weightedScore: weightedPart
          });
        }
      }
      
      // If some roles didn't answer but weights don't sum to 100, we normalize it
      finalScore = activeWeightTotal > 0 ? (calculatedScore / (activeWeightTotal / 100)) : 0;
      
    } else {
      // Supervisor Only mode
      const response = participant.evaluationResponses[0];
      if (response) {
        evaluatorName = response.evaluator.name;
        evaluatorNik = (response.evaluator as any).nik || "-";
        evaluatorsList.push({
          id: response.evaluatorId,
          name: response.evaluator.name,
          role: "ATASAN"
        });
        
        const ratingAnswers = response.answers.filter(a => a.question.type === "RATING" && a.score !== null);
        const total = ratingAnswers.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const count = ratingAnswers.length;
        finalScore = count > 0 ? total / count : 0;
        
        for (const ans of response.answers) {
          allAnswers.push({
            questionTitle: ans.question.title,
            questionText: ans.question.text,
            questionType: ans.question.type,
            score: ans.score,
            notes: ans.notes || "",
            role: "ATASAN",
            evaluatorName: response.evaluator.name,
            evaluatorNik: (response.evaluator as any).nik || "-"
          });
        }
      }
    }
    
    // Determine status and color based on dynamic criteria
    let status = "Tidak Terdefinisi";
    let statusColor = "slate";
    
    for (const c of criteria) {
      if (finalScore >= c.minScore && finalScore <= c.maxScore) {
        status = c.label;
        statusColor = c.color;
        break;
      }
    }
    
    // Combine feedback from notes
    const feedbackList = allAnswers
      .filter(a => a.notes && a.notes.trim() !== "" && a.questionType === "RATING")
      .map(a => is360 ? `[${a.role}] ${a.notes}` : a.notes);
    const feedback = Array.from(new Set(feedbackList)).join("\n");

    // Use latest submittedAt for dateCompleted
    const lastResponse = participant.evaluationResponses.sort((a, b) => 
      new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
    )[0];

    return {
      id: participant.id,
      participantId: participant.id,
      employeeName: participant.name,
      employeeNik: participant.nik,
      trainingName: participant.training.name,
      evaluatorName,
      evaluatorNik,
      dateCompleted: lastResponse && lastResponse.submittedAt 
        ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(lastResponse.submittedAt)
        : "-",
      score: finalScore,
      maxScore: 5.0,
      status,
      statusColor,
      feedback: feedback || "Tidak ada catatan.",
      is360,
      evaluators: evaluatorsList,
      breakdown: is360 ? breakdown : undefined,
      answers: allAnswers
    };
  });
}

export async function getEvaluationResultById(id: string): Promise<EvaluationResult | null> {
  const allResults = await getEvaluationResults();
  return allResults.find(r => r.id === id) || null;
}

import { revalidatePath } from "next/cache";

export async function reopenEvaluation(participantId: string, specificEvaluatorId?: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Set training participant back to waiting
      await tx.trainingParticipant.update({
        where: { id: participantId },
        data: { evaluationStatus: "MENUNGGU_EVALUASI" }
      });
      
      if (specificEvaluatorId) {
        // Set specific response status to draft
        await tx.evaluationResponse.updateMany({
          where: { participantId: participantId, evaluatorId: specificEvaluatorId },
          data: { status: "DRAFT" }
        });
        
        // Also reset specific participantEvaluator
        await tx.participantEvaluator.updateMany({
          where: { participantId: participantId, evaluatorId: specificEvaluatorId },
          data: { status: "MENUNGGU_EVALUASI" }
        });
      } else {
        // Set all responses to draft
        await tx.evaluationResponse.updateMany({
          where: { participantId: participantId },
          data: { status: "DRAFT" }
        });
        
        // Reset all participantEvaluators
        await tx.participantEvaluator.updateMany({
          where: { participantId: participantId },
          data: { status: "MENUNGGU_EVALUASI" }
        });
      }
    });

    revalidatePath("/(dashboard)/evaluation-results");
    revalidatePath("/evaluasi/admin/results");
    revalidatePath("/evaluasi/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to reopen evaluation", error);
    return { success: false, error: "Gagal membuka ulang evaluasi" };
  }
}
