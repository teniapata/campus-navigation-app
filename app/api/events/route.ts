import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Event } from "@/models/schemas/event.schema";
import { eventValidator } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const upcoming = searchParams.get("upcoming");
    const buildingId = searchParams.get("buildingId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isPublic: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (buildingId) {
      query.building = buildingId;
    }

    if (upcoming === "true") {
      query.startDate = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate("building", "name type mapPosition")
      .populate("createdBy", "name email")
      .sort({ startDate: 1 });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
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
    const validated = eventValidator.parse(body);

    const event = await Event.create({
      ...validated,
      building: validated.building,
      createdBy: session.user.id,
    });

    const populated = await event.populate("building", "name type mapPosition");

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
