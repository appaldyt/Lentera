import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { employees } = await request.json();

  if (!Array.isArray(employees) || employees.length === 0) {
    return Response.json({ error: "Data employees tidak valid" }, { status: 400 });
  }

  const results: { success: string[]; failed: { nik: string; reason: string }[] } = {
    success: [],
    failed: [],
  };

  for (const emp of employees) {
    try {
      await prisma.employee.create({
        data: {
          nik: emp.nik,
          name: emp.name,
          division: emp.division,
          position: emp.position,
          email: emp.email,
          phone: emp.phone ?? "",
          workLocation: emp.workLocation ?? "",
          lob: emp.lob ?? "",
          employeeStatus: emp.employeeStatus ?? "PKWTT",
        },
      });
      results.success.push(emp.nik);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const isDupe = msg.includes("Unique constraint");
      results.failed.push({
        nik: emp.nik,
        reason: isDupe ? "NIK atau email sudah terdaftar" : "Gagal menyimpan data",
      });
    }
  }

  return Response.json(results, { status: 207 });
}
