import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const rows = await query<{ id: string; name: string }>(
      `SELECT id, name FROM orgs ORDER BY name ASC`,
      []
    );
    return NextResponse.json({ orgs: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}