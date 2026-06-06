import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { keys } = await request.json() as { keys: { nik: string; licenseName: string }[] };

  if (!Array.isArray(keys) || keys.length === 0) {
    return Response.json({ existing: [] });
  }

  const found = await prisma.license.findMany({
    where: { OR: keys },
    select: { nik: true, licenseName: true },
  });

  return Response.json({ existing: found.map((e) => `${e.nik}|${e.licenseName}`) });
}
