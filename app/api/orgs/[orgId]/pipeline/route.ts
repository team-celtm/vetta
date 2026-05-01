// app/api/orgs/[orgId]/pipeline/route.ts
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
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const { orgId } = await params;

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage") ?? "interview"; 

    const rows = await query<{
      entry_id: string;
      candidate_id: string;
      stage: string;
      is_shortlisted: boolean;
      priority: number;
      notes: string | null;
      full_name: string;
      current_title: string | null;
      city: string | null;
      availability: string | null;
      years_exp: number;
      vetta_score: number;
      match_score: number | null;
      skills: unknown;
      jd_id: string;
      jd_title: string | null;
    }>(
      `
      SELECT
        pe.id               AS entry_id,
        pe.candidate_id,
        pe.stage,
        pe.is_shortlisted,
        pe.priority,
        pe.notes,
        c.full_name,
        c.current_title,
        c.city,
        c.availability,
        c.years_exp,
        c.vetta_score,
        c.skills,
        m.match_score,
        pe.jd_id,
        jd.title            AS jd_title
      FROM pipeline_entries pe
      JOIN candidates       c  ON c.id  = pe.candidate_id
      JOIN job_descriptions jd ON jd.id = pe.jd_id
      LEFT JOIN matches     m  ON m.jd_id = pe.jd_id AND m.candidate_id = pe.candidate_id
      WHERE pe.org_id = $1::uuid
        AND pe.stage  = $2
        AND c.is_active = true
      ORDER BY pe.updated_at DESC
      `,
      [orgId, stage],
    );

    const formatted = rows.map((row) => {
      const rawSkills = Array.isArray(row.skills) ? row.skills : [];
      const tags = rawSkills
        .slice(0, 3)
        .map((s: unknown) => {
          const skill = s as { name?: string };
          return skill?.name ?? "";
        })
        .filter(Boolean);

      // Initials from full name
      const initials = row.full_name
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

      const score = row.match_score ?? row.vetta_score ?? 0;
      const scoreColor =
        score >= 80 ? "green" : score >= 65 ? "orange" : "yellow";

      const avatarColors = [
        "bg-purple-400", "bg-blue-500", "bg-green-500",
        "bg-orange-400", "bg-pink-400", "bg-teal-500",
        "bg-indigo-400", "bg-red-400",
      ];
      // Stable color per candidate based on id
      const colorIndex =
        row.candidate_id.charCodeAt(0) % avatarColors.length;

      return {
        id: row.entry_id,
        candidateId: row.candidate_id,
        initials,
        avatarColor: avatarColors[colorIndex],
        name: row.full_name,
        role: row.current_title ?? "—",
        matchScore: Math.round(score),
        scoreColor,
        tags,
        location: row.city ?? "Remote",
        experience: row.years_exp ? `${row.years_exp}+ yrs` : "",
        stage: row.stage,
        meta: row.jd_title ?? undefined,
        isShortlisted: row.is_shortlisted,
        priority: row.priority,
        notes: row.notes ?? undefined,
        availability: row.availability ?? undefined,
        jdId: row.jd_id, 
      };
    });

    return NextResponse.json({ results: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [pipeline GET]", message);
    return NextResponse.json(
      { error: "Query failed", details: message },
      { status: 500 },
    );
  }
}