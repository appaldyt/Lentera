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

  const success: string[] = [];
  const failed: { nik: string; licenseName: string; reason: string }[] = [];

  for (const lic of licenses) {
    try {
      await prisma.license.create({
        data: {
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
      });
      success.push(`${lic.nik} - ${lic.licenseName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      failed.push({
        nik: lic.nik,
        licenseName: lic.licenseName,
        reason: msg.includes("Unique constraint") ? "Data duplikat" : "Gagal menyimpan data",
      });
    }
  }

  return Response.json({ success, failed }, { status: 207 });
}
