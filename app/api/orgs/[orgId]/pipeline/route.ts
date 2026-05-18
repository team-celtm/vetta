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

// Maps frontend stage names → DB stage values
// Frontend uses "offer_sent", DB stores "offer"
const STAGE_MAP: Record<string, string[]> = {
  screening:  ["screening"],
  interview:  ["interview"],
  offer_sent: ["offer"],       // ← key fix: "offer_sent" on frontend = "offer" in DB
  hired:      ["hired"],
  rejected:   ["rejected"],
};

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
    const frontendStage = searchParams.get("stage") ?? "interview";

    // Resolve to DB stage values
    const dbStages = STAGE_MAP[frontendStage] ?? [frontendStage];

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
      // Interview round summary columns
      total_rounds: number | null;
      rounds_cleared: number | null;
      current_round: number | null;
      last_decision: string | null;
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
        jd.title            AS jd_title,

        -- Interview round aggregates
        ir_agg.total_rounds,
        ir_agg.rounds_cleared,
        ir_agg.current_round,
        ir_agg.last_decision

      FROM pipeline_entries pe
      JOIN candidates       c   ON c.id  = pe.candidate_id
      JOIN job_descriptions jd  ON jd.id = pe.jd_id
      LEFT JOIN matches     m   ON m.jd_id = pe.jd_id
                                AND m.candidate_id = pe.candidate_id
      -- Aggregate interview round data per pipeline entry
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)                                        AS total_rounds,
          COUNT(*) FILTER (WHERE decision = 'selected')  AS rounds_cleared,
          MAX(round_number)                               AS current_round,
          (
            SELECT decision FROM interview_rounds ir2
            WHERE ir2.pipeline_entry_id = pe.id
            ORDER BY round_number DESC
            LIMIT 1
          )                                               AS last_decision
        FROM interview_rounds ir
        WHERE ir.pipeline_entry_id = pe.id
      ) ir_agg ON true

      WHERE pe.org_id = $1::uuid
        AND pe.stage  = ANY($2::text[])
        AND c.is_active = true
      ORDER BY pe.updated_at DESC
      `,
      [orgId, dbStages],
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
      const colorIndex = row.candidate_id.charCodeAt(0) % avatarColors.length;

      // Map DB stage back to frontend stage name
      const frontendStageName =
        row.stage === "offer" ? "offer_sent" : (row.stage as string);

      return {
        id:            row.entry_id,
        candidateId:   row.candidate_id,
        initials,
        avatarColor:   avatarColors[colorIndex],
        name:          row.full_name,
        role:          row.current_title ?? "—",
        matchScore:    Math.round(score),
        scoreColor,
        tags,
        location:      row.city ?? "Remote",
        experience:    row.years_exp ? `${row.years_exp}+ yrs` : "",
        stage:         frontendStageName,
        meta:          row.jd_title ?? undefined,
        isShortlisted: row.is_shortlisted,
        priority:      row.priority,
        notes:         row.notes ?? undefined,
        availability:  row.availability ?? undefined,
        jdId:          row.jd_id,
        // Interview round summary for card display
        roundsCleared: Number(row.rounds_cleared ?? 0),
        totalRounds:   Number(row.total_rounds ?? 0),
        currentRound:  Number(row.current_round ?? 1),
        lastDecision:  row.last_decision ?? null,
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