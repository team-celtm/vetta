// app/api/orgs/[orgId]/job-descriptions/[jdId]/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

// ─── Auth Helper ──────────────────────────────────────────────────────────────

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
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

// ─── GET /api/orgs/:orgId/job-descriptions/:jdId/matches ─────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string }> },
) {
  try {
    const { orgId, jdId } = await params;

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const results = await query<{
      id: string;
      name: string;
      role: string;
      match: number;
      skills: unknown;
      location: string | null;
      availability: string | null;
      years_exp: number;
    }>(
      `
  SELECT
    v.candidate_id  AS id,
    v.full_name     AS name,
    v.current_title AS role,
    v.match_score   AS match,
    v.skills,
    c.city          AS location,
    c.availability,
    c.years_exp
  FROM v_top_matches v
  JOIN job_descriptions jd ON v.jd_id = jd.id
  JOIN candidates c ON c.id = v.candidate_id   
  WHERE v.jd_id  = $1::uuid
    AND jd.org_id = $2::uuid
  ORDER BY v.match_score DESC
  LIMIT 20
  `,
      [jdId, orgId],
    );

    console.log("Results", results);
 const formatted = results.map((c) => ({
  id: c.id,
  name: c.name,
  role: c.role ?? "Unknown Role",
  match: Math.round((c.match ?? 0)),
  location: c.location ?? "Remote",

  // ✅ NEW
  experience: `${c.years_exp ?? 0}+ yrs`,

  available:
    c.availability === "available-now" || c.availability === "open",

  skills: Array.isArray(c.skills)
    ? c.skills
        .slice(0, 3)
        .map((s: unknown) =>
          typeof s === "string" ? s : (s as { name: string }).name
        )
    : [],
}));

    return NextResponse.json({ results: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [matches route]", message);
    return NextResponse.json(
      { error: "Query failed", details: message },
      { status: 500 },
    );
  }
}
