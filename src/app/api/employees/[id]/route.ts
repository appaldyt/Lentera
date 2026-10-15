import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { nik, name, directorate, group, division, position, positionCode, email, phone, workLocation, lob, employeeStatus, bodLevel, isActive } =
    await request.json();

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      nik,
      name,
      directorate: directorate ?? "",
      group: group ?? "",
      division,
      position,
      positionCode: positionCode ?? "",
      email,
      phone,
      workLocation,
      lob,
      bodLevel: bodLevel ?? "",
      employeeStatus,
      isActive: isActive !== undefined ? isActive : true,
    },
  });

  return Response.json({ employee });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.employee.delete({ where: { id } });
  return Response.json({ success: true });
}
