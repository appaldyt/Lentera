import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Build CSV
    const headers = [
      "NIK",
      "Nama Karyawan",
      "Nama Training",
      "Job Family",
      "Tgl. Mulai",
      "Tgl. Selesai",
      "Jam Belajar",
      "Status",
    ];

    const rows = data.map((item) => [
      `"${item.nik}"`,
      `"${item.name}"`,
      `"${item.training.name}"`,
      `"${item.training.jobFamilies.join(", ")}"`,
      `"${formatDate(item.training.startDate)}"`,
      `"${formatDate(item.training.endDate)}"`,
      `"${item.attendedHours}"`,
      `"Selesai"`,
    ]);

    // Include BOM for Excel UTF-8 support
    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Riwayat_Training.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
