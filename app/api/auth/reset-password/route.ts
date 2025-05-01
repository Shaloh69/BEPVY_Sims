// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getTokenByValue,
  updatePassword,
  removeToken,
} from "@/lib/jsonStorage";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    // Check if password meets requirements
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Find token in database
    const tokenRecord = getTokenByValue(token);
    if (!tokenRecord) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenRecord.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Token has expired" },
        { status: 400 }
      );
    }

    // Check if token is for password reset
    if (tokenRecord.type !== "password-reset") {
      return NextResponse.json(
        { message: "Invalid token type" },
        { status: 400 }
      );
    }

    // Update password
    const updated = await updatePassword(tokenRecord.userId, password);
    if (!updated) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove token
    removeToken(tokenRecord.id);

    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
