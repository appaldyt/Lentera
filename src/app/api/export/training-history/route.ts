import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const yearStr = searchParams.get("year");
    const monthStr = searchParams.get("month");

    const year = yearStr && yearStr !== "ALL" ? parseInt(yearStr) : null;
    const month = monthStr && monthStr !== "ALL" ? parseInt(monthStr) : null;

    const whereClause: any = {
      training: {
        status: "COMPLETED",
      },
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nik: { contains: search, mode: "insensitive" } },
        { training: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (year !== null) {
      let startDate: Date;
      let endDate: Date;
      if (month !== null) {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
      } else {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      }
      whereClause.trainingDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const data = await prisma.trainingParticipant.findMany({
      where: whereClause,
      include: {
        training: true,
      },
      orderBy: {
        trainingDate: "desc",
      },
    });

    const formatDate = (date: Date | null) => {
      if (!date) return "-";
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    };

    // Build Excel
    const exportData = data.map((item, idx) => ({
      "No": idx + 1,
      "NIK": item.nik,
      "Nama Karyawan": item.name,
      "Nama Training": item.training.name,
      "Job Family": item.training.jobFamilies.join(", "),
      "Tgl. Mulai": formatDate(item.training.startDate),
      "Tgl. Selesai": formatDate(item.training.endDate),
      "Jam Belajar": item.attendedHours,
      "Status": "Selesai",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Training");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Riwayat_Training.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
