import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { parseDate } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const { licenses } = await request.json() as {
    licenses: {
      nik: string; name: string; position: string; workLocation: string;
      employeeStatus: string; lob: string; licenseName: string;
      licenseNumber: string; category: string; issuedDate: string; expiryDate: string;
    }[];
  };

  if (!Array.isArray(licenses) || licenses.length === 0) {
    return Response.json({ error: "Tidak ada data untuk diimport" }, { status: 400 });
  }

  // Cek kombinasi (nik, licenseName) yang sudah ada — 1 query untuk seluruh batch
  const incomingKeys = licenses.map((l) => ({ nik: l.nik, licenseName: l.licenseName }));
  const existing = await prisma.license.findMany({
    where: { OR: incomingKeys },
    select: { nik: true, licenseName: true },
  });
  const existingSet = new Set(existing.map((e) => `${e.nik}|${e.licenseName}`));

  const created: string[] = [];
  const updated: string[] = [];
  const failed: { nik: string; licenseName: string; reason: string }[] = [];

  for (const lic of licenses) {
    try {
      const key = `${lic.nik}|${lic.licenseName}`;
      await prisma.license.upsert({
        where: { nik_licenseName: { nik: lic.nik, licenseName: lic.licenseName } },
        create: {
          nik: lic.nik,
          name: lic.name,
          position: lic.position ?? "",
          workLocation: lic.workLocation ?? "",
          employeeStatus: lic.employeeStatus ?? "PKWTT",
          lob: lic.lob ?? "",
          licenseName: lic.licenseName,
          licenseNumber: lic.licenseNumber || "-",
          category: lic.category ?? "Operasional",
          issuedDate: parseDate(lic.issuedDate)!,
          expiryDate: parseDate(lic.expiryDate)!,
        },
        update: {
          name: lic.name,
          position: lic.position ?? "",
          workLocation: lic.workLocation ?? "",
          employeeStatus: lic.employeeStatus ?? "PKWTT",
          lob: lic.lob ?? "",
          licenseNumber: lic.licenseNumber || "-",
          category: lic.category ?? "Operasional",
          issuedDate: parseDate(lic.issuedDate)!,
          expiryDate: parseDate(lic.expiryDate)!,
        },
      });
      if (existingSet.has(key)) {
        updated.push(key);
      } else {
        created.push(key);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      failed.push({
        nik: lic.nik,
        licenseName: lic.licenseName,
        reason: msg.includes("Unique constraint") ? "Data duplikat" : "Gagal menyimpan data",
      });
    }
  }

  return Response.json({ created, updated, failed }, { status: 207 });
}
