"use client";

import React from "react";
import {
  type Candidate,
  candidates,
  columns,
  type PipelineColumn,
  pipelineStats,
} from "@/app/api/talentPipelLine/talentPipelineData";

// ── Icons ──────────────────────────────────────────────────────────────────
const IconPerson = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconPencil = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconFilter = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-red-400">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
);

// ── Icon Map ───────────────────────────────────────────────────────────────
const statIconMap: Record<string, React.FC> = {
  person: IconPerson,
  check: IconCheck,
  calendar: IconCalendar,
  pencil: IconPencil,
};

// ── Score Color Helper ─────────────────────────────────────────────────────
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

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
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
            <span key={t} className="text-[10px] sm:text-[11px] bg-gray-100 px-2 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px] sm:text-[11px] text-gray-400">
        <IconPin />
        <span>{location}</span>
        {experience && <span>· {experience}</span>}
        {meta && <span className="text-gray-500">· {meta}</span>}
      </div>
    </div>
  );
};

// ── Column ─────────────────────────────────────────────────────────────────
const PipelineCol: React.FC<{ col: PipelineColumn }> = ({ col }) => {
  const cards = candidates.filter((c) => c.stage === col.id);

  return (
    <div className="snap-start w-[85%] sm:w-[260px] flex-shrink-0">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-5 h-5 text-[11px] flex items-center justify-center rounded-full ${col.badgeColor}`}>
            {col.count}
          </span>
          <h3 className="font-bold text-sm sm:text-base">{col.label}</h3>
        </div>
        <p className="text-xs text-gray-400 ml-6">{col.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3">
        {cards.map((c) => (
          <CandidateCard key={c.id} candidate={c} />
        ))}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const TalentPipelinePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F4F0]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-8 py-4 bg-white border-b">
        <h1 className="text-lg sm:text-xl font-black">Talent Pipeline</h1>

        <div className="flex gap-2">
          <button className="flex items-center gap-1 text-xs sm:text-sm border px-3 py-2 rounded">
            <IconFilter /> Filters
          </button>

          <button className="text-xs sm:text-sm bg-blue-600 text-white px-3 py-2 rounded">
            + Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 sm:gap-6 px-4 sm:px-8 py-4 bg-white border-b">
        {pipelineStats.map((s) => {
          const Icon = statIconMap[s.icon];

          return (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center rounded ${s.color}`}>
                <Icon />
              </div>
              <div>
                <p className="font-bold text-sm sm:text-lg">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Board */}
      <div className="px-4 sm:px-8 py-6">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
          {columns.map((col) => (
            <PipelineCol key={col.id} col={col} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TalentPipelinePage;