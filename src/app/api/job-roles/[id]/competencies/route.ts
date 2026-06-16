import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { competencyId, isRequired } = body;

    // First find the JobRole by its code (id)
    const role = await prisma.jobRole.findUnique({
      where: { code: id }
    });

    if (!role) {
      return NextResponse.json({ error: "Job role not found" }, { status: 404 });
    }

    const jobRoleCompetency = await prisma.jobRoleCompetency.create({
      data: {
        jobRoleId: role.id,
        competencyId: competencyId,
        isRequired: isRequired || false
      },
      include: {
        competency: true,
        trainings: true,
        certifications: true
      }
    });

    return NextResponse.json(jobRoleCompetency, { status: 201 });
  } catch (error: any) {
    console.error("Error adding competency to job role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
