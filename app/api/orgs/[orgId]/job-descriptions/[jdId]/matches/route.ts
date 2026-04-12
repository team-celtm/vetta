// app/api/orgs/[orgId]/job-descriptions/[jdId]/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

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
      // Full candidate fields
      email: string | null;
      phone: string | null;
      linkedin_url: string | null;
      city: string | null;
      country: string | null;
      current_company: string | null;
      skill_scores: unknown;
      work_history: unknown;
      certifications: unknown;
      personality_scores: unknown;
    }>(
      `
      SELECT
        v.candidate_id    AS id,
        v.full_name       AS name,
        v.current_title   AS role,
        v.match_score     AS match,
        v.skills,
        c.city            AS location,
        c.availability,
        c.years_exp,
        -- Full candidate detail fields
        c.email,
        c.phone,
        c.linkedin_url,
        c.city,
        c.country,
        c.current_company,
        c.skills          AS skill_scores,
        c.work_history,
        c.certifications,
        c.personality_scores
      FROM v_top_matches v
      JOIN job_descriptions jd ON v.jd_id = jd.id
      JOIN candidates c ON c.id = v.candidate_id
      WHERE v.jd_id   = $1::uuid
        AND jd.org_id = $2::uuid
      ORDER BY v.match_score DESC
      LIMIT 20
      `,
      [jdId, orgId],
    );

    const formatted = results.map((c) => {
      // Parse skills array: [{ name, level }]
      const rawSkills = Array.isArray(c.skill_scores) ? c.skill_scores : [];

      const skillScores = rawSkills
        .filter((s: unknown) => typeof s === "object" && s !== null)
        .map((s: unknown) => {
          const skill = s as { name: string; level?: number; score?: number };
          return { name: skill.name, score: skill.level ?? skill.score ?? 75 };
        });

      const skillNames = skillScores.slice(0, 3).map((s) => s.name);

      // Parse work history
      const workHistory = Array.isArray(c.work_history)
        ? (c.work_history as Array<{
            title: string;
            company: string;
            from: string;
            to: string | null;
            current?: boolean;
          }>)
        : [];

      // Parse certifications
      const certifications = Array.isArray(c.certifications)
        ? (c.certifications as Array<{
            name: string;
            issuer: string;
            year: number;
          }>)
        : [];

      return {
        id: c.id,
        name: c.name,
        role: c.role ?? "Unknown Role",
        match: Math.round(c.match ?? 0),
        location: c.location ?? c.city ?? "Remote",
        experience: `${c.years_exp ?? 0}+ yrs`,
        availability: c.availability ?? "",
        available:
          c.availability === "available-now" || c.availability === "open",
        skills: skillNames,
        skillScores,
        // Contact
        email: c.email ?? undefined,
        phone: c.phone ?? undefined,
        linkedin: c.linkedin_url ?? undefined,
        city: c.city ?? undefined,
        // Structured
        workHistory,
        certifications,
        personalityScores: c.personality_scores as Record<string, number> | undefined,
      };
    });

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