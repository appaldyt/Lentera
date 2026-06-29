"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getEvaluators() {
  try {
    const evaluators = await prisma.user.findMany({
      where: {
        role: {
          in: ["EVALUATION_ADMIN", "EVALUATOR"]
        }
      },
      orderBy: { name: 'asc' }
    });
    return evaluators;
  } catch (error) {
    console.error("Failed to fetch evaluators", error);
    return [];
  }
}

export async function createEvaluator(data: { name: string, email: string, role: string, status: string, nik?: string, password?: string }) {
  try {
    const rawPassword = data.password || "defaultPassword123!";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword, 
        nik: data.nik || null,
        role: data.role as "EVALUATION_ADMIN" | "EVALUATOR",
        status: data.status
      }
    });
    revalidatePath("/evaluasi/admin/users");
    return { success: true, data: user };
  } catch (error: any) {
    console.error("Failed to create evaluator", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Email sudah digunakan" };
    }
    return { success: false, error: "Failed to create account" };
  }
}

export async function updateEvaluator(id: string, data: { name: string, email: string, role: string, status: string, nik?: string, password?: string }) {
  try {
    const updateData: any = {
      name: data.name,
      email: data.email,
      nik: data.nik || null,
      role: data.role as "EVALUATION_ADMIN" | "EVALUATOR",
      status: data.status
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });
    revalidatePath("/evaluasi/admin/users");
    return { success: true, data: user };
  } catch (error: any) {
    console.error("Failed to update evaluator", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Email sudah digunakan" };
    }
    return { success: false, error: "Failed to update account" };
  }
}

export async function deleteEvaluator(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });
    revalidatePath("/evaluasi/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete evaluator", error);
    return { success: false, error: "Failed to delete account" };
  }
}
