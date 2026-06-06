import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Invalid or empty data" }, { status: 400 });
    }

    // Cek nama ruangan yang sudah ada (1 query untuk seluruh batch)
    const incomingNames = data.map((r: { name: string }) => r.name);
    const existing = await prisma.room.findMany({
      where: { name: { in: incomingNames } },
      select: { id: true, name: true },
    });
    const existingMap = new Map(existing.map((r) => [r.name, r.id]));

    const results: {
      created: string[];
      updated: string[];
      failed: { name: string; reason: string }[];
    } = { created: [], updated: [], failed: [] };

    for (const roomData of data) {
      try {
        const facilitiesCreate = Array.isArray(roomData.facilitiesList)
          ? roomData.facilitiesList.map((f: { name?: string; type?: string; quantity?: number; photoLink?: string; notes?: string }) => ({
              name: f.name || "",
              type: f.type || "",
              quantity: parseInt(String(f.quantity)) || 1,
              photoLink: f.photoLink || "",
              notes: f.notes || "",
            }))
          : [];

        const existingId = existingMap.get(roomData.name);

        if (existingId) {
          // Update: hapus fasilitas lama, buat ulang dari data baru
          await prisma.room.update({
            where: { id: existingId },
            data: {
              capacity: parseInt(roomData.capacity) || 0,
              ownership: roomData.ownership || "INTERNAL",
              ownerEntity: roomData.ownerEntity || "",
              location: roomData.location || "",
              photoLink: roomData.photoLink || "",
              facilities: {
                deleteMany: {},
                create: facilitiesCreate,
              },
            },
          });
          results.updated.push(roomData.name);
        } else {
          await prisma.room.create({
            data: {
              name: roomData.name,
              capacity: parseInt(roomData.capacity) || 0,
              ownership: roomData.ownership || "INTERNAL",
              ownerEntity: roomData.ownerEntity || "",
              location: roomData.location || "",
              photoLink: roomData.photoLink || "",
              facilities: { create: facilitiesCreate },
            },
          });
          results.created.push(roomData.name);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.failed.push({ name: roomData.name, reason: msg.slice(0, 80) });
      }
    }

    return NextResponse.json(results, { status: 207 });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: "Failed to process bulk upload" }, { status: 500 });
  }
}
