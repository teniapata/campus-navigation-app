import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not available");
    }

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        email,
      });
    }

    const storedPassword = user.password;

    if (!storedPassword) {
      return NextResponse.json({
        success: false,
        error: "No password set for this user",
        email,
        hasPassword: false,
      });
    }

    // Test bcrypt comparison
    const isValid = await bcrypt.compare(password, storedPassword);

    // Also test with a fresh hash to make sure bcrypt is working
    const testHash = await bcrypt.hash(password, 12);
    const testCompare = await bcrypt.compare(password, testHash);

    return NextResponse.json({
      success: isValid,
      debug: {
        email: user.email,
        role: user.role,
        hasPassword: !!storedPassword,
        passwordLength: storedPassword?.length,
        passwordPrefix: storedPassword?.substring(0, 10),
        inputPassword: password,
        isValid,
        bcryptWorking: testCompare,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Test failed", details: String(error) },
      { status: 500 }
    );
  }
}
