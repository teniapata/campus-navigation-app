import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Building } from "@/models/schemas/building.schema";
import { Event } from "@/models/schemas/event.schema";
import { User } from "@/models/schemas/user.schema";
import {
  covenantUniversityBuildings,
  sampleEvents,
} from "@/data/seed/buildings";
import { campusPathNodes } from "@/data/seed/path-nodes";
import { PathNode } from "@/models/schemas/path-node.schema";

// Default admin credentials
const DEFAULT_ADMIN = {
  name: "Campus Admin",
  email: "admin@cu.edu.ng",
  password: "Admin@123",
  role: "super_admin" as const,
};

export async function POST(request: NextRequest) {
  try {
    // In development, allow seeding without auth
    // In production, require super_admin
    if (process.env.NODE_ENV === "production") {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Check if data already exists
    const existingBuildings = await Building.countDocuments();

    if (existingBuildings > 0 && !force) {
      return NextResponse.json(
        {
          error: "Database already seeded",
          message:
            "Use ?force=true to overwrite existing data. WARNING: This will delete all existing buildings and events.",
          existingCount: existingBuildings,
        },
        { status: 400 }
      );
    }

    // If forcing, delete existing data
    if (force) {
      await Building.deleteMany({});
      await Event.deleteMany({});
      await PathNode.deleteMany({});
    }

    // Insert buildings
    const insertedBuildings = await Building.insertMany(
      covenantUniversityBuildings
    );

    // Create a map of building names to IDs
    const buildingMap = new Map(
      insertedBuildings.map((b) => [b.name, b._id])
    );

    // Create or update admin user with password
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email }).select("+password");
    if (!existingAdmin) {
      await User.create({
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        password: DEFAULT_ADMIN.password,
        role: DEFAULT_ADMIN.role,
        isActive: true,
      });
    } else {
      // Always update admin with password to ensure it's set
      existingAdmin.name = DEFAULT_ADMIN.name;
      existingAdmin.password = DEFAULT_ADMIN.password;
      existingAdmin.role = DEFAULT_ADMIN.role;
      existingAdmin.isActive = true;
      await existingAdmin.save();
    }

    // Get or create a system user for events
    let systemUser = await User.findOne({ email: "system@cu.edu.ng" });
    if (!systemUser) {
      systemUser = await User.create({
        name: "System",
        email: "system@cu.edu.ng",
        role: "admin",
        isActive: true,
      });
    }

    // Insert events with building references
    const eventsWithRefs = sampleEvents.map((event) => ({
      ...event,
      building: buildingMap.get(event.buildingName),
      createdBy: systemUser._id,
    }));

    const insertedEvents = await Event.insertMany(eventsWithRefs);

    // Seed path nodes with building ID references
    const pathNodesWithRefs = campusPathNodes.map((node) => {
      const resolved: Record<string, unknown> = { ...node };
      if (node.buildingName) {
        const building = insertedBuildings.find(
          (b) => b.name === node.buildingName
        );
        if (building) {
          resolved.buildingId = building._id.toString();
        }
      }
      delete resolved.buildingName;
      return resolved;
    });

    await PathNode.deleteMany({});
    const insertedPathNodes = await PathNode.insertMany(pathNodesWithRefs);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        buildings: insertedBuildings.length,
        events: insertedEvents.length,
        pathNodes: insertedPathNodes.length,
      },
      admin: {
        email: DEFAULT_ADMIN.email,
        password: DEFAULT_ADMIN.password,
        note: "Please change this password after first login!",
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const [buildingCount, eventCount, userCount] = await Promise.all([
      Building.countDocuments(),
      Event.countDocuments(),
      User.countDocuments(),
    ]);

    return NextResponse.json({
      status: "ok",
      counts: {
        buildings: buildingCount,
        events: eventCount,
        users: userCount,
      },
      seeded: buildingCount > 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to check database status" },
      { status: 500 }
    );
  }
}
