import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Invalid or empty data" }, { status: 400 });
    }

    // Cek nama vendor yang sudah ada (1 query untuk seluruh batch)
    const incomingNames = data.map((r: { name: string }) => r.name);
    const existing = await prisma.vendor.findMany({
      where: { name: { in: incomingNames } },
      select: { id: true, name: true },
    });
    const existingMap = new Map(existing.map((v) => [v.name, v.id]));

    const results: {
      created: string[];
      updated: string[];
      failed: { name: string; reason: string }[];
    } = { created: [], updated: [], failed: [] };

    for (const row of data) {
      try {
        // Normalise status: "Aktif" → "AKTIF", "Tidak Aktif" → "TIDAK_AKTIF"
        const rawStatus = String(row.status || "").trim();
        const status =
          rawStatus === "Aktif" ? "AKTIF" :
          rawStatus === "Tidak Aktif" ? "TIDAK_AKTIF" :
          rawStatus || "AKTIF";

        const vendorData = {
          location: row.location || "",
          phone: row.phone || "",
          email: row.email || "",
          topics: Array.isArray(row.topics) ? row.topics : [],
          method: row.method || "Online",
          status,
          priceMin: parseInt(String(row.priceMin)) || 0,
          priceMax: parseInt(String(row.priceMax)) || 0,
          rating: parseFloat(String(row.rating)) || 0,
          usedBefore: row.usedBefore ?? false,
          notes: row.notes || "",
          legalDocUrl: row.legalDocUrl || "",
        };

        const existingId = existingMap.get(row.name);
        if (existingId) {
          await prisma.vendor.update({ where: { id: existingId }, data: vendorData });
          results.updated.push(row.name);
        } else {
          await prisma.vendor.create({ data: { name: row.name, ...vendorData } });
          results.created.push(row.name);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.failed.push({ name: row.name, reason: msg.slice(0, 80) });
      }
    }

    return NextResponse.json(results, { status: 207 });
  } catch (error) {
    console.error("Bulk vendor import error:", error);
    return NextResponse.json({ error: "Failed to process bulk import" }, { status: 500 });
  }
}
