// app/api/calculations/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createCalculation } from "@/lib/jsonStorage";

export async function POST(request: NextRequest) {
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

    // Get calculation data from request
    const { name, roomDimensions, lightingRequirements, results } =
      await request.json();

    if (!name || !roomDimensions || !lightingRequirements || !results) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create calculation
    const calculation = createCalculation(
      decoded.id,
      name,
      roomDimensions,
      lightingRequirements,
      results
    );

    return NextResponse.json(
      { message: "Calculation saved successfully", calculation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save calculation error:", error);
    return NextResponse.json(
      { message: "An error occurred while saving the calculation" },
      { status: 500 }
    );
  }
}
