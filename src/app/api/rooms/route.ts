import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

function serializeRoom(r: {
  id: string; name: string; capacity: number; ownership: string;
  ownerEntity: string; location: string; photoLink: string;
  facilities: { id: string; name: string; type: string; quantity: number; photoLink: string; notes: string }[];
}) {
  return {
    id: r.id,
    name: r.name,
    capacity: r.capacity,
    ownership: r.ownership,
    ownerEntity: r.ownerEntity,
    location: r.location,
    photoLink: r.photoLink,
    facilitiesList: r.facilities.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      quantity: f.quantity,
      photoLink: f.photoLink,
      notes: f.notes,
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownership = searchParams.get("ownership");

    const where: Record<string, unknown> = {};
    if (ownership && ownership !== "ALL") where.ownership = ownership;

    const rooms = await prisma.room.findMany({
      where,
      include: { facilities: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ rooms: rooms.map(serializeRoom) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, capacity, ownership, ownerEntity, location, photoLink, facilitiesList } =
      await request.json();

    if (!name || !capacity || !location) {
      return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    const validFacilities = (facilitiesList ?? []).filter(
      (f: { name: string }) => f.name.trim() !== ""
    );

    const room = await prisma.room.create({
      data: {
        name,
        capacity: parseInt(capacity),
        ownership: ownership ?? "INTERNAL",
        ownerEntity: ownerEntity ?? "",
        location,
        photoLink: photoLink ?? "",
        facilities: {
          create: validFacilities.map((f: { name: string; type: string; quantity: number; photoLink: string; notes: string }) => ({
            name: f.name,
            type: f.type ?? "",
            quantity: parseInt(String(f.quantity)) || 1,
            photoLink: f.photoLink ?? "",
            notes: f.notes ?? "",
          })),
        },
      },
      include: { facilities: { orderBy: { createdAt: "asc" } } },
    });

    return Response.json({ room: serializeRoom(room) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
