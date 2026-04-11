// app/api/orgs/[orgId]/job-descriptions/latest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const token = req.cookies.get("vetta_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) throw new Error();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await query<{
    id: string; status: string; title: string;
    inferred_skills: unknown; inferred_seniority: string | null; inferred_domain: string | null;
  }>(
    `SELECT id, status, title, inferred_skills, inferred_seniority, inferred_domain
     FROM job_descriptions
     WHERE org_id = $1
       AND status IN ('active', 'inferring', 'draft')
     ORDER BY created_at DESC
     LIMIT 1`,
    [orgId]
  );

  if (!rows.length) return NextResponse.json({ job_description: null });
  return NextResponse.json({ job_description: rows[0] });
}