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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    const where: Record<string, unknown> = {};
    if (year) where.budgetYear = parseInt(year);
    if (month) where.budgetMonth = parseInt(month);

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: [{ budgetYear: "desc" }, { budgetMonth: "desc" }],
    });

    return Response.json({ budgets: budgets.map(serializeBudget) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const {
    trainingName, budgetYear, budgetMonth, trainingType,
    plannedAmount, actualAmount, invoiceDate, organizer,
    dueDate, status, approvalStatus,
  } = await request.json();

  if (!trainingName || !budgetYear || !budgetMonth) {
    return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const budget = await prisma.budget.create({
    data: {
      trainingName,
      budgetYear: parseInt(budgetYear),
      budgetMonth: parseInt(budgetMonth),
      trainingType: trainingType ?? "Mandatori",
      plannedAmount: parseInt(plannedAmount) || 0,
      actualAmount: parseInt(actualAmount) || 0,
      invoiceDate: invoiceDate ? parseDate(invoiceDate) : null,
      organizer: organizer ?? "",
      dueDate: dueDate ? parseDate(dueDate) : null,
      status: status ?? "Belum Dibayar",
      approvalStatus: approvalStatus ?? "Menunggu Persetujuan",
    },
  });

  return Response.json({ budget: serializeBudget(budget) }, { status: 201 });
}
