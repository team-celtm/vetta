// app/api/orgs/[orgId]/job-descriptions/route.ts


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



export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rows = await query<{
      id: string;
      title: string;
      status: string;
      inferred_skills: unknown;
      inferred_seniority: string | null;
      inferred_domain: string | null;
      created_at: string;
    }>(
      `SELECT
         id,
         title,
         status,
         inferred_skills,
         inferred_seniority,
         inferred_domain,
         created_at
       FROM job_descriptions
       WHERE org_id = $1::uuid
       ORDER BY created_at DESC`,
      [orgId]
    );

    const job_descriptions = rows.map((row) => ({
      id:                 row.id,
      title:              row.title,
      status:             row.status,
      inferred_skills:    Array.isArray(row.inferred_skills) ? row.inferred_skills : [],
      inferred_seniority: row.inferred_seniority,
      inferred_domain:    row.inferred_domain,
      created_at:         row.created_at,
    }));

    return NextResponse.json({ job_descriptions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [job-descriptions GET]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

