import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

function serializeBudget(b: {
  id: string; trainingName: string; budgetYear: number; budgetMonth: number;
  trainingType: string; plannedAmount: number; actualAmount: number;
  invoiceDate: Date | null; organizer: string; dueDate: Date | null;
  status: string; approvalStatus: string;
}) {
  return {
    id: b.id,
    trainingName: b.trainingName,
    budgetYear: b.budgetYear,
    budgetMonth: b.budgetMonth,
    trainingType: b.trainingType,
    plannedAmount: b.plannedAmount,
    actualAmount: b.actualAmount,
    invoiceDate: b.invoiceDate ? formatDate(b.invoiceDate) : null,
    organizer: b.organizer,
    dueDate: b.dueDate ? formatDate(b.dueDate) : null,
    status: b.status,
    approvalStatus: b.approvalStatus,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const {
    trainingName, budgetYear, budgetMonth, trainingType,
    plannedAmount, actualAmount, invoiceDate, organizer,
    dueDate, status, approvalStatus,
  } = await request.json();

  const budget = await prisma.budget.update({
    where: { id },
    data: {
      trainingName,
      budgetYear: parseInt(budgetYear),
      budgetMonth: parseInt(budgetMonth),
      trainingType,
      plannedAmount: parseInt(plannedAmount) || 0,
      actualAmount: parseInt(actualAmount) || 0,
      invoiceDate: invoiceDate ? parseDate(invoiceDate) : null,
      organizer: organizer ?? "",
      dueDate: dueDate ? parseDate(dueDate) : null,
      status,
      approvalStatus,
    },
  });

  return Response.json({ budget: serializeBudget(budget) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.budget.delete({ where: { id } });
  return Response.json({ success: true });
}
