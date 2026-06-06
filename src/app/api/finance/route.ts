import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

type ProcessRow = {
  id: string; stepNo: number; tahap: string; status: string;
  tanggal: Date | null; keterangan: string; linkBukti: string;
};

function serializeProcess(p: ProcessRow) {
  return {
    id: p.id,
    stepNo: p.stepNo,
    tahap: p.tahap,
    status: p.status,
    tanggal: p.tanggal ? formatDate(p.tanggal) : null,
    keterangan: p.keterangan,
    linkBukti: p.linkBukti,
  };
}

function serializeBudget(b: {
  id: string; trainingName: string; budgetYear: number; budgetMonth: number;
  trainingType: string; plannedAmount: number; actualAmount: number;
  invoiceDate: Date | null; organizer: string; dueDate: Date | null;
  status: string; approvalStatus: string; processes: ProcessRow[];
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
    processes: b.processes
      .sort((a, b) => a.stepNo - b.stepNo)
      .map(serializeProcess),
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
      include: { processes: true },
      orderBy: [{ budgetYear: "desc" }, { budgetMonth: "desc" }],
    });

    return Response.json({ budgets: budgets.map(serializeBudget) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      trainingName, budgetYear, budgetMonth, trainingType,
      plannedAmount, actualAmount, invoiceDate, organizer,
      dueDate, status, approvalStatus, processDetails,
    } = await request.json();

    if (!trainingName || !budgetYear || !budgetMonth) {
      return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    const validProcesses = (processDetails ?? []).filter(
      (p: { tahap: string }) => p.tahap?.trim() !== ""
    );

    const budget = await prisma.budget.create({
      data: {
        trainingName,
        budgetYear: parseInt(budgetYear),
        budgetMonth: parseInt(budgetMonth),
        trainingType: trainingType ?? "Mandatory",
        plannedAmount: parseInt(plannedAmount) || 0,
        actualAmount: parseInt(actualAmount) || 0,
        invoiceDate: invoiceDate ? parseDate(invoiceDate) : null,
        organizer: organizer ?? "",
        dueDate: dueDate ? parseDate(dueDate) : null,
        status: status ?? "Belum Dibayar",
        approvalStatus: approvalStatus ?? "Menunggu Persetujuan",
        processes: {
          create: validProcesses.map(
            (p: { tahap: string; status: string; tanggal: string; keterangan: string; linkBukti: string }, idx: number) => ({
              stepNo: idx + 1,
              tahap: p.tahap,
              status: p.status ?? "Belum",
              tanggal: p.tanggal ? parseDate(p.tanggal) : null,
              keterangan: p.keterangan ?? "",
              linkBukti: p.linkBukti ?? "",
            })
          ),
        },
      },
      include: { processes: true },
    });

    return Response.json({ budget: serializeBudget(budget) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
