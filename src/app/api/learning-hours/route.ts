import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

interface RawRow {
  nik: string;
  name: string;
  department: string;
  year: string;
  totalHours: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  const rows = await prisma.$queryRaw<RawRow[]>(
    year
      ? Prisma.sql`
          SELECT
            nik,
            name,
            department,
            EXTRACT(YEAR FROM "trainingDate")::text AS year,
            CAST(SUM("attendedHours") AS INTEGER)   AS "totalHours"
          FROM "TrainingParticipant"
          WHERE EXTRACT(YEAR FROM "trainingDate") = ${parseInt(year)}
          GROUP BY nik, name, department, EXTRACT(YEAR FROM "trainingDate")
          ORDER BY year DESC, "totalHours" DESC
        `
      : Prisma.sql`
          SELECT
            nik,
            name,
            department,
            EXTRACT(YEAR FROM "trainingDate")::text AS year,
            CAST(SUM("attendedHours") AS INTEGER)   AS "totalHours"
          FROM "TrainingParticipant"
          GROUP BY nik, name, department, EXTRACT(YEAR FROM "trainingDate")
          ORDER BY year DESC, "totalHours" DESC
        `
  );

  const data = rows.map((row) => ({
    id: `${row.nik}-${row.year}`,
    nik: row.nik,
    name: row.name,
    department: row.department,
    year: row.year,
    totalHours: Number(row.totalHours),
  }));

  return Response.json({ data });
}
