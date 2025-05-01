// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenByValue, verifyUser, removeToken } from "@/lib/jsonStorage";

export async function GET(request: NextRequest) {
  try {
    // Get token from URL
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/verification-error?error=no-token", request.url)
      );
    }

    // Find token in database
    const tokenRecord = getTokenByValue(token);
    if (!tokenRecord) {
      return NextResponse.redirect(
        new URL("/verification-error?error=invalid-token", request.url)
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenRecord.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.redirect(
        new URL("/verification-error?error=expired-token", request.url)
      );
    }

    // Check if token is for email verification
    if (tokenRecord.type !== "email-verification") {
      return NextResponse.redirect(
        new URL("/verification-error?error=wrong-token-type", request.url)
      );
    }

    // Verify user
    const verified = verifyUser(tokenRecord.userId);
    if (!verified) {
      return NextResponse.redirect(
        new URL("/verification-error?error=user-not-found", request.url)
      );
    }

    // Remove token
    removeToken(tokenRecord.id);

    // Redirect to success page
    return NextResponse.redirect(new URL("/verification-success", request.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/verification-error?error=server-error", request.url)
    );
  }
}
