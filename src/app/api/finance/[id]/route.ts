import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate, parseDate } from "@/lib/api-utils";

type ProcessRow = {
  id: string; stepNo: number; tahap: string; status: string;
  tanggal: Date | null; keterangan: string; linkBukti: string;
};

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
      .map((p) => ({
        id: p.id,
        stepNo: p.stepNo,
        tahap: p.tahap,
        status: p.status,
        tanggal: p.tanggal ? formatDate(p.tanggal) : null,
        keterangan: p.keterangan,
        linkBukti: p.linkBukti,
      })),
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      trainingName, budgetYear, budgetMonth, trainingType,
      plannedAmount, actualAmount, invoiceDate, organizer,
      dueDate, status, approvalStatus, processDetails,
    } = await request.json();

    const validProcesses = (processDetails ?? []).filter(
      (p: { tahap: string }) => p.tahap?.trim() !== ""
    );

    await prisma.budgetProcess.deleteMany({ where: { budgetId: id } });

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

    return Response.json({ budget: serializeBudget(budget) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.budget.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
