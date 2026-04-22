// app/api/orgs/[orgId]/job-descriptions/[jdId]/pipeline/route.ts
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

// PATCH /api/orgs/[orgId]/job-descriptions/[jdId]/pipeline
// Body: { candidateId: string, stage: string }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; jdId: string }> },
) {
  try {
    const { orgId, jdId } = await params;

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { candidateId, stage } = body as {
      candidateId: string;
      stage: string;
    };

    if (!candidateId || !stage) {
      return NextResponse.json(
        { error: "candidateId and stage are required." },
        { status: 400 },
      );
    }

    const validStages = [
      "sourced",
      "screening",
      "interview",
      "offer",
      "hired",
      "rejected",
    ];
    if (!validStages.includes(stage)) {
      return NextResponse.json({ error: "Invalid stage." }, { status: 400 });
    }

    // Upsert pipeline entry — create if not exists, update stage if it does
    const result = await query<{ id: string; stage: string }>(
      `
      INSERT INTO pipeline_entries (jd_id, candidate_id, org_id, moved_by, stage)
      VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5)
      ON CONFLICT (jd_id, candidate_id)
      DO UPDATE SET
        stage      = EXCLUDED.stage,
        moved_by   = EXCLUDED.moved_by,
        updated_at = now()
      RETURNING id, stage
      `,
      [jdId, candidateId, orgId, userId, stage],
    );

    const entry = result[0];

    // Write to audit log
    await query(
      `
      INSERT INTO actions (pipeline_entry_id, actor_id, action_type, payload)
      VALUES ($1::uuid, $2::uuid, 'stage_changed', $3::jsonb)
      `,
      [
        entry.id,
        userId,
        JSON.stringify({ to_stage: stage }),
      ],
    );

    return NextResponse.json({ success: true, stage: entry.stage });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [pipeline route]", message);
    return NextResponse.json(
      { error: "Update failed", details: message },
      { status: 500 },
    );
  }
}