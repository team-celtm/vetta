// app/api/orgs/[orgId]/analytics/route.ts

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
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const { orgId } = await params;

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "30"; // days

    // ── 1. KPI: Match accuracy (avg match_score across all matches for org) ──
    const [matchAccuracy] = await query<{
      avg_score: number | null;
      prev_avg: number | null;
    }>(
      `SELECT
         ROUND(AVG(CASE WHEN m.computed_at >= now() - ($2 || ' days')::interval THEN m.match_score END)) AS avg_score,
         ROUND(AVG(CASE WHEN m.computed_at >= now() - ($3 || ' days')::interval
                         AND m.computed_at <  now() - ($2 || ' days')::interval THEN m.match_score END)) AS prev_avg
       FROM matches m
       JOIN job_descriptions jd ON jd.id = m.jd_id
       WHERE jd.org_id = $1::uuid`,
      [orgId, period, String(Number(period) * 2)],
    );

    const avgScore = matchAccuracy?.avg_score ?? 0;
    const prevScore = matchAccuracy?.prev_avg ?? avgScore;
    const scoreDiff = avgScore - prevScore;

    // ── 2. KPI: Avg time-to-hire (screening → hired in pipeline_entries) ──
    const [timeToHire] = await query<{
      avg_days: number | null;
      industry_avg: number;
    }>(
      `SELECT
         ROUND(AVG(EXTRACT(EPOCH FROM (pe.updated_at - pe.created_at)) / 86400)) AS avg_days,
         30 AS industry_avg
       FROM pipeline_entries pe
       WHERE pe.org_id = $1::uuid
         AND pe.stage = 'hired'
         AND pe.updated_at >= now() - ($2 || ' days')::interval`,
      [orgId, period],
    );

    const avgDays = Math.round(timeToHire?.avg_days ?? 0);
    const industryAvg = timeToHire?.industry_avg ?? 30;

    // ── 3. KPI: Active roles ──
    const [activeRoles] = await query<{
      current: number;
      new_this_period: number;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active')                                    AS current,
         COUNT(*) FILTER (WHERE status = 'active'
                            AND created_at >= now() - ($2 || ' days')::interval)     AS new_this_period
       FROM job_descriptions
       WHERE org_id = $1::uuid`,
      [orgId, period],
    );

    // ── 4. KPI: Total candidates in pool ──
    const [poolCount] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM candidates WHERE is_active = true`,
      [],
    );

    // ── 5. Hires per month (last 6 months) ──
    const hiresRaw = await query<{ month: string; hires: number }>(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', updated_at), 'Mon') AS month,
         COUNT(*) AS hires
       FROM pipeline_entries
       WHERE org_id = $1::uuid
         AND stage = 'hired'
         AND updated_at >= now() - interval '6 months'
       GROUP BY DATE_TRUNC('month', updated_at)
       ORDER BY DATE_TRUNC('month', updated_at) ASC`,
      [orgId],
    );

    // ── 6. Pool distribution by seniority ──
    const poolRaw = await query<{ seniority: string; count: number }>(
      `SELECT
         COALESCE(vetta_score_tier, 'Unknown') AS seniority,
         COUNT(*) AS count
       FROM (
         SELECT
           CASE
             WHEN years_exp >= 8 THEN 'Lead/Head'
             WHEN years_exp >= 5 THEN 'Senior'
             WHEN years_exp >= 2 THEN 'Mid-level'
             ELSE 'Associate'
           END AS vetta_score_tier
         FROM candidates
         WHERE is_active = true
       ) t
       GROUP BY vetta_score_tier`,
      [],
    );

    const POOL_COLORS: Record<string, string> = {
      Senior: "#4F8EF7",
      "Mid-level": "#34D399",
      "Lead/Head": "#FBBF24",
      Associate: "#F87171",
      Unknown: "#9CA3AF",
    };

    const poolDistribution = poolRaw.map((r) => ({
      label: r.seniority,
      value: Number(r.count),
      color: POOL_COLORS[r.seniority] ?? "#9CA3AF",
    }));

    // ── 7. Top searched roles (most JDs by title keyword) ──
    const topRolesRaw = await query<{ title: string; count: number }>(
      `SELECT title, COUNT(*) AS count
       FROM job_descriptions
       WHERE org_id = $1::uuid
       GROUP BY title
       ORDER BY count DESC
       LIMIT 5`,
      [orgId],
    );

    const maxCount = Number(topRolesRaw[0]?.count ?? 1);
    const topSearchedRoles = topRolesRaw.map((r, i) => ({
      rank: i + 1,
      title: r.title,
      count: Number(r.count),
      maxCount,
    }));

    // ── 8. Match quality trend (avg score per month, last 6 months) ──
    const matchTrendRaw = await query<{ month: string; score: number }>(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', m.computed_at), 'Mon') AS month,
         ROUND(AVG(m.match_score)) AS score
       FROM matches m
       JOIN job_descriptions jd ON jd.id = m.jd_id
       WHERE jd.org_id = $1::uuid
         AND m.computed_at >= now() - interval '6 months'
       GROUP BY DATE_TRUNC('month', m.computed_at)
       ORDER BY DATE_TRUNC('month', m.computed_at) ASC`,
      [orgId],
    );

    // ── Assemble KPI cards ─────────────────────────────────────────────────

    const kpiCards = [
      {
        id: "match-accuracy",
        value: `${avgScore}%`,
        label: "Match accuracy",
        badge:
          scoreDiff >= 0
            ? `+${scoreDiff.toFixed(1)}% vs last period`
            : `${scoreDiff.toFixed(1)}% vs last period`,
        badgeType: scoreDiff >= 0 ? "positive" : "negative",
        icon: "target",
      },
      {
        id: "avg-time-to-hire",
        value: avgDays > 0 ? `${avgDays}d` : "—",
        label: "Avg time-to-hire",
        badge:
          avgDays > 0 && avgDays < industryAvg
            ? `${industryAvg - avgDays}d faster than industry`
            : avgDays > 0
              ? `${avgDays - industryAvg}d slower than industry`
              : "No hires yet",
        badgeType:
          avgDays > 0 && avgDays < industryAvg ? "positive" : "neutral",
        icon: "calendar",
      },
      {
        id: "active-roles",
        value: String(activeRoles?.current ?? 0),
        label: "Active roles",
        badge: `${activeRoles?.new_this_period ?? 0} new this period`,
        badgeType: "neutral",
        icon: "briefcase",
      },
      {
        id: "talent-pool",
        value: Number(poolCount?.total ?? 0).toLocaleString(),
        label: "Talent pool size",
        badge: "Active candidates",
        badgeType: "positive",
        icon: "bolt",
      },
    ];

    return NextResponse.json({
      kpiCards,
      hiresPerMonth: hiresRaw.map((r) => ({
        month: r.month,
        hires: Number(r.hires),
      })),
      poolDistribution,
      topSearchedRoles,
      matchQualityTrend: matchTrendRaw.map((r) => ({
        month: r.month,
        score: Number(r.score),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [analytics GET]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
