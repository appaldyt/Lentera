import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { niks } = await request.json();

  if (!Array.isArray(niks)) {
    return Response.json({ existing: [] });
  }

  const found = await prisma.employee.findMany({
    where: { nik: { in: niks } },
    select: { nik: true, name: true, division: true, bodLevel: true },
  });

  return Response.json({
    existing: found.map((e) => e.nik),
    employees: found,
  });
}
