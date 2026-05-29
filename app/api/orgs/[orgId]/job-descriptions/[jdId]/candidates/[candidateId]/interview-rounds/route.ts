// app/api/orgs/[orgId]/job-descriptions/[jdId]/candidates/[candidateId]/interview-rounds/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

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

// ─── Round → stage mapping ─────────────────────────────────────────────────
// Round 0 = Screening (stage: screening)
// Round 1 = Round 1   (stage: interview)
// Round 2 = Round 2   (stage: interview)
// Round 3 = Final     (stage: interview)
// Round 4 = Offer     (stage: offer)

function getNextStage(decision: string, roundNumber: number): string {
  if (decision === "rejected") return "rejected";
  // If candidate is selected after Final round (3), move to offer
  if (roundNumber >= 3) return "offer";
  // Otherwise stay in interview (next round)
  return "interview";
}

// ─── GET ───────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string; candidateId: string }> }
) {
  try {
    const { orgId, jdId, candidateId } = await params;

    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const entries = await query<{ id: string; stage: string }>(
      `SELECT id, stage FROM pipeline_entries
       WHERE org_id = $1::uuid AND jd_id = $2::uuid AND candidate_id = $3::uuid
       LIMIT 1`,
      [orgId, jdId, candidateId]
    );

    if (!entries.length) {
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
      meeting_link: string | null;
      interviewers: string[] | null;
      decision: string;
      intimation_note: string | null;
      intimation_sent: boolean;
      invite_sent: boolean;
    }>(
      `SELECT
         id, round_number, interview_type,
         scheduled_date, scheduled_time, duration, mode,
         focus_area, notes_for_candidate, meeting_link, interviewers,
         decision, intimation_note, intimation_sent, invite_sent
       FROM interview_rounds
       WHERE pipeline_entry_id = $1::uuid
       ORDER BY round_number ASC`,
      [entry.id]
    );

    // ── Derive currentRound correctly ──────────────────────────────────────
    // currentRound = the first round that has decision = 'pending'
    // If all rounds are decided → next round number (capped at 4)
    // If no rounds exist → 1
    let currentRound = 1;

    if (rounds.length === 0) {
      currentRound = 1;
    } else {
      // Check if any round was rejected — stop there
      const rejectedRound = rounds.find((r) => r.decision === "rejected");
      if (rejectedRound) {
        currentRound = rejectedRound.round_number;
      } else {
        // Find first pending round
        const firstPending = rounds.find((r) => r.decision === "pending");
        if (firstPending) {
          currentRound = firstPending.round_number;
        } else {
          // All decided & selected — advance to next round
          const maxRound = Math.max(...rounds.map((r) => r.round_number));
          currentRound = Math.min(maxRound + 1, 4);
        }
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

// ─── POST — upsert round details ───────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string; candidateId: string }> }
) {
  try {
    const { orgId, jdId, candidateId } = await params;

    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

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
      meetingLink,
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
      meetingLink?: string;
      interviewers: string[];
      inviteSent?: boolean;
    };

    if (!roundNumber) {
      return NextResponse.json({ error: "roundNumber is required." }, { status: 400 });
    }

    // Upsert pipeline entry
    const entryResult = await query<{ id: string }>(
      `INSERT INTO pipeline_entries (jd_id, candidate_id, org_id, moved_by, stage)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'interview')
       ON CONFLICT (jd_id, candidate_id)
       DO UPDATE SET
         stage = CASE
           WHEN pipeline_entries.stage IN ('screening', 'sourced') THEN 'interview'
           ELSE pipeline_entries.stage
         END,
         updated_at = now()
       RETURNING id`,
      [jdId, candidateId, orgId, userId]
    );

    const pipelineEntryId = entryResult[0].id;

    // Upsert interview round
    const roundResult = await query<{ id: string }>(
      `INSERT INTO interview_rounds (
         pipeline_entry_id, org_id, candidate_id, jd_id,
         round_number, interview_type,
         scheduled_date, scheduled_time, duration, mode,
         focus_area, notes_for_candidate, meeting_link, interviewers,
         invite_sent, invite_sent_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, $4::uuid,
         $5, $6,
         $7, $8, $9, $10,
         $11, $12, $13, $14,
         $15, CASE WHEN $15 THEN now() ELSE NULL END
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
         meeting_link        = EXCLUDED.meeting_link,
         interviewers        = EXCLUDED.interviewers,
         invite_sent         = EXCLUDED.invite_sent,
         invite_sent_at      = CASE
           WHEN EXCLUDED.invite_sent THEN now()
           ELSE interview_rounds.invite_sent_at
         END,
         updated_at          = now()
       RETURNING id`,
      [
        pipelineEntryId, orgId, candidateId, jdId,
        roundNumber, interviewType,
        date || null, time || null, duration || null, mode || null,
        focusArea || null, notes || null, meetingLink || null,
        interviewers?.length ? interviewers : null,
        inviteSent,
      ]
    );

    await query(
      `INSERT INTO actions (pipeline_entry_id, actor_id, action_type, payload)
       VALUES ($1::uuid, $2::uuid, 'interview_round_saved', $3::jsonb)`,
      [pipelineEntryId, userId, JSON.stringify({ round: roundNumber, inviteSent })]
    );

    return NextResponse.json({ success: true, roundId: roundResult[0].id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [interview-rounds POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PATCH — save decision + progress to next round ───────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string; candidateId: string }> }
) {
  try {
    const { orgId, jdId, candidateId } = await params;

    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

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

    // Update round decision
    await query(
      `UPDATE interview_rounds SET
         decision           = $1,
         intimation_note    = $2,
         intimation_sent    = $3,
         intimation_sent_at = CASE WHEN $3 THEN now() ELSE intimation_sent_at END,
         updated_at         = now()
       WHERE pipeline_entry_id = $4::uuid AND round_number = $5`,
      [decision, intimationNote || null, intimationSent, pipelineEntryId, roundNumber]
    );

    // Determine next pipeline stage
    const nextStage = getNextStage(decision, roundNumber);

    // Update pipeline stage
    await query(
      `UPDATE pipeline_entries SET stage = $1, updated_at = now()
       WHERE id = $2::uuid`,
      [nextStage, pipelineEntryId]
    );

    // If selected and not yet at offer, create the next round row as pending
    // so the UI knows there's a next round to schedule
    if (decision === "selected" && roundNumber < 4) {
      const nextRound = roundNumber + 1;
      await query(
        `INSERT INTO interview_rounds (
           pipeline_entry_id, org_id, candidate_id, jd_id,
           round_number, interview_type, decision
         ) VALUES (
           $1::uuid, $2::uuid, $3::uuid, $4::uuid,
           $5, 'Technical round', 'pending'
         )
         ON CONFLICT (pipeline_entry_id, round_number) DO NOTHING`,
        [pipelineEntryId, orgId, candidateId, jdId, nextRound]
      );
    }

    await query(
      `INSERT INTO actions (pipeline_entry_id, actor_id, action_type, payload)
       VALUES ($1::uuid, $2::uuid, 'interview_decision', $3::jsonb)`,
      [pipelineEntryId, userId, JSON.stringify({ round: roundNumber, decision, nextStage })]
    );

    return NextResponse.json({
      success: true,
      nextStage,
      nextRound: decision === "selected" && roundNumber < 4 ? roundNumber + 1 : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [interview-rounds PATCH]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}