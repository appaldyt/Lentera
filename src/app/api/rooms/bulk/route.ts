import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty data" },
        { status: 400 }
      );
    }

    // Process each room in a transaction or individually
    const results = [];
    
    for (const roomData of data) {
      const room = await prisma.room.create({
        data: {
          name: roomData.name,
          capacity: parseInt(roomData.capacity) || 0,
          ownership: roomData.ownership || "INTERNAL",
          ownerEntity: roomData.ownerEntity || "",
          location: roomData.location || "",
          photoLink: roomData.photoLink || "",
          facilities: {
            create: Array.isArray(roomData.facilitiesList) 
              ? roomData.facilitiesList.map((f: any) => ({
                  name: f.name || "Unknown",
                  type: f.type || "",
                  quantity: parseInt(f.quantity) || 1,
                  photoLink: f.photoLink || "",
                  notes: f.notes || ""
                }))
              : []
          }
        },
        include: {
          facilities: true
        }
      });
      results.push(room);
    }

    return NextResponse.json(
      { message: "Bulk import successful", count: results.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk upload" },
      { status: 500 }
    );
  }
}
