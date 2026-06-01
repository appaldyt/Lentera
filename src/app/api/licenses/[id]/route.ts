import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string }> };

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

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const {
    nik, name, position, workLocation, employeeStatus, lob,
    licenseName, licenseNumber, category, issuedDate, expiryDate,
  } = await request.json();

  const license = await prisma.license.update({
    where: { id },
    data: {
      nik, name, position, workLocation, employeeStatus, lob,
      licenseName, licenseNumber: licenseNumber || "-",
      category,
      issuedDate: issuedDate ? parseDate(issuedDate)! : undefined,
      expiryDate: expiryDate ? parseDate(expiryDate)! : undefined,
    },
  });

  return Response.json({ license: serializeLicense(license) });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.license.delete({ where: { id } });
  return Response.json({ success: true });
}
