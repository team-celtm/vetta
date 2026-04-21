// app/api/settings/org/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

import { jwtVerify } from "jose";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgRow {
  id: string;
  name: string;
  industry: string | null;
  primary_city: string | null;
  plan: string;
  is_active: boolean;
  domain:string;
}

interface UserRow {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface JWTPayload {
  sub: string;
  org_id: string;
  role: string;
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function getAuthPayload(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get("vetta_token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}



export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthPayload(req);

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 1. Fetch org details
    const orgs = await query<OrgRow>(
      `SELECT id, name, industry, primary_city,domain, plan, is_active
       FROM orgs
       WHERE id = $1
       LIMIT 1`,
      [auth.org_id]
    );

    if (orgs.length === 0 || !orgs[0].is_active) {
      return NextResponse.json(
        { error: "Organisation not found or inactive." },
        { status: 404 }
      );
    }

    const org = orgs[0];

    // 2. Fetch all active users in this org
    const users = await query<UserRow>(
      `SELECT id, org_id, full_name, email, role, avatar_url
       FROM users
       WHERE org_id = $1
         AND is_active = true
       ORDER BY
         CASE role
           WHEN 'admin'   THEN 1
           WHEN 'manager' THEN 2
           WHEN 'member'  THEN 3
           WHEN 'viewer'  THEN 4
           ELSE 5
         END,
         full_name ASC`,
      [auth.org_id]
    );

    return NextResponse.json(
      {
        org: {
          id: org.id,
          name: org.name,
          industry: org.industry ?? "",
          primary_city: org.primary_city ?? "",
          plan: org.plan,
          domain:org.domain
        },
        team_members: users.map((u) => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          role: u.role,
          avatar_url: u.avatar_url ?? null,
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /api/settings/org] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/settings/org ───────────────────────────────────────────────────
// Updates org name, industry, and primary_city.
// Only admin or manager roles are allowed.

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthPayload(req);

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Only admins and managers can update org settings
    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json(
        { error: "You do not have permission to update org settings." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { name, industry, primary_city } = body as {
      name?: string;
      industry?: string;
      primary_city?: string;
    };

    // Validate at least one field is being updated
    if (name === undefined && industry === undefined && primary_city === undefined) {
      return NextResponse.json(
        { error: "No fields provided to update." },
        { status: 400 }
      );
    }

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Company name cannot be empty." },
        { status: 400 }
      );
    }

    // Build dynamic SET clause
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIdx++}`);
      values.push(name.trim());
    }
    if (industry !== undefined) {
      setClauses.push(`industry = $${paramIdx++}`);
      values.push(industry.trim() || null);
    }
    if (primary_city !== undefined) {
      setClauses.push(`primary_city = $${paramIdx++}`);
      values.push(primary_city.trim() || null);
    }

    values.push(auth.org_id); // for the WHERE clause

    const updatedOrgs = await query<OrgRow>(
      `UPDATE orgs
       SET ${setClauses.join(", ")}
       WHERE id = $${paramIdx}
       RETURNING id, name, industry, primary_city, plan`,
      values
    );

    if (updatedOrgs.length === 0) {
      return NextResponse.json(
        { error: "Organisation not found." },
        { status: 404 }
      );
    }

    const updated = updatedOrgs[0];

    return NextResponse.json(
      {
        message: "Organisation settings updated successfully.",
        org: {
          id: updated.id,
          name: updated.name,
          industry: updated.industry ?? "",
          primary_city: updated.primary_city ?? "",
          plan: updated.plan,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[PATCH /api/settings/org] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}