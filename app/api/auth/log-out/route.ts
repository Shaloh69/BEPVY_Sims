// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Clear the auth cookie
    (
      await // Clear the auth cookie
      cookies()
    ).delete("auth_token");

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
