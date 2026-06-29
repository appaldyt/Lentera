"use server";

import prisma from "@/lib/prisma";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_lentera_key_2026"
);

export async function loginEvaluator(formData: FormData) {
  try {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return { success: false, error: "Email dan password wajib diisi." };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "Email tidak ditemukan." };
    }

    if (user.status !== "AKTIF" && user.status !== "Aktif") {
      return { success: false, error: "Akun Anda tidak aktif. Hubungi Admin." };
    }

    if (user.role !== "EVALUATOR" && user.role !== "EVALUATION_ADMIN") {
      return { success: false, error: "Anda tidak memiliki akses ke portal ini." };
    }

    // Verify password (fallback to plaintext for dev backwards compatibility if bcrypt fails)
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch {
      // If it's not a valid bcrypt hash, it will throw an error. Fallback to plaintext.
      isPasswordValid = false;
    }

    if (!isPasswordValid && password !== user.password) {
      return { success: false, error: "Password salah." };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Create session token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h") // Session valid for 8 hours
      .sign(JWT_SECRET);

    // Set cookie
    (await cookies()).set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Terjadi kesalahan sistem. Silakan coba lagi." };
  }
}

export async function logoutEvaluator() {
  (await cookies()).delete("session_token");
}

export async function getSession() {
  const token = (await cookies()).get("session_token")?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: string; email: string; name: string; role: string; };
  } catch (error) {
    return null;
  }
}
