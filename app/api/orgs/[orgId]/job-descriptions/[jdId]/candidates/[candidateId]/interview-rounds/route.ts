// app/api/orgs/[orgId]/job-descriptions/[jdId]/candidates/[candidateId]/interview-rounds/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function getUserId(req: NextRequest): Promise<string | null> {
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

// ─── GET — fetch all rounds for a candidate + jd ──────────────────────────────
//
// GET /api/orgs/[orgId]/job-descriptions/[jdId]/candidates/[candidateId]/interview-rounds

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string; candidateId: string }> }
) {
  try {
    const { orgId, jdId, candidateId } = await params;

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Fetch pipeline entry first to get its id
    const entries = await query<{ id: string; stage: string }>(
      `SELECT id, stage FROM pipeline_entries
       WHERE org_id = $1::uuid AND jd_id = $2::uuid AND candidate_id = $3::uuid
       LIMIT 1`,
      [orgId, jdId, candidateId]
    );

    if (!entries.length) {
      // No pipeline entry yet — return empty rounds
      return NextResponse.json({ rounds: [], currentRound: 1, stage: null });
    }

    const entry = entries[0];

    const rounds = await query<{
      id: string;
      round_number: number;
      interview_type: string;
      scheduled_date: string | null;
      scheduled_time: string | null;
      duration: string | null;
      mode: string | null;
      focus_area: string | null;
      notes_for_candidate: string | null;
      interviewers: string[] | null;
      decision: string;
      intimation_note: string | null;
      intimation_sent: boolean;
      invite_sent: boolean;
    }>(
      `SELECT
         id, round_number, interview_type,
         scheduled_date, scheduled_time, duration, mode,
         focus_area, notes_for_candidate, interviewers,
         decision, intimation_note, intimation_sent, invite_sent
       FROM interview_rounds
       WHERE pipeline_entry_id = $1::uuid
       ORDER BY round_number ASC`,
      [entry.id]
    );

    // Derive active round: last round that is still pending, or next one
    let currentRound = 1;
    if (rounds.length > 0) {
      const lastPending = rounds.findLast((r) => r.decision === "pending");
      const lastDecided = rounds.findLast((r) => r.decision !== "pending");
      if (lastPending) {
        currentRound = lastPending.round_number;
      } else if (lastDecided) {
        // All decided → next round (or stay at last)
        currentRound = Math.min(lastDecided.round_number + 1, 4);
      }
    }

    return NextResponse.json({
      rounds,
      currentRound,
      stage: entry.stage,
      pipelineEntryId: entry.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [interview-rounds GET]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST — upsert a round (save draft or send invite) ────────────────────────
//
// POST /api/orgs/[orgId]/job-descriptions/[jdId]/candidates/[candidateId]/interview-rounds
// Body: { roundNumber, interviewType, date, time, duration, mode, focusArea,
//         notes, interviewers, inviteSent? }

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string; candidateId: string }> }
) {
  try {
    const { orgId, jdId, candidateId } = await params;

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const {
      roundNumber,
      interviewType,
      date,
      time,
      duration,
      mode,
      focusArea,
      notes,
      interviewers,
      inviteSent = false,
    } = body as {
      roundNumber: number;
      interviewType: string;
      date: string;
      time: string;
      duration: string;
      mode: string;
      focusArea?: string;
      notes?: string;
      interviewers: string[];
      inviteSent?: boolean;
    };

    if (!roundNumber) {
      return NextResponse.json({ error: "roundNumber is required." }, { status: 400 });
    }

    // Ensure pipeline entry exists (upsert)
    const entryResult = await query<{ id: string }>(
      `INSERT INTO pipeline_entries (jd_id, candidate_id, org_id, moved_by, stage)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'interview')
       ON CONFLICT (jd_id, candidate_id)
       DO UPDATE SET stage = CASE
         WHEN pipeline_entries.stage IN ('screening', 'sourced') THEN 'interview'
         ELSE pipeline_entries.stage
       END, updated_at = now()
       RETURNING id`,
      [jdId, candidateId, orgId, userId]
    );

    const pipelineEntryId = entryResult[0].id;

    // Upsert the interview round row
    const roundResult = await query<{ id: string }>(
      `INSERT INTO interview_rounds (
         pipeline_entry_id, org_id, candidate_id, jd_id,
         round_number, interview_type,
         scheduled_date, scheduled_time, duration, mode,
         focus_area, notes_for_candidate, interviewers,
         invite_sent, invite_sent_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, $4::uuid,
         $5, $6,
         $7, $8, $9, $10,
         $11, $12, $13,
         $14, CASE WHEN $14 THEN now() ELSE NULL END
       )
       ON CONFLICT (pipeline_entry_id, round_number)
       DO UPDATE SET
         interview_type      = EXCLUDED.interview_type,
         scheduled_date      = EXCLUDED.scheduled_date,
         scheduled_time      = EXCLUDED.scheduled_time,
         duration            = EXCLUDED.duration,
         mode                = EXCLUDED.mode,
         focus_area          = EXCLUDED.focus_area,
         notes_for_candidate = EXCLUDED.notes_for_candidate,
         interviewers        = EXCLUDED.interviewers,
         invite_sent         = EXCLUDED.invite_sent,
         invite_sent_at      = CASE WHEN EXCLUDED.invite_sent THEN now() ELSE interview_rounds.invite_sent_at END,
         updated_at          = now()
       RETURNING id`,
      [
        pipelineEntryId, orgId, candidateId, jdId,
        roundNumber, interviewType,
        date || null, time || null, duration || null, mode || null,
        focusArea || null, notes || null,
        interviewers?.length ? interviewers : null,
        inviteSent,
      ]
    );

    // Audit log
    await query(
      `INSERT INTO actions (pipeline_entry_id, actor_id, action_type, payload)
       VALUES ($1::uuid, $2::uuid, 'interview_round_saved', $3::jsonb)`,
      [
        pipelineEntryId,
        userId,
        JSON.stringify({ round: roundNumber, inviteSent }),
      ]
    );

    return NextResponse.json({ success: true, roundId: roundResult[0].id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [interview-rounds POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PATCH — save decision + intimation for a round ──────────────────────────
//
// PATCH /api/orgs/[orgId]/job-descriptions/[jdId]/candidates/[candidateId]/interview-rounds
// Body: { roundNumber, decision, intimationNote, intimationSent }

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string; candidateId: string }> }
) {
  try {
    const { orgId, jdId, candidateId } = await params;

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { roundNumber, decision, intimationNote, intimationSent = false } = body as {
      roundNumber: number;
      decision: "selected" | "rejected" | "pending";
      intimationNote?: string;
      intimationSent?: boolean;
    };

    if (!roundNumber || !decision) {
      return NextResponse.json(
        { error: "roundNumber and decision are required." },
        { status: 400 }
      );
    }

    // Get pipeline entry
    const entries = await query<{ id: string }>(
      `SELECT id FROM pipeline_entries
       WHERE org_id = $1::uuid AND jd_id = $2::uuid AND candidate_id = $3::uuid
       LIMIT 1`,
      [orgId, jdId, candidateId]
    );

    if (!entries.length) {
      return NextResponse.json({ error: "Pipeline entry not found." }, { status: 404 });
    }

    const pipelineEntryId = entries[0].id;

    // Update the round's decision
    await query(
      `UPDATE interview_rounds SET
         decision            = $1,
         intimation_note     = $2,
         intimation_sent     = $3,
         intimation_sent_at  = CASE WHEN $3 THEN now() ELSE intimation_sent_at END,
         updated_at          = now()
       WHERE pipeline_entry_id = $4::uuid AND round_number = $5`,
      [decision, intimationNote || null, intimationSent, pipelineEntryId, roundNumber]
    );

    // Update pipeline_entries stage based on decision
    const nextStage =
      decision === "rejected"
        ? "rejected"
        : roundNumber >= 3
        ? "offer"
        : "interview";

    await query(
      `UPDATE pipeline_entries SET stage = $1, updated_at = now()
       WHERE id = $2::uuid`,
      [nextStage, pipelineEntryId]
    );

    // Audit log
    await query(
      `INSERT INTO actions (pipeline_entry_id, actor_id, action_type, payload)
       VALUES ($1::uuid, $2::uuid, 'interview_decision', $3::jsonb)`,
      [
        pipelineEntryId,
        userId,
        JSON.stringify({ round: roundNumber, decision, nextStage }),
      ]
    );

    return NextResponse.json({ success: true, nextStage });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [interview-rounds PATCH]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}