import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { employees } = await request.json();

  if (!Array.isArray(employees) || employees.length === 0) {
    return Response.json({ error: "Data employees tidak valid" }, { status: 400 });
  }

  // Cek NIK mana yang sudah ada di DB (1 query untuk seluruh batch)
  const incomingNiks = employees.map((e: { nik: string }) => e.nik);
  const existing = await prisma.employee.findMany({
    where: { nik: { in: incomingNiks } },
    select: { nik: true },
  });
  const existingNiks = new Set(existing.map((e) => e.nik));

  const results: {
    created: string[];
    updated: string[];
    failed: { nik: string; reason: string }[];
  } = { created: [], updated: [], failed: [] };

  for (const emp of employees) {
    try {
      await prisma.employee.upsert({
        where: { nik: emp.nik },
        create: {
          nik: emp.nik,
          name: emp.name,
          division: emp.division,
          position: emp.position,
          email: emp.email,
          phone: emp.phone ?? "",
          workLocation: emp.workLocation ?? "",
          lob: emp.lob ?? "",
          bodLevel: emp.bodLevel ?? "",
          employeeStatus: emp.employeeStatus ?? "PKWTT",
        },
        update: {
          name: emp.name,
          division: emp.division,
          position: emp.position,
          email: emp.email,
          phone: emp.phone ?? "",
          workLocation: emp.workLocation ?? "",
          lob: emp.lob ?? "",
          bodLevel: emp.bodLevel ?? "",
          employeeStatus: emp.employeeStatus ?? "PKWTT",
        },
      });

      if (existingNiks.has(emp.nik)) {
        results.updated.push(emp.nik);
      } else {
        results.created.push(emp.nik);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const isDupe = msg.includes("Unique constraint");
      results.failed.push({
        nik: emp.nik,
        reason: isDupe ? "Email sudah digunakan karyawan lain" : "Gagal menyimpan data",
      });
    }
  }

  return Response.json(results, { status: 207 });
}
