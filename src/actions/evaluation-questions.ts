"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getEvaluationQuestions() {
  try {
    const questions = await prisma.evaluationQuestion.findMany({
      orderBy: { order: 'asc' }
    });
    return questions;
  } catch (error) {
    console.error("Failed to fetch evaluation questions", error);
    return [];
  }
}

export async function createEvaluationQuestion(data: { title: string, text: string, status: string }) {
  try {
    const question = await prisma.evaluationQuestion.create({
      data: {
        title: data.title,
        text: data.text,
        status: data.status
      }
    });
    revalidatePath("/evaluasi/admin/questions");
    return { success: true, data: question };
  } catch (error) {
    console.error("Failed to create evaluation question", error);
    return { success: false, error: "Failed to create question" };
  }
}

export async function updateEvaluationQuestion(id: string, data: { title: string, text: string, status: string }) {
  try {
    const question = await prisma.evaluationQuestion.update({
      where: { id },
      data: {
        title: data.title,
        text: data.text,
        status: data.status
      }
    });
    revalidatePath("/evaluasi/admin/questions");
    return { success: true, data: question };
  } catch (error) {
    console.error("Failed to update evaluation question", error);
    return { success: false, error: "Failed to update question" };
  }
}

export async function deleteEvaluationQuestion(id: string) {
  try {
    await prisma.evaluationQuestion.delete({
      where: { id }
    });
    revalidatePath("/evaluasi/admin/questions");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete evaluation question", error);
    return { success: false, error: "Failed to delete question" };
  }
}
