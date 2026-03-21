import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { User } from "@/models/schemas/user.schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Only allow updating role and isActive
    const allowedFields: Record<string, unknown> = {};
    if (body.role && ["user", "admin", "super_admin"].includes(body.role)) {
      allowedFields.role = body.role;
    }
    if (typeof body.isActive === "boolean") {
      allowedFields.isActive = body.isActive;
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Prevent demoting yourself
    if (id === session.user.id && allowedFields.role && allowedFields.role !== "super_admin") {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, { $set: allowedFields }, { new: true });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
