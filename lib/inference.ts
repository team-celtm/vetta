// lib/inference.ts

import OpenAI from "openai";
import { query } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InferredSkill {
  name: string;
  weight: number;
}

interface InferredPersonality {
  leadership: number;
  team_player: number;
  communication: number;
  data_driven: number;
  bias_to_action: number;
  extroversion: number;
}

interface InferenceResult {
  skills: InferredSkill[];
  personality: InferredPersonality;
  seniority: string;
  domain: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INFERENCE_VERSION = "gpt-4.1-mini-v1";

const SYSTEM_PROMPT = `You are an expert talent intelligence engine. Given a job description, extract structured data as JSON.

Return ONLY valid JSON matching this exact schema — no markdown, no preamble:

{
  "skills": [
    { "name": "string (skill name)", "weight": 0.0 to 1.0 }
  ],
  "personality": {
    "leadership": 0 to 100,
    "team_player": 0 to 100,
    "communication": 0 to 100,
    "data_driven": 0 to 100,
    "bias_to_action": 0 to 100,
    "extroversion": 0 to 100
  },
  "seniority": "one of: associate | mid | senior | lead | head | director",
  "domain": "concise domain"
}

Rules:
- Extract 4–10 skills ranked by importance.
- weight 1.0 = must-have, 0.3 = nice-to-have.
- Personality scores reflect job demand.
- Pick ONE seniority.
- Domain should be short.`;

// ─── Match Computation ────────────────────────────────────────────────────────

async function computeAndUpsertMatches(jdId: string): Promise<void> {
  // 1. Fetch the JD's inferred skills
  const jdRows = await query<{
    inferred_skills: InferredSkill[];
  }>(`SELECT inferred_skills FROM job_descriptions WHERE id = $1`, [jdId]);

  if (!jdRows.length) {
    console.warn(`[matches] JD ${jdId} not found, skipping match computation`);
    return;
  }

  const inferredSkills = jdRows[0].inferred_skills;

  if (!Array.isArray(inferredSkills) || inferredSkills.length === 0) {
    console.warn(`[matches] JD ${jdId} has no inferred skills, skipping`);
    return;
  }

  const skillNames = inferredSkills.map((s) => s.name);

  // 2. Find candidates with at least one overlapping skill (case-insensitive)
  const candidates = await query<{
    id: string;
    skills: { name: string; level: number }[];
    years_exp: number;
    availability: string;
  }>(
    `SELECT id, skills, years_exp, availability
     FROM candidates
     WHERE is_active = true
       AND EXISTS (
         SELECT 1 FROM jsonb_array_elements(skills) AS s
         WHERE lower(s->>'name') = ANY(
           SELECT lower(unnest($1::text[]))
         )
       )
     LIMIT 200`,
    [skillNames],
  );

  if (!candidates.length) {
    console.warn(`[matches] No candidates found for JD ${jdId}`);
    return;
  }

  // 3. Score each candidate in JS
  const matchRows: { candidateId: string; score: number; breakdown: object }[] =
    [];

  for (const candidate of candidates) {
    // Candidate skill lookup
    const candidateSkillMap = new Map<string, number>(
      (candidate.skills ?? []).map((s) => [
        s.name.toLowerCase().trim(),
        s.level ?? 0,
      ]),
    );

    let matchingSkills = 0;
    const matchedSkillNames: string[] = [];

    for (const jdSkill of inferredSkills) {
      const skillName = jdSkill.name.toLowerCase().trim();

      if (candidateSkillMap.has(skillName)) {
        matchingSkills++;
        matchedSkillNames.push(jdSkill.name);
      }
    }

    // Score = (matching skills / total JD skills) × 100
    const finalScore =
      inferredSkills.length > 0
        ? Math.round((matchingSkills / inferredSkills.length) * 100)
        : 0;

    matchRows.push({
      candidateId: candidate.id,
      score: finalScore,
      breakdown: {
        matchedSkills: matchingSkills,
        totalJdSkills: inferredSkills.length,
        matchedSkillNames,
      },
    });
  }

  // 4. Upsert all matches in one loop
  for (const row of matchRows) {
    await query(
      `INSERT INTO matches
         (jd_id, candidate_id, match_score, score_breakdown, inference_version)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (jd_id, candidate_id)
       DO UPDATE SET
         match_score       = EXCLUDED.match_score,
         score_breakdown   = EXCLUDED.score_breakdown,
         inference_version = EXCLUDED.inference_version,
         computed_at       = now()`,
      [
        jdId,
        row.candidateId,
        row.score,
        JSON.stringify(row.breakdown),
        INFERENCE_VERSION,
      ],
    );
  }

  console.log(
    `[matches] ✓ Upserted ${matchRows.length} matches for JD ${jdId}`,
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function queueInference(jdId: string): Promise<void> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // 1. Mark as inferring
    await query(
      `UPDATE job_descriptions SET status = 'inferring' WHERE id = $1`,
      [jdId],
    );

    // 2. Fetch raw_text
    const rows = await query<{ raw_text: string }>(
      `SELECT raw_text FROM job_descriptions WHERE id = $1 LIMIT 1`,
      [jdId],
    );

    if (!rows.length) throw new Error(`JD not found: ${jdId}`);

    const rawText = rows[0].raw_text;

    // 3. Call GPT
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      max_output_tokens: 1024,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Extract structured data from this job description:\n\n${rawText.slice(0, 8000)}`,
        },
      ],
    });

    const rawJson = response.output_text;
    if (!rawJson) throw new Error("Empty response from GPT");

    // 4. Parse & validate
    let result: InferenceResult;
    try {
      const clean = rawJson.replace(/```json|```/g, "").trim();
      result = JSON.parse(clean) as InferenceResult;
    } catch {
      throw new Error(`AI returned invalid JSON: ${rawJson.slice(0, 200)}`);
    }

    if (
      !Array.isArray(result.skills) ||
      typeof result.personality !== "object"
    ) {
      throw new Error("AI response missing required fields");
    }

    // 5. Persist inference results and mark active
    // 5. Persist inference results (do NOT mark active yet)
    // 5. Persist inference results (status NOT set yet)
    await query(
      `UPDATE job_descriptions
   SET inferred_skills = $1, inferred_personality = $2,
       inferred_seniority = $3, inferred_domain = $4,
       inference_version = $5
   WHERE id = $6`,
      [
        JSON.stringify(result.skills),
        JSON.stringify(result.personality),
        result.seniority || null,
        result.domain || null,
        INFERENCE_VERSION,
        jdId,
      ],
    );

    // 6. Compute matches FIRST
    await computeAndUpsertMatches(jdId);

    // 7. ONLY NOW mark active
    await query(`UPDATE job_descriptions SET status = 'active' WHERE id = $1`, [
      jdId,
    ]);

    console.log(`[inference] ✓ JD ${jdId} marked active with matches ready`);
  } catch (err) {
    await query(`UPDATE job_descriptions SET status = 'draft' WHERE id = $1`, [
      jdId,
    ]).catch(() => {});

    console.error(`[inference] ✗ JD ${jdId} failed:`, err);
    throw err;
  }
}
