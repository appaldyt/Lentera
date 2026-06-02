import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Invalid or empty data" }, { status: 400 });
    }

    const results = [];
    for (const row of data) {
      const vendor = await prisma.vendor.create({
        data: {
          name: row.name,
          location: row.location || "",
          phone: row.phone || "",
          email: row.email || "",
          topics: Array.isArray(row.topics) ? row.topics : [],
          method: row.method || "Online",
          status: row.status || "AKTIF",
          priceMin: parseInt(String(row.priceMin)) || 0,
          priceMax: parseInt(String(row.priceMax)) || 0,
          rating: parseFloat(String(row.rating)) || 0,
          usedBefore: row.usedBefore ?? false,
          notes: row.notes || "",
          legalDocUrl: row.legalDocUrl || "",
        },
      });
      results.push(vendor);
    }

    return NextResponse.json(
      { message: "Bulk import successful", count: results.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk vendor import error:", error);
    return NextResponse.json({ error: "Failed to process bulk import" }, { status: 500 });
  }
}
