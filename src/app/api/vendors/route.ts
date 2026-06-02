import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

function serializeVendor(v: {
  id: string; name: string; location: string; phone: string; email: string;
  topics: string[]; method: string; status: string; priceMin: number; priceMax: number;
  rating: number; usedBefore: boolean; notes: string; legalDocUrl: string;
  createdAt: Date; updatedAt: Date;
}) {
  return {
    id: v.id,
    name: v.name,
    location: v.location,
    phone: v.phone,
    email: v.email,
    topics: v.topics,
    method: v.method,
    status: v.status,
    priceMin: v.priceMin,
    priceMax: v.priceMax,
    rating: v.rating,
    usedBefore: v.usedBefore,
    notes: v.notes,
    legalDocUrl: v.legalDocUrl,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const method = searchParams.get("method") ?? "";
    const status = searchParams.get("status") ?? "";
    const usedBefore = searchParams.get("usedBefore") ?? "";
    const minRating = searchParams.get("minRating") ?? "";

    const where: Record<string, unknown> = {};

    if (search) {
      // topics is a PostgreSQL array — `has` requires exact match, so we use
      // a raw subquery with unnest + ILIKE for case-insensitive partial search.
      const topicMatches = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Vendor"
        WHERE EXISTS (
          SELECT 1 FROM unnest(topics) t WHERE t ILIKE ${"%" + search + "%"}
        )
      `;
      const topicIds = topicMatches.map((v) => v.id);

      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        ...(topicIds.length > 0 ? [{ id: { in: topicIds } }] : []),
      ];
    }
    if (method && method !== "Semua") where.method = method;
    if (status && status !== "Semua") where.status = status;
    if (usedBefore === "true") where.usedBefore = true;
    if (usedBefore === "false") where.usedBefore = false;
    if (minRating) where.rating = { gte: parseFloat(minRating) };

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.vendor.count();
    const usedCount = await prisma.vendor.count({ where: { usedBefore: true } });
    const uniqueTopics = await prisma.vendor.findMany({ select: { topics: true } });
    const allTopics = new Set(uniqueTopics.flatMap((v) => v.topics));
    const avgRatingResult = await prisma.vendor.aggregate({ _avg: { rating: true } });

    return Response.json({
      vendors: vendors.map(serializeVendor),
      stats: {
        total,
        usedCount,
        topicsCount: allTopics.size,
        avgRating: avgRatingResult._avg.rating
          ? Math.round(avgRatingResult._avg.rating * 10) / 10
          : 0,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name, location, phone, email, topics, method, status,
      priceMin, priceMax, rating, usedBefore, notes, legalDocUrl,
    } = await request.json();

    if (!name || !location || !phone || !email) {
      return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    const vendor = await prisma.vendor.create({
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

    return Response.json({ vendor: serializeVendor(vendor) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
