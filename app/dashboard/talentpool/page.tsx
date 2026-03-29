"use client";
"use client";

import { availabilityStyle, poolStats, TalentCandidate, talentPool } from "@/app/api/talentpool/talentPoolData";
import React, { useState, useMemo } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────
const IconStack = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" fill="none" strokeWidth={2} strokeLinejoin="round" />
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const IconFilter = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-red-400">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);
const IconDot = () => (
  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
);

const statIconMap: Record<string, React.FC> = {
  stack: IconStack,
  heart: IconHeart,
  clock: IconClock,
  star: IconStar,
};

// ── Score color helper ─────────────────────────────────────────────────────
const scoreClass = (c: TalentCandidate["scoreColor"]) =>
  c === "green" ? "text-green-500" : c === "orange" ? "text-orange-400" : "text-blue-400";

// ── Table Row ──────────────────────────────────────────────────────────────
const CandidateRow: React.FC<{ candidate: TalentCandidate; isLast: boolean }> = ({
  candidate: c,
  isLast,
}) => (
  <tr
    className={`group hover:bg-blue-50/40 transition-colors duration-150 ${
      !isLast ? "border-b border-gray-100" : ""
    }`}
  >
    <td className="py-4 pl-6 pr-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {c.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{c.name}</p>
          <p className="text-xs text-gray-400">{c.role}</p>
        </div>
      </div>
    </td>

    <td className="py-4 px-4">
      <span className={`text-sm font-bold ${scoreClass(c.scoreColor)}`}>
        {c.matchScore}%
      </span>
    </td>

    <td className="py-4 px-4">
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <IconPin />
        {c.location}
      </div>
    </td>

    <td className="py-4 px-4">
      <span className="text-sm text-gray-600">{c.experience}</span>
    </td>

    <td className="py-4 px-4">
      <div className="flex flex-wrap gap-1.5">
        {c.skills.map((s) => (
          <span key={s} className="text-[11px] bg-gray-100 text-gray-500 rounded-md px-2 py-0.5 font-medium whitespace-nowrap">
            {s}
          </span>
        ))}
      </div>
    </td>

    <td className="py-4 px-4">
      <span className={`text-sm font-medium ${availabilityStyle[c.availability]}`}>
        {c.availability}
      </span>
    </td>

    <td className="py-4 pl-4 pr-6">
      <button className="text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 whitespace-nowrap">
        View Profile
      </button>
    </td>
  </tr>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const TalentPoolPage: React.FC = () => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return talentPool;
    return talentPool.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-5 bg-white border-b border-gray-100 gap-3 sm:gap-0">
        <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
          Full Talent Pool
        </h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, skill, location..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-full sm:w-72"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconSearch />
            </span>
          </div>

          {/* Filters */}
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2 bg-white">
            <IconFilter /> Filters
          </button>

          {/* Total */}
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            <IconDot />
            <span className="text-sm font-semibold text-green-700">1,240 total</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-8 px-4 sm:px-8 py-4 bg-white border-b border-gray-100 min-w-[600px]">
          {poolStats.map((s, i) => {
            const Icon = statIconMap[s.icon];
            return (
              <React.Fragment key={s.label}>
                {i !== 0 && <div className="h-8 w-px bg-gray-100" />}
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                    <Icon />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* TABLE */}
      <div className="px-2 sm:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  { label: "CANDIDATE", cls: "pl-6 pr-4" },
                  { label: "MATCH SCORE", cls: "px-4" },
                  { label: "LOCATION", cls: "px-4" },
                  { label: "EXPERIENCE", cls: "px-4" },
                  { label: "KEY SKILLS", cls: "px-4" },
                  { label: "AVAILABILITY", cls: "px-4" },
                  { label: "ACTION", cls: "pl-4 pr-6" },
                ].map(({ label, cls }) => (
                  <th key={label} className={`${cls} py-3 text-left text-[11px] font-semibold text-gray-400 uppercase`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c, i) => (
                  <CandidateRow key={c.id} candidate={c} isLast={i === filtered.length - 1} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">
                    No candidates match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TalentPoolPage;
