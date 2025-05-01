// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// List of protected routes that require authentication
const protectedRoutes = ["/saved-calculations", "/profile", "/settings"];

// List of auth routes that should redirect to home if user is logged in
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  const path = request.nextUrl.pathname;

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute) {
    // If it's a protected route and no token is present, redirect to home page
    if (!authToken) {
      const url = new URL("/", request.url);
      return NextResponse.redirect(url);
    }

    // Verify the token
    try {
      // Use the JWT secret to verify the token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "default-secret"
      );
      await jwtVerify(authToken, secret);

      // Token is valid, allow access
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to home page
      const url = new URL("/", request.url);
      return NextResponse.redirect(url);
    }
  } else if (isAuthRoute && authToken) {
    // If it's an auth route and user has a token, redirect to home page
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // For non-protected routes or valid tokens, continue
  return NextResponse.next();
}

// Only run the middleware on the specified routes
export const config = {
  matcher: [
    "/saved-calculations/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login/:path*",
    "/register/:path*",
  ],
};
