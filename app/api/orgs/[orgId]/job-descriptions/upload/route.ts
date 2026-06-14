// app/api/orgs/[orgId]/job-descriptions/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { queueInference } from "@/lib/inference";
import { extractText as extractPdfText } from "unpdf";
import { jwtVerify } from "jose";


// ─── Types ────────────────────────────────────────────────────────────────────

interface JDRow {
  id: string;
  status: string;
}

// ─── POST /api/orgs/:orgId/job-descriptions/upload ───────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const { orgId } = await params;
    const formData = await req.formData().catch(() => null);

    if (!formData) {
      return NextResponse.json(
        { error: "Expected multipart/form-data." },
        { status: 400 },
      );
    }

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 },
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Job title is required." },
        { status: 400 },
      );
    }

    // ─── Validation ──────────────────────────────────────────────────────────

    const ALLOWED_TYPES = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const ALLOWED_EXTS = [".pdf", ".docx", ".txt"];

    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        { error: "Only PDF, DOCX, or TXT files are allowed." },
        { status: 415 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max size is 5MB." },
        { status: 413 },
      );
    }

    let rawText = "";

    if (file.type === "text/plain" || ext === ".txt") {
      rawText = await file.text();
    } else if (ext === ".docx") {
      const mammoth = await import("mammoth");
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else {
const arrayBuffer = await file.arrayBuffer();
const uint8Array = new Uint8Array(arrayBuffer);

const result = await extractPdfText(uint8Array);
rawText = Array.isArray(result.text)
  ? result.text.join(" ")
  : result.text;
    }

    // ─── Validate extracted text ─────────────────────────────────────────────

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract readable text from this file." },
        { status: 422 },
      );
    }

    // ─── Auth ────────────────────────────────────────────────────────────────

const token = req.cookies.get("vetta_token")?.value;

if (!token) {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

let userId: string;

try {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  userId = payload.sub as string;

  if (!userId) throw new Error("No sub in token");
} catch {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

    // ─── DB Insert ────────────────────────────────────────────────────────────

    const rows = await query<JDRow>(
      `INSERT INTO job_descriptions
        (org_id, created_by, title, raw_text, file_name, file_size_bytes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING id, status`,
      [
        orgId,
        userId,
        title.trim(),
        rawText.trim(),
        file.name,
        file.size,
      ],
    );

    const jd = rows[0];

    // ─── Async inference queue ──────────────────────────────────────────────

    queueInference(jd.id).catch((err) =>
      console.error(`[upload] inference failed for jd=${jd.id}:`, err),
    );

    return NextResponse.json(
      {
        message: "Job description uploaded. Inference queued.",
        jd_id: jd.id,
        status: "draft",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[upload route error]", err);

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}