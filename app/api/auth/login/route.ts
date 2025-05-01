// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserByEmail, verifyPassword } from "@/lib/jsonStorage";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(user, password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email address before logging in" },
        { status: 403 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    // Set cookie with JWT token
    (
      await // Set cookie with JWT token
      cookies()
    ).set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
    });

    // Return user without password
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };

    return NextResponse.json(
      { message: "Login successful", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
