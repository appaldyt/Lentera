import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { entries } = await request.json();

    if (!Array.isArray(entries) || entries.length === 0) {
      return Response.json({ error: "Data entries tidak valid" }, { status: 400 });
    }

    const results: {
      created: string[];
      updated: string[];
      failed: { nik: string; reason: string }[];
    } = { created: [], updated: [], failed: [] };

    for (const e of entries) {
      if (!e.nik || !e.hours) {
        results.failed.push({ nik: e.nik ?? "-", reason: "NIK dan Total Jam wajib diisi" });
        continue;
      }
      try {
        const employee = await prisma.employee.findUnique({
          where: { nik: e.nik },
          select: { name: true, division: true, bodLevel: true },
        });
        if (!employee) {
          results.failed.push({ nik: e.nik, reason: "NIK tidak ditemukan di data karyawan" });
          continue;
        }

        const year = e.year ?? "";
        const platform = e.platform ?? "";
        const hours = parseFloat(e.hours) || 0;

        const existing = await prisma.selfLearning.findFirst({
          where: { nik: e.nik, year, platform },
          select: { id: true },
        });

        if (existing) {
          await prisma.selfLearning.update({
            where: { id: existing.id },
            data: { hours, bodLevel: employee.bodLevel },
          });
          results.updated.push(e.nik);
        } else {
          await prisma.selfLearning.create({
            data: {
              nik: e.nik,
              name: employee.name,
              department: employee.division,
              bodLevel: employee.bodLevel,
              year,
              platform,
              hours,
            },
          });
          results.created.push(e.nik);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.failed.push({ nik: e.nik, reason: msg });
      }
    }

    return Response.json(results, { status: 207 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
