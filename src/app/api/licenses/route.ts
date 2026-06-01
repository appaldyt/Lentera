import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

function computeStatus(expiryDate: Date): string {
  const diffDays = Math.floor((expiryDate.getTime() - Date.now()) / 86_400_000);
  if (diffDays < 0)   return "EXPIRED";
  if (diffDays <= 30)  return "EXPIRING_1_MONTH";
  if (diffDays <= 90)  return "EXPIRING_3_MONTHS";
  if (diffDays <= 150) return "EXPIRING_5_MONTHS";
  return "ACTIVE";
}

function serializeLicense(l: {
  id: string; nik: string; name: string; position: string;
  workLocation: string; employeeStatus: string; lob: string;
  licenseName: string; licenseNumber: string; category: string;
  issuedDate: Date; expiryDate: Date;
}) {
  return {
    id: l.id,
    employee: {
      nik: l.nik,
      name: l.name,
      position: l.position,
      workLocation: l.workLocation,
      employeeStatus: l.employeeStatus,
      lob: l.lob,
    },
    licenseName: l.licenseName,
    licenseNumber: l.licenseNumber,
    category: l.category,
    issuedDate: formatDate(l.issuedDate),
    expiryDate: formatDate(l.expiryDate),
    status: computeStatus(l.expiryDate),
  };
}

export async function GET() {
  const licenses = await prisma.license.findMany({
    orderBy: { expiryDate: "asc" },
  });
  return Response.json({ licenses: licenses.map(serializeLicense) });
}

export async function POST(request: NextRequest) {
  const {
    nik, name, position, workLocation, employeeStatus, lob,
    licenseName, licenseNumber, category, issuedDate, expiryDate,
  } = await request.json();

  if (!nik || !name || !licenseName || !issuedDate || !expiryDate) {
    return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const license = await prisma.license.create({
    data: {
      nik, name, position: position ?? "", workLocation: workLocation ?? "",
      employeeStatus: employeeStatus ?? "", lob: lob ?? "",
      licenseName, licenseNumber: licenseNumber || "-",
      category: category ?? "Operasional",
      issuedDate: parseDate(issuedDate)!,
      expiryDate: parseDate(expiryDate)!,
    },
  });

  return Response.json({ license: serializeLicense(license) }, { status: 201 });
}
