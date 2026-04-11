// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { query } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  role: string;
  password_hash: string;
  is_active: boolean;
}

interface OrgRow {
  id: string;
  name: string;
  plan: string;
  is_active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

// ─── POST /api/login ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Parse & validate request body
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const users = await query<UserRow>(
      `SELECT id, org_id, email, full_name, role, password_hash, is_active
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email.toLowerCase().trim()],
    );

    // Use a generic error to avoid user enumeration
    const INVALID = { error: "Invalid email or password." };

    if (users.length === 0) {
      return NextResponse.json(INVALID, { status: 401 });
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json(
        { error: "Your account has been deactivated. Contact your admin." },
        { status: 403 },
      );
    }

    // 3. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(INVALID, { status: 401 });
    }

    // 4. Fetch the org to check it's still active
    const orgs = await query<OrgRow>(
      `SELECT id, name, plan, is_active
       FROM orgs
       WHERE id = $1
       LIMIT 1`,
      [user.org_id],
    );

    if (orgs.length === 0 || !orgs[0].is_active) {
      return NextResponse.json(
        { error: "Your organisation account is inactive." },
        { status: 403 },
      );
    }

    const org = orgs[0];

    query(`UPDATE users SET last_login = now() WHERE id = $1`, [user.id]).catch(
      (err) => console.error("Failed to update last_login:", err),
    );

    // 6. Sign JWT
    const token = await signToken({
      sub: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      org_id: user.org_id,
      org_name: org.name,
      plan: org.plan,
    });


    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          org: {
            id: org.id,
            name: org.name,
            plan: org.plan,
          },
        },
      },
      { status: 200 },
    );


    response.cookies.set("vetta_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, 
    });
    response.cookies.set("vetta_org_id", org.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (err) {
    console.error("[POST /api/login] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
