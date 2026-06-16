import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const role = await prisma.jobRole.findUnique({
      where: { code: id },
      include: {
        competencyNeeds: {
          include: {
            competency: true,
            trainings: true,
            certifications: true
          }
        }
      }
    });

    if (!role) {
      return NextResponse.json({ error: "Job role not found" }, { status: 404 });
    }

    // Format for the frontend
    let wajib = 0;
    let opsional = 0;
    let trainingNeeds = 0;
    let certificationNeeds = 0;

    const competencies = role.competencyNeeds.map(jc => {
      if (jc.isRequired) wajib++; else opsional++;
      
      trainingNeeds += jc.trainings.filter(t => t.isRequired).length;
      certificationNeeds += jc.certifications.filter(c => c.isRequired).length;

      return {
        id: jc.competency.code, 
        jobRoleCompId: jc.id, 
        name: jc.competency.name,
        category: jc.competency.category,
        level: jc.competency.level,
        isRequired: jc.isRequired,
        description: jc.competency.definition,
        trainings: jc.trainings,
        certifications: jc.certifications
      };
    });

    return NextResponse.json({
      id: role.code,
      realId: role.id,
      name: role.name,
      department: role.department,
      stats: {
        wajib,
        opsional,
        trainingNeeds,
        certificationNeeds,
        totalCompetencies: role.competencyNeeds.length
      },
      competencies
    });
  } catch (error: any) {
    console.error("Error fetching job role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, department } = body;

    const role = await prisma.jobRole.update({
      where: { code: id },
      data: { name, department }
    });

    return NextResponse.json(role);
  } catch (error: any) {
    console.error("Error updating job role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.jobRole.delete({
      where: { code: id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting job role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
