import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Routes that do NOT require auth
const PUBLIC_PATHS = ["/login", "/signup", "/"];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("vetta_token")?.value;

  // No token → redirect to login
  if (!token) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  try {
    // Verify token (also checks expiry)
    await jwtVerify(token, secret);

    // Token valid → allow request
    return NextResponse.next();
  } catch {
    // Token expired or invalid → redirect to login
    const url = new URL("/login", req.url);
    const response = NextResponse.redirect(url);

    // Optional: clear invalid cookie
    response.cookies.set("vetta_token", "", {
      path: "/",
      maxAge: 0,
    });

    return response;
  }
}

// Apply middleware only to protected routes
export const config = {
  matcher: [
    "/dashboard",
    "/api/:path*",
    "/candidates/:path*",
    "/jobs/:path*",
  ],
};