// app/api/calculations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getCalculationsByUserId } from "@/lib/jsonStorage";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    ) as { id: string; email: string };

    // Get calculations for user
    const calculations = getCalculationsByUserId(decoded.id);

    return NextResponse.json({ calculations }, { status: 200 });
  } catch (error) {
    console.error("Get calculations error:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving calculations" },
      { status: 500 }
    );
  }
}
