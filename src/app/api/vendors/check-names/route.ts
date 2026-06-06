import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { names } = await request.json();

  if (!Array.isArray(names)) {
    return Response.json({ existing: [] });
  }

  const found = await prisma.vendor.findMany({
    where: { name: { in: names } },
    select: { name: true },
  });

  return Response.json({ existing: found.map((v) => v.name) });
}
