"use server";

import prisma from "@/lib/prisma";

export type CriterionInput = {
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
};

export async function getCriteria() {
  const data = await prisma.evaluationCriteria.findMany({
    orderBy: {
      maxScore: 'desc'
    }
  });
  
  // Return default if empty
  if (data.length === 0) {
    return [
      { id: "c-1", label: "Lulus", minScore: 4.0, maxScore: 5.0, color: "success" },
      { id: "c-2", label: "Perlu Peningkatan", minScore: 3.0, maxScore: 3.9, color: "warning" },
      { id: "c-3", label: "Tidak Lulus", minScore: 0.0, maxScore: 2.9, color: "danger" },
    ];
  }
  
  return data;
}

export async function saveCriteria(criteria: CriterionInput[]) {
  await prisma.$transaction([
    prisma.evaluationCriteria.deleteMany({}),
    prisma.evaluationCriteria.createMany({
      data: criteria.map(c => ({
        label: c.label,
        minScore: c.minScore,
        maxScore: c.maxScore,
        color: c.color,
      }))
    })
  ]);
  
  return { success: true };
}
