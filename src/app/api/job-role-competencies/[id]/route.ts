import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { isRequired, trainings, certifications } = body;

    const updated = await prisma.$transaction(async (tx) => {
      // Clear existing nested records
      await tx.jobRoleTraining.deleteMany({
        where: { jobRoleCompetencyId: id }
      });
      await tx.jobRoleCertification.deleteMany({
        where: { jobRoleCompetencyId: id }
      });

      // Update and recreate
      return await tx.jobRoleCompetency.update({
        where: { id },
        data: {
          isRequired: isRequired,
          trainings: {
            create: trainings?.map((t: any) => ({
              name: t.name,
              isRequired: t.isRequired,
              notes: t.notes || ""
            })) || []
          },
          certifications: {
            create: certifications?.map((c: any) => ({
              name: c.name,
              isRequired: c.isRequired,
              notes: c.notes || ""
            })) || []
          }
        },
        include: {
          competency: true,
          trainings: true,
          certifications: true
        }
      });
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating job role competency:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    await prisma.jobRoleCompetency.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting job role competency:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
