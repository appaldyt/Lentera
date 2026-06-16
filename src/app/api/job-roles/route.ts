import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.jobRole.findMany({
      include: {
        competencyNeeds: {
          include: {
            trainings: true,
            certifications: true
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    const formattedRoles = roles.map(role => {
      let totalCompetencies = role.competencyNeeds.length;
      let trainingNeeds = 0;
      let certificationNeeds = 0;

      role.competencyNeeds.forEach(comp => {
        trainingNeeds += comp.trainings.filter(t => t.isRequired).length;
        certificationNeeds += comp.certifications.filter(c => c.isRequired).length;
      });

      return {
        id: role.code, // Frontend uses code as ID for routing (e.g., OPS-001)
        realId: role.id,
        name: role.name,
        department: role.department,
        totalCompetencies,
        trainingNeeds,
        certificationNeeds
      };
    });

    return NextResponse.json(formattedRoles);
  } catch (error: any) {
    console.error("Error fetching job roles:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, department } = body;

    const role = await prisma.jobRole.create({
      data: {
        code,
        name,
        department
      }
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
