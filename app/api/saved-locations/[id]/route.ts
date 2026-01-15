import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { SavedLocation } from "@/models/schemas/saved-location.schema";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const savedLocation = await SavedLocation.findOne({
      _id: id,
      user: session.user.id,
    });

    if (!savedLocation) {
      return NextResponse.json(
        { error: "Saved location not found" },
        { status: 404 }
      );
    }

    await SavedLocation.findByIdAndDelete(id);

    return NextResponse.json({ message: "Location removed successfully" });
  } catch (error) {
    console.error("Error removing saved location:", error);
    return NextResponse.json(
      { error: "Failed to remove location" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const savedLocation = await SavedLocation.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { $set: { nickname: body.nickname, notes: body.notes } },
      { new: true }
    ).populate("building");

    if (!savedLocation) {
      return NextResponse.json(
        { error: "Saved location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(savedLocation);
  } catch (error) {
    console.error("Error updating saved location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}
