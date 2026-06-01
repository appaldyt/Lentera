import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const employees = await prisma.employee.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json({ employees });
}

export async function POST(request: NextRequest) {
  const { nik, name, division, position, email, phone, workLocation, lob, employeeStatus } =
    await request.json();

  if (!nik || !name || !division || !position || !email) {
    return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const employee = await prisma.employee.create({
    data: {
      nik,
      name,
      division,
      position,
      email,
      phone: phone ?? "",
      workLocation: workLocation ?? "",
      lob: lob ?? "",
      employeeStatus: employeeStatus ?? "PKWTT",
    },
  });

  return Response.json({ employee }, { status: 201 });
}
