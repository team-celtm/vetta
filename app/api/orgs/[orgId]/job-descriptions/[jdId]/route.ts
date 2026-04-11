// app/api/orgs/[orgId]/job-descriptions/[jdId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JDDetail {
  id: string;
  org_id: string;
  title: string;
  status: string;
  file_name: string | null;
  inferred_skills: Array<{ name: string; weight: number }>;
  inferred_personality: Record<string, number>;
  inferred_seniority: string | null;
  inferred_domain: string | null;
  inference_version: string | null;
  created_at: string;
  updated_at: string;
}

// ─── AUTH HELPER (same as upload route) ───────────────────────────────────────

async function getUserIdFromRequest(req: NextRequest) {
  const token = req.cookies.get("vetta_token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return payload.sub as string;
  } catch {
    return null;
  }
}

// ─── GET /api/orgs/:orgId/job-descriptions/:jdId ─────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string }> },
) {
  try {
    // ✅ FIX: params is a Promise in Next.js App Router
    const { orgId, jdId } = await params;

    // ✅ SAME AUTH STYLE AS UPLOAD
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // ─── Fetch JD ────────────────────────────────────────────────────────────

    const rows = await query<JDDetail>(
      `SELECT
         id,
         org_id,
         title,
         status,
         file_name,
         inferred_skills,
         inferred_personality,
         inferred_seniority,
         inferred_domain,
         inference_version,
         created_at,
         updated_at
       FROM job_descriptions
       WHERE id = $1 AND org_id = $2
       LIMIT 1`,
      [jdId, orgId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Job description not found." },
        { status: 404 },
      );
    }

    const jd = rows[0];

    return NextResponse.json({
      job_description: jd,
    });
  } catch (err) {
    console.error("[GET jd route error]", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/orgs/:orgId/job-descriptions/:jdId ───────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string }> },
) {
  try {
    const { orgId, jdId } = await params;

    // ✅ SAME AUTH AS UPLOAD
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid body." },
        { status: 400 },
      );
    }

    const ALLOWED_STATUSES = ["paused", "active", "closed"];
    const { status } = body as { status?: string };

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const rows = await query<{ id: string; status: string }>(
      `UPDATE job_descriptions
       SET status = $1
       WHERE id = $2 AND org_id = $3
       RETURNING id, status`,
      [status, jdId, orgId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Job description not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      jd_id: rows[0].id,
      status: rows[0].status,
    });
  } catch (err) {
    console.error("[PATCH jd route error]", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}