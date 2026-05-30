"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  type Candidate,
  type PipelineColumn,
  columns,
  pipelineStats,
  type Stage,
} from "@/app/api/talentPipelLine/talentPipelineData";
import {
  CandidateDetail,
  TalentProfileModal,
} from "@/app/Components/Talentprofilemodal";

function getOrgId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("vetta_org_id="));
  return match ? match.split("=")[1] : "";
}

const IconPerson = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
  </svg>
);
const IconCheck = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-4 h-4"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-4 h-4"
    stroke="currentColor"
    strokeWidth={2}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconPencil = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-4 h-4"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-red-400">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
);

const statIconMap: Record<string, React.FC> = {
  person: IconPerson,
  check: IconCheck,
  calendar: IconCalendar,
  pencil: IconPencil,
};

const scoreClass = (c: Candidate["scoreColor"]) =>
  c === "green"
    ? "text-green-500"
    : c === "orange"
      ? "text-orange-400"
      : "text-yellow-500";

// ── Candidate Card ─────────────────────────────────────────────────────────
const CandidateCard: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
  const {
    initials,
    avatarColor,
    name,
    role,
    matchScore,
    scoreColor,
    tags,
    location,
    experience,
    meta,
  } = candidate;

  const [modalOpen, setModalOpen] = useState(false);
  const [candidateDetail, setCandidateDetail] =
    useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleViewProfile() {
    setLoading(true);
    console.log("candidate object:", candidate);
    try {
      const res = await fetch(
        `/api/candidates/${candidate.candidateId ?? candidate.id}`,
      );
      if (res.ok) {
        const data: CandidateDetail = await res.json();
        setCandidateDetail({
          ...data,
          availability: data.availability ?? "Not specified",
        });
      } else {
        // fallback only if API fails
        setCandidateDetail({
          id: candidate.id,
          name,
          role,
          match: matchScore,
          skills: tags,
          skillScores: tags.map((t) => ({ name: t, score: 80 })),
          location,
          experience: experience ?? "",
          available: true,
          city: location,
          availability: "Not specified",
        });
      }
    } catch {
      setCandidateDetail({
        id: candidate.id,
        name,
        role,
        match: matchScore,
        skills: tags,
        skillScores: tags.map((t) => ({ name: t, score: 80 })),
        location,
        experience: experience ?? "",
        available: true,
        city: location,
        availability: "Not specified",
      });
    } finally {
      setLoading(false);
      setModalOpen(true);
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl h-46 p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${avatarColor} flex items-center justify-center text-white text-xs font-bold`}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-xs text-gray-400">{role}</p>
            </div>
          </div>
          <span className={`text-sm font-bold ${scoreClass(scoreColor)}`}>
            {matchScore}%
          </span>
        </div>   

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((t) => (
              <span
                key={t}
                className="text-[10px] sm:text-[11px] bg-gray-100 px-2 py-0.5 rounded"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px] sm:text-[11px] text-gray-400">
          <IconPin />
          <span>{location}</span>
          {experience && <span>· {experience}</span>}
          {meta && (
            <span className="ml-auto text-[10px] text-blue-400 font-medium truncate max-w-[120px]">
              {meta}
            </span>
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleViewProfile}
            disabled={loading}
            className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "View Profile"}
          </button>
        </div>
        <TalentProfileModal
          candidate={candidateDetail}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          orgId={getOrgId()}
          jdId={candidate.jdId ?? ""}
          context="pipeline"
          stage={candidate.stage}
        />
      </div>
    </>
  );
};

// ── Skeleton Card ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex gap-2">
      <div className="w-9 h-9 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-1.5 pt-1">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-1 mt-3">
      <div className="h-5 bg-gray-100 rounded w-16" />
      <div className="h-5 bg-gray-100 rounded w-14" />
    </div>
    <div className="h-2.5 bg-gray-100 rounded w-2/3 mt-3" />
  </div>
);

// ── Column ─────────────────────────────────────────────────────────────────
const PipelineCol: React.FC<{
  col: PipelineColumn;
  candidates: Candidate[];
  loading: boolean;
}> = ({ col, candidates, loading }) => {
  const cards = candidates.filter((c) => c.stage === col.id);

  return (
    <div className="snap-start w-[85%] sm:w-65 shrink-0">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-5 h-5 text-[11px] flex items-center justify-center rounded-full ${col.badgeColor}`}
          >
            {loading ? "…" : cards.length}
          </span>
          <h3 className="font-bold text-sm sm:text-base">{col.label}</h3>
        </div>
        <p className="text-xs text-gray-400 ml-6">{col.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          // Show 2 skeleton cards while loading
          [0, 1].map((i) => <SkeletonCard key={i} />)
        ) : cards.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No candidates
          </div>
        ) : (
          cards.map((c) => <CandidateCard key={c.id} candidate={c} />)
        )}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const TalentPipelinePage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = [
    { ...pipelineStats[0], value: String(candidates.length) },
    {
      ...pipelineStats[1],
      value: String(candidates.filter((c) => c.stage === "offer_sent").length),
    },
    {
      ...pipelineStats[2],
      value: String(candidates.filter((c) => c.stage === "interview").length),
    },
    { ...pipelineStats[3] },
  ];

  const fetchAllStages = useCallback(async () => {
    const orgId = getOrgId();
    if (!orgId) return;

    setLoading(true);
    setError(null);

    try {
      const stages: Stage[] = ["screening", "interview", "offer_sent", "hired"];
      const responses = await Promise.all(
        stages.map((stage) =>
          fetch(`/api/orgs/${orgId}/pipeline?stage=${stage}`).then((r) =>
            r.ok ? r.json() : { results: [] },
          ),
        ),
      );
      console.log("Pipeline response sample:", responses[0]?.results?.[0]);

      const all: Candidate[] = responses.flatMap((r) => r.results ?? []);
      setCandidates(all);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load pipeline.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStages();

    const refreshPipeline = () => {
      fetchAllStages();
    };

    window.addEventListener("pipeline-refresh", refreshPipeline);

    return () => {
      window.removeEventListener("pipeline-refresh", refreshPipeline);
    };
  }, [fetchAllStages]);

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-8 py-4 bg-white border-b">
        <h1 className="text-lg sm:text-xl font-black">Talent Pipeline</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchAllStages}
            className=" cursor-pointer text-xs sm:text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 sm:gap-6 px-4 sm:px-8 py-4 bg-white border-b">
        {stats.map((s) => {
          const Icon = statIconMap[s.icon];
          return (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded ${s.color}`}
              >
                <Icon />
              </div>
              <div>
                <p className="font-bold text-sm sm:text-lg">
                  {loading ? (
                    <span className="inline-block w-6 h-4 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    s.value
                  )}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 sm:mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Board */}
      <div className="px-4 sm:px-8 py-6">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
          {columns.map((col) => (
            <PipelineCol
              key={col.id}
              col={col}
              candidates={candidates}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TalentPipelinePage;
