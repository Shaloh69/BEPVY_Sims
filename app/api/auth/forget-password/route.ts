// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createToken } from "@/lib/jsonStorage";
import { sendPasswordResetEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists with this email
    const user = getUserByEmail(email);
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      // Just return success message as if the email was sent
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, we've sent a password reset link",
        },
        { status: 200 }
      );
    }

    // Create reset token
    const resetToken = createToken(user.id, "password-reset");

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken.token);

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, we've sent a password reset link",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
