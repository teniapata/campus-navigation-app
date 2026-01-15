import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { SavedLocation } from "@/models/schemas/saved-location.schema";
import { savedLocationValidator } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const savedLocations = await SavedLocation.find({ user: session.user.id })
      .populate("building")
      .sort({ createdAt: -1 });

    return NextResponse.json(savedLocations);
  } catch (error) {
    console.error("Error fetching saved locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved locations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validated = savedLocationValidator.parse(body);

    const existing = await SavedLocation.findOne({
      user: session.user.id,
      building: validated.buildingId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Location already saved" },
        { status: 400 }
      );
    }

    const savedLocation = await SavedLocation.create({
      user: session.user.id,
      building: validated.buildingId,
      nickname: validated.nickname,
      notes: validated.notes,
    });

    const populated = await savedLocation.populate("building");

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("Error saving location:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to save location" },
      { status: 500 }
    );
  }
}
