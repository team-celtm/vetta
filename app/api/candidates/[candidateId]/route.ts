// app/api/candidates/[candidateId]/route.ts

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
  { params }: { params: Promise<{ candidateId: string }> },
) {
  try {
    const { candidateId } = await params;

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rows = await query<{
      id: string;
      full_name: string;
      current_title: string | null;
      email: string | null;
      phone: string | null;
      linkedin_url: string | null;
      city: string | null;
      country: string;
      availability: string;
      years_exp: number;
      current_company: string | null;
      skills: unknown;
      work_history: unknown;
      certifications: unknown;
      personality_scores: unknown;
      vetta_score: number;
    }>(
      `
      SELECT
        id, full_name, current_title, email, phone, linkedin_url,
        city, country, availability, years_exp, current_company,
        skills, work_history, certifications, personality_scores, vetta_score
      FROM candidates
      WHERE id = $1::uuid
        AND is_active = true
      `,
      [candidateId],
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    const c = rows[0];

    const rawSkills = Array.isArray(c.skills) ? c.skills : [];
    const skillScores = rawSkills
      .filter((s: unknown) => typeof s === "object" && s !== null)
      .map((s: unknown) => {
        const skill = s as { name: string; level?: number; score?: number };
        return { name: skill.name, score: skill.level ?? skill.score ?? 75 };
      });

    const workHistory = Array.isArray(c.work_history)
      ? (c.work_history as Array<{
          title: string;
          company: string;
          from: string;
          to: string | null;
          current?: boolean;
        }>)
      : [];

    const certifications = Array.isArray(c.certifications)
      ? (c.certifications as Array<{ name: string; issuer: string; year: number }>)
      : [];

    return NextResponse.json({
      id: c.id,
      name: c.full_name,
      role: c.current_title ?? "Unknown Role",
      match: c.vetta_score,
      location: c.city ?? "Remote",
      city: c.city ?? undefined,
      experience: `${c.years_exp ?? 0}+ yrs`,
      availability: c.availability,
      available: c.availability === "available-now" || c.availability === "open",
      skills: skillScores.slice(0, 3).map((s) => s.name),
      skillScores,
      email: c.email ?? undefined,
      phone: c.phone ?? undefined,
      linkedin: c.linkedin_url ?? undefined,
      workHistory,
      certifications,
      personalityScores: c.personality_scores as Record<string, number> | undefined,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [candidate detail route]", message);
    return NextResponse.json(
      { error: "Query failed", details: message },
      { status: 500 },
    );
  }
}