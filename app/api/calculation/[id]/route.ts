// app/api/calculations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import {
  getCalculations,
  saveCalculations,
  getUserById,
} from "@/lib/jsonStorage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get calculation ID from route parameters
    const calculationId = params.id;

    if (!calculationId) {
      return NextResponse.json(
        { message: "Calculation ID is required" },
        { status: 400 }
      );
    }

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

    // Get user from database
    const user = getUserById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get all calculations
    const calculations = getCalculations();

    // Find the calculation to delete
    const calculationIndex = calculations.findIndex(
      (calc) => calc.id === calculationId
    );

    if (calculationIndex === -1) {
      return NextResponse.json(
        { message: "Calculation not found" },
        { status: 404 }
      );
    }

    // Check if the calculation belongs to the user
    if (calculations[calculationIndex].userId !== user.id) {
      return NextResponse.json(
        { message: "You do not have permission to delete this calculation" },
        { status: 403 }
      );
    }

    // Remove the calculation
    calculations.splice(calculationIndex, 1);

    // Save the updated calculations
    saveCalculations(calculations);

    return NextResponse.json(
      { message: "Calculation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete calculation error:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the calculation" },
      { status: 500 }
    );
  }
}
