import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, capacity, ownership, ownerEntity, location, photoLink, facilitiesList } =
      await request.json();

    if (!name || !capacity || !location) {
      return Response.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    const validFacilities = (facilitiesList ?? []).filter(
      (f: { name: string }) => f.name.trim() !== ""
    );

    await prisma.roomFacility.deleteMany({ where: { roomId: id } });

    const room = await prisma.room.update({
      where: { id },
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

    return Response.json({
      room: {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        ownership: room.ownership,
        ownerEntity: room.ownerEntity,
        location: room.location,
        photoLink: room.photoLink,
        facilitiesList: room.facilities.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          quantity: f.quantity,
          photoLink: f.photoLink,
          notes: f.notes,
        })),
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
    await prisma.room.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
