import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const {
      name, location, phone, email, topics, method, status,
      priceMin, priceMax, rating, usedBefore, notes, legalDocUrl,
    } = await request.json();

    if (!name || !location || !phone || !email) {
      return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        name,
        location,
        phone,
        email,
        topics: Array.isArray(topics) ? topics : (topics ?? "").split(",").map((t: string) => t.trim()).filter(Boolean),
        method: method ?? "Online",
        status: status ?? "AKTIF",
        priceMin: parseInt(String(priceMin)) || 0,
        priceMax: parseInt(String(priceMax)) || 0,
        rating: parseFloat(String(rating)) || 0,
        usedBefore: usedBefore ?? false,
        notes: notes ?? "",
        legalDocUrl: legalDocUrl ?? "",
      },
    });

    return Response.json({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        location: vendor.location,
        phone: vendor.phone,
        email: vendor.email,
        topics: vendor.topics,
        method: vendor.method,
        status: vendor.status,
        priceMin: vendor.priceMin,
        priceMax: vendor.priceMax,
        rating: vendor.rating,
        usedBefore: vendor.usedBefore,
        notes: vendor.notes,
        legalDocUrl: vendor.legalDocUrl,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.vendor.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
