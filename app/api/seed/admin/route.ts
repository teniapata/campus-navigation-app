import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

// Default admin credentials
const DEFAULT_ADMIN = {
  name: "Campus Admin",
  email: "admin@cu.edu.ng",
  password: "Admin@123",
  role: "super_admin" as const,
};

export async function POST() {
  try {
    await dbConnect();

    // Hash the password manually
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    // Use native MongoDB collection to bypass Mongoose schema restrictions
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not available");
    }

    const usersCollection = db.collection("users");

    // Update or insert directly using MongoDB native driver
    const result = await usersCollection.updateOne(
      { email: DEFAULT_ADMIN.email },
      {
        $set: {
          name: DEFAULT_ADMIN.name,
          email: DEFAULT_ADMIN.email,
          password: hashedPassword,
          role: DEFAULT_ADMIN.role,
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Verify password was saved
    const verifyAdmin = await usersCollection.findOne({ email: DEFAULT_ADMIN.email });
    const passwordSaved = verifyAdmin?.password ? true : false;

    return NextResponse.json({
      success: true,
      message: "Admin user created/updated successfully",
      admin: {
        email: DEFAULT_ADMIN.email,
        password: DEFAULT_ADMIN.password,
        note: "Please change this password after first login!",
      },
      debug: {
        id: verifyAdmin?._id,
        passwordSaved,
        passwordLength: verifyAdmin?.password?.length,
        role: verifyAdmin?.role,
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not available");
    }

    const usersCollection = db.collection("users");
    const admin = await usersCollection.findOne({ email: DEFAULT_ADMIN.email });

    return NextResponse.json({
      exists: !!admin,
      email: DEFAULT_ADMIN.email,
      hasPassword: admin?.password ? true : false,
      passwordLength: admin?.password?.length,
      role: admin?.role,
      isActive: admin?.isActive,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check admin status", details: String(error) },
      { status: 500 }
    );
  }
}
