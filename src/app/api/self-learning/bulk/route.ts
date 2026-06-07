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
      failed: { nik: string; reason: string }[];
    } = { created: [], failed: [] };

    for (const e of entries) {
      if (!e.nik || !e.name || !e.hours) {
        results.failed.push({ nik: e.nik ?? "-", reason: "NIK, Nama, dan Total Jam wajib diisi" });
        continue;
      }
      try {
        await prisma.selfLearning.create({
          data: {
            nik: e.nik,
            name: e.name,
            department: e.department ?? "",
            year: e.year ?? "",
            platform: e.platform ?? "",
            hours: parseFloat(e.hours) || 0,
          },
        });
        results.created.push(e.nik);
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
