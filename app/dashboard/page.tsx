"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Drawer,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
} from "@mui/material";
import { TalentCard, TalentCardItem } from "../Components/TalentCardItem";
import { UploadZone } from "../Components/UploadZone";
import { JDStatus } from "../Types/dashboardPage.interface";
import { getOrgId } from "@/utils/Helpers";



// ─── API Helpers ──────────────────────────────────────────────────────────────

async function uploadJDFile(
  orgId: string,
  file: File,
  title: string,
): Promise<{ jd_id: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("title", title);
  const res = await fetch(`/api/orgs/${orgId}/job-descriptions/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed.");
  }
  return res.json();
}

async function pasteJDText(
  orgId: string,
  title: string,
  rawText: string,
): Promise<{ jd_id: string }> {
  const res = await fetch(`/api/orgs/${orgId}/job-descriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, raw_text: rawText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Save failed.");
  }
  return res.json();
}

async function fetchJDStatus(orgId: string, jdId: string): Promise<JDStatus> {
  const res = await fetch(`/api/orgs/${orgId}/job-descriptions/${jdId}`);
  if (!res.ok) throw new Error("Failed to fetch JD status.");
  const data = await res.json();
  return data.job_description as JDStatus;
}

async function fetchAllJDs(orgId: string): Promise<JDStatus[]> {
  const res = await fetch(`/api/orgs/${orgId}/job-descriptions`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.job_descriptions ?? [];
}




// ─── Add New JD Modal ─────────────────────────────────────────────────────────

function AddJDModal({
  open,
  onClose,
  onFileUpload,
  onTextSubmit,
  isLoading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onFileUpload: (file: File, title: string) => void;
  onTextSubmit: (title: string, text: string) => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [tab, setTab] = useState(0);
  const [title, setTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    const handleTab = () => {
      if (open) {
        setTab(0);
        setTitle("");
        setPasteText("");
        setSelectedFile(null);
      }
    };
    handleTab();
  }, [open]);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    if (!title.trim()) setTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          width: 480,
          maxWidth: "95vw",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">
              Add new Job Description
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Upload a file or paste text to analyse
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setTab(0)}
              className={`text-[12px] font-semibold pb-2 mr-4 border-b-2 transition-colors ${tab === 0 ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}
            >
              Upload File
            </button>
            <button
              onClick={() => setTab(1)}
              className={`text-[12px] font-semibold pb-2 border-b-2 transition-colors ${tab === 1 ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}
            >
              Paste Text
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Job title e.g. Senior Product Designer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[12.5px] border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400"
          />

          {tab === 0 ? (
            <>
              <UploadZone onUpload={handleFileSelected} />
              {selectedFile && (
                <div className="mt-2 flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                  <span className="text-[11.5px] text-gray-700 font-semibold">
                    📄 {selectedFile.name}
                  </span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <button
                disabled={!selectedFile || !title.trim() || isLoading}
                onClick={() =>
                  selectedFile && onFileUpload(selectedFile, title)
                }
                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-[13px] font-bold rounded-lg h-10 transition-colors"
              >
                {isLoading ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  "🚀"
                )}
                {isLoading ? "Uploading…" : "Upload & Analyse"}
              </button>
            </>
          ) : (
            <>
              <textarea
                rows={6}
                placeholder="Paste the full job description text here…"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full text-[12px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400 resize-none"
              />
              <button
                disabled={
                  pasteText.trim().length < 50 || !title.trim() || isLoading
                }
                onClick={() => onTextSubmit(title, pasteText)}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-[13px] font-bold rounded-lg h-10 transition-colors"
              >
                {isLoading ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  "✨"
                )}
                {isLoading ? "Saving…" : "Save & Analyse"}
              </button>
            </>
          )}

          {error && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[11.5px] text-red-600">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── JD List Item ─────────────────────────────────────────────────────────────

function JDListItem({
  jd,
  isActive,
  onClick,
}: {
  jd: JDStatus;
  isActive: boolean;
  onClick: () => void;
}) {
  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    inferring: "bg-indigo-100 text-indigo-700",
    draft: "bg-gray-100 text-gray-500",
    paused: "bg-yellow-100 text-yellow-700",
    closed: "bg-red-100 text-red-600",
  };

  const date = jd.created_at
    ? new Date(jd.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${
        isActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-blue-100" : "bg-gray-100"}`}
      >
        <svg
          className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-500"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-[13px] font-semibold truncate ${isActive ? "text-blue-900" : "text-gray-800"}`}
        >
          {jd.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[jd.status] ?? "bg-gray-100 text-gray-500"}`}
          >
            {jd.status}
          </span>
          {date && <span className="text-[10px] text-gray-400">{date}</span>}
          {jd.inferred_skills?.length > 0 && (
            <span className="text-[10px] text-gray-400">
              {jd.inferred_skills.length} skills
            </span>
          )}
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
      )}
    </button>
  );
}

// ─── Left Panel ───────────────────────────────────────────────────────────────

function LeftPanelContent({
  jd,
  allJDs,
  onSelectJD,
  onAddNewJD,
  isLoading,
  onClose,
  matchThreshold,
  onThresholdChange,
  candidateCount,
  onRefreshMatches,
}: {
  jd: JDStatus | null;
  allJDs: JDStatus[];
  onSelectJD: (jd: JDStatus) => void;
  onAddNewJD: () => void;
  isLoading: boolean;
  onClose?: () => void;
  matchThreshold: number;
  onThresholdChange: (val: number) => void;
  candidateCount: number;
  onRefreshMatches: () => void;
}) {

  const personalityTraits = jd?.inferred_personality
    ? [
        { name: "Leadership",     score: jd.inferred_personality.leadership,     icon: "🏆" },
        { name: "Team Player",    score: jd.inferred_personality.team_player,    icon: "🤝" },
        { name: "Communicator",   score: jd.inferred_personality.communication,  icon: "💬" },
        { name: "Bias to Action", score: jd.inferred_personality.bias_to_action, icon: "⚡" },
        { name: "Problem Solver", score: jd.inferred_personality.extroversion,   icon: "🧩" },
        { name: "Data Driven",    score: jd.inferred_personality.data_driven,    icon: "📊" },
      ]
    : [];
    
  const inferredSkills = jd?.inferred_skills ?? [];
  const hasInferredSkills = inferredSkills.length > 0;
  const isActive = jd?.status === "active";
  const isInferring = jd?.status === "inferring";

  const skillColors: Record<string, string> = {
    "Product Strategy": "bg-blue-100 text-blue-700",
    Roadmapping: "bg-purple-100 text-purple-700",
    "SQL / Analytics": "bg-green-100 text-green-700",
    "Agile/Scrum": "bg-yellow-100 text-yellow-800",
    "API Design": "bg-pink-100 text-pink-700",
    "5+ Years PM": "bg-orange-100 text-orange-700",
    "B2B SaaS": "bg-indigo-100 text-indigo-700",
    "Fintech Domain": "bg-teal-100 text-teal-700",
  };

  return (
    <div
      className="flex flex-col h-full bg-white overflow-y-auto"
      style={{ width: "100%" }}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
              Smart Match Engine
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-[11px] text-gray-500">
                AI inference active
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── JD List section ── */}
      <div className="px-4 pb-3">
        {/* Section header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Job Descriptions
          </span>
          {/* ── Add new JD button ── */}
          <button
            onClick={onAddNewJD}
            className="cursor-pointer flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add new JD
          </button>
        </div>

        {/* JD list */}
        {isLoading && allJDs.length === 0 ? (
          <div className="flex items-center gap-2 py-3 px-1">
            <CircularProgress size={13} sx={{ color: "#6366F1" }} />
            <span className="text-[12px] text-gray-400">
              Loading job descriptions…
            </span>
          </div>
        ) : allJDs.length === 0 ? (
          <div className="text-center py-5 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-[12px] text-gray-400">No JDs yet.</p>
            <button
              onClick={onAddNewJD}
              className="cursor-pointer mt-1.5 text-[12px] font-semibold text-blue-600 hover:underline"
            >
              Upload your first JD →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {allJDs.map((item) => (
              <JDListItem
                key={item.id}
                jd={item}
                isActive={jd?.id === item.id}
                onClick={() => onSelectJD(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Inferring state ── */}
      {isInferring && (
        <div className="mx-4 mb-3 flex items-center gap-2.5 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
          <CircularProgress size={14} thickness={5} sx={{ color: "#4F46E5" }} />
          <div>
            <p className="text-[12px] font-bold text-indigo-700">
              AI Inference Running…
            </p>
            <p className="text-[10.5px] text-gray-500">
              Extracting skills & signals
            </p>
          </div>
        </div>
      )}

      {/* ── Technical Skills ── */}
      {isActive && hasInferredSkills && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <svg
              className="w-3 h-3 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Technical Skills Detected
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {inferredSkills.map((s) => (
              <span
                key={s.name}
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${skillColors[s.name] || "bg-gray-100 text-gray-600 border-gray-200"} border-transparent`}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Personality ── */}
      {isActive && personalityTraits.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[13px]">🎯</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Personality & Culture Fit
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {personalityTraits.map((trait) => (
              <div key={trait.name} className="flex items-center gap-2">
                <span className="text-[13px] w-5 text-center">
                  {trait.icon}
                </span>
                <span className="text-[12px] text-gray-700 w-28 shrink-0">
                  {trait.name}
                </span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400"
                    style={{ width: `${trait.score}%` }}
                  />
                </div>
                <span className="text-[11.5px] font-bold text-gray-600 w-8 text-right">
                  {trait.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* ── Match threshold ── */}
      {jd && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-[11px] text-gray-500 mb-0.5">
                Match Threshold
              </p>
              <span className="text-[36px] font-black text-blue-600 leading-none">
                {matchThreshold}%
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 mb-0.5">candidates</p>
              <span className="text-[22px] font-black text-blue-600">
                {candidateCount}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={20}
            max={90}
            value={matchThreshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #2563EB ${((matchThreshold - 20) / 70) * 100}%, #E5E7EB ${((matchThreshold - 20) / 70) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">Broader 20%</span>
            <span className="text-[10px] text-gray-400">Stricter 90%</span>
          </div>
          <button
            onClick={onRefreshMatches}
            className="cursor-pointer mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl h-10 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Matches
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({
  matched,
  topMatch,
  avgMatch,
  computeTime,
}: {
  matched: number;
  topMatch: number;
  avgMatch: number;
  computeTime: string;
}) {
  return (
    <div className="flex items-center gap-6 px-6 py-3 bg-white border-b border-gray-100">
      {[
        {
          icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
          label: "Matched",
          value: String(matched),
          color: "bg-blue-50 text-blue-500",
        },
        {
          icon: "M5 13l4 4L19 7",
          label: "90%+ match",
          value: String(topMatch),
          color: "bg-emerald-50 text-emerald-500",
        },
        {
          icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
          label: "Avg match",
          value: `${avgMatch}%`,
          color: "bg-yellow-50 text-yellow-500",
        },
        {
          icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
          label: "Compute time",
          value: computeTime,
          color: "bg-sky-50 text-sky-500",
        },
      ].map((stat, i, arr) => (
        <div key={stat.label} className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.color}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={stat.icon}
              />
            </svg>
          </div>
          <div>
            <p className="text-[20px] font-black text-gray-900 leading-none">
              {stat.value}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">{stat.label}</p>
          </div>
          {i < arr.length - 1 && <div className="w-px h-8 bg-gray-100 ml-2" />}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [allResults, setAllResults] = useState<TalentCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [matchThreshold, setMatchThreshold] = useState(30);
  const [addJDOpen, setAddJDOpen] = useState(false);

  // All JDs fetched from backend
  const [allJDs, setAllJDs] = useState<JDStatus[]>([]);
  const [jdsLoading, setJdsLoading] = useState(false);

  const [jd, setJd] = useState<JDStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const computeStartRef = useRef<number | null>(null);
  const [computeTime, setComputeTime] = useState("—");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [draftLocations, setDraftLocations] = useState<string[]>([]);
  const [draftExperience, setDraftExperience] = useState<string[]>([]);
  const [draftAvailability, setDraftAvailability] = useState<string[]>([]);
  const [appliedLocations, setAppliedLocations] = useState<string[]>([]);
  const [appliedExperience, setAppliedExperience] = useState<string[]>([]);
  const [appliedAvailability, setAppliedAvailability] = useState<string[]>([]);

  const AVAILABILITY_OPTIONS = [
    { value: "available-now", label: "Available Now", color: "#22C55E" },
    { value: "open", label: "Open to Offers", color: "#3B82F6" },
    {
      value: "available-2weeks",
      label: "Available in 2 weeks",
      color: "#EAB308",
    },
    {
      value: "available-1month",
      label: "Available in 1 month+",
      color: "#EF4444",
    },
  ];

  const EXPERIENCE_BUCKETS = [
    { label: "0-2 yrs", min: 0, max: 2 },
    { label: "3-5 yrs", min: 3, max: 5 },
    { label: "6-10 yrs", min: 6, max: 10 },
    { label: "10+ yrs", min: 11, max: 50 },
  ];

  function getYears(exp: string) {
    return parseInt(exp);
  }

  useEffect(() => {
    if (filtersOpen) {
      setDraftLocations(appliedLocations);
      setDraftExperience(appliedExperience);
      setDraftAvailability(appliedAvailability);
    }
  }, [filtersOpen, appliedLocations, appliedExperience, appliedAvailability]);

  const visibleResults = allResults.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation =
      appliedLocations.length === 0 || appliedLocations.includes(r.location);
    const years = getYears(r.experience);
    const matchesExperience =
      appliedExperience.length === 0 ||
      appliedExperience.some((bl) => {
        const b = EXPERIENCE_BUCKETS.find((x) => x.label === bl);
        return b ? years >= b.min && years <= b.max : false;
      });
    const matchesAvailability =
      appliedAvailability.length === 0 ||
      appliedAvailability.includes(r.availability ?? "");
    const matchesThreshold = (r.match ?? 0) >= matchThreshold;
    return (
      matchesSearch &&
      matchesLocation &&
      matchesExperience &&
      matchesAvailability &&
      matchesThreshold
    );
  });

  const loadMatches = useCallback(async (jdId: string) => {
    const orgId = getOrgId();
    if (!orgId) return;
    setMatchesLoading(true); // ← ADD
    try {
      const res = await fetch(
        `/api/orgs/${orgId}/job-descriptions/${jdId}/matches`,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || "Failed to load matches.");
      }
      const data = await res.json();
      setAllResults(data.results ?? []);
      if (computeStartRef.current) {
        const elapsed = ((Date.now() - computeStartRef.current) / 1000).toFixed(
          1,
        );
        setComputeTime(`${elapsed}s`);
        computeStartRef.current = null;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setMatchesLoading(false); 
    }
  }, []);

  const startPolling = useCallback(
    (jdId: string) => {
      const orgId = getOrgId();
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        try {
          const latest = await fetchJDStatus(orgId, jdId);
          setJd(latest);
          // Also update in allJDs list
          setAllJDs((prev) =>
            prev.map((j) => (j.id === latest.id ? latest : j)),
          );
          if (latest.status === "active") {
            clearInterval(pollingRef.current!);
            pollingRef.current = null;
            loadMatches(jdId);
          }
          if (latest.status === "closed" || latest.status === "paused") {
            clearInterval(pollingRef.current!);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);
    },
    [loadMatches],
  );

  // Load all JDs on mount
  const loadAllJDs = useCallback(async () => {
    const orgId = getOrgId();
    if (!orgId) return;
    setJdsLoading(true);
    try {
      const jds = await fetchAllJDs(orgId);
      setAllJDs(jds);
      // Auto-select the most recent active one
      const latest = jds.find((j) => j.status === "active") ?? jds[0] ?? null;
      if (latest) {
        setJd(latest);
        if (latest.status === "active") loadMatches(latest.id);
        if (latest.status === "inferring") startPolling(latest.id);
      }
    } catch {
      // silent
    } finally {
      setJdsLoading(false);
    }
  }, [loadMatches, startPolling]);

  useEffect(() => {
    loadAllJDs();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadAllJDs]);

  // Switch active JD
  const handleSelectJD = (selected: JDStatus) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setJd(selected);
    setAllResults([]);
    setError(null);
    setComputeTime("—");
    computeStartRef.current = Date.now();
    if (selected.status === "active") loadMatches(selected.id);
    if (selected.status === "inferring") startPolling(selected.id);
  };

  const handleFileUpload = async (file: File, title: string) => {
    const orgId = getOrgId();
    setIsLoading(true);
    setError(null);
    setAllResults([]);
    computeStartRef.current = Date.now();
    try {
      const { jd_id } = await uploadJDFile(orgId, file, title);
      const newJD: JDStatus = {
        id: jd_id,
        status: "inferring",
        title,
        inferred_skills: [],
        inferred_seniority: null,
        inferred_domain: null,
        created_at: new Date().toISOString(),
      };
      setJd(newJD);
      setAllJDs((prev) => [newJD, ...prev]);
      setAddJDOpen(false);
      startPolling(jd_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (title: string, rawText: string) => {
    const orgId = getOrgId();
    setIsLoading(true);
    setError(null);
    setAllResults([]);
    computeStartRef.current = Date.now();
    try {
      const { jd_id } = await pasteJDText(orgId, title, rawText);
      const newJD: JDStatus = {
        id: jd_id,
        status: "inferring",
        title,
        inferred_skills: [],
        inferred_seniority: null,
        inferred_domain: null,
        created_at: new Date().toISOString(),
      };
      setJd(newJD);
      setAllJDs((prev) => [newJD, ...prev]);
      setAddJDOpen(false);
      startPolling(jd_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const isInferring = jd?.status === "inferring";
  const hasResults = visibleResults.length > 0;
  const orgId = getOrgId();
  const jdId = jd?.id ?? "";

  const matched = allResults.length;

  const topMatch = allResults.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => (r.matchScore ?? 0) >= 90,
  ).length;

  const avgMatch =
    matched > 0
      ? Math.round(
          allResults.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, r: any) => sum + (r.matchScore ?? 0),
            0,
          ) / matched,
        )
      : 0;

  const locationCounts = allResults.reduce(
    (acc: Record<string, number>, curr) => {
      acc[curr.location] = (acc[curr.location] || 0) + 1;
      return acc;
    },
    {},
  );

  const leftPanel = (
    <LeftPanelContent
      jd={jd}
      allJDs={allJDs}
      onSelectJD={handleSelectJD}
      onAddNewJD={() => setAddJDOpen(true)}
      isLoading={jdsLoading}
      onClose={isMobile ? () => setLeftDrawerOpen(false) : undefined}
      matchThreshold={matchThreshold}
      onThresholdChange={setMatchThreshold}
      candidateCount={visibleResults.length}
      onRefreshMatches={() => {
        if (jd) {
          setMatchThreshold(30);
          loadMatches(jd.id);
        }
      }}
    />
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop left panel */}
      {!isMobile && (
        <div className="w-97.5 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
          {leftPanel}
        </div>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={leftDrawerOpen}
          onClose={() => setLeftDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: "min(320px, 85vw)",
              border: "none",
              p: 0,
            },
          }}
        >
          {leftPanel}
        </Drawer>
      )}

      {/* Add JD Modal */}
      <AddJDModal
        open={addJDOpen}
        onClose={() => setAddJDOpen(false)}
        onFileUpload={handleFileUpload}
        onTextSubmit={handleTextSubmit}
        isLoading={isLoading}
        error={error}
      />

      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setLeftDrawerOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-blue-500 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-[17px] font-bold text-gray-900">
                Talent Match Results
              </h1>
              {jd && <p className="text-[11px] text-gray-400">{jd.title}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 h-9 w-52">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search talent pool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-[13px] text-gray-700 flex-1 min-w-0 focus:outline-none placeholder-gray-400 bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="cursor-pointer hidden sm:flex items-center gap-1.5 h-9 px-3.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              Filters
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <StatsBar
          matched={matched}
          topMatch={topMatch}
          avgMatch={avgMatch}
          computeTime={computeTime}
        />

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-[#F5F2EC]">
          {(isInferring || matchesLoading) && (
            <div className="text-center mt-20">
              <CircularProgress />
              <p className="mt-3 font-bold text-gray-700">
                {isInferring ? "AI is inferring skills…" : "Loading matches…"}
              </p>
              {matchesLoading && (
                <p className="mt-1 text-[13px] text-gray-400">
                  Finding the best candidates for {jd?.title}
                </p>
              )}
            </div>
          )}
          {!isInferring && !matchesLoading && !hasResults && !error && (
            <div className="text-center mt-20 opacity-50">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="mt-3 text-gray-600">
                Select a Job Description to see matches.
              </p>
              <button
                onClick={() => setAddJDOpen(true)}
                className="mt-3 text-[13px] font-semibold text-blue-600 hover:underline"
              >
                + Add a new JD
              </button>
            </div>
          )}
          {error && !isInferring && !matchesLoading && (
            <div className="text-center mt-20 p-6 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}
          {!isInferring && !matchesLoading && hasResults && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[18px] font-bold text-gray-900">
                    Matched Candidates
                  </h2>
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    {searchQuery
                      ? `${visibleResults.length} of ${allResults.length} match "${searchQuery}"`
                      : `Found ${allResults.length} vetted candidates for "${jd?.title}"`}
                  </p>
                </div>
              </div>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                }}
              >
                {visibleResults.map((card) => (
                  <TalentCardItem
                    key={card.id}
                    card={card}
                    orgId={orgId}
                    jdId={jdId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters drawer — unchanged */}
        <Drawer
          anchor="right"
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 380,
              p: 0,
              borderRadius: "16px 0 0 16px",
            },
          }}
        >
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#1a1a2e] rounded-md flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="2"
                      width="5"
                      height="5"
                      rx="1"
                      fill="white"
                    />
                    <rect
                      x="9"
                      y="2"
                      width="5"
                      height="5"
                      rx="1"
                      fill="white"
                    />
                    <rect
                      x="2"
                      y="9"
                      width="5"
                      height="5"
                      rx="1"
                      fill="white"
                    />
                    <rect
                      x="9"
                      y="9"
                      width="5"
                      height="5"
                      rx="1"
                      fill="white"
                    />
                  </svg>
                </div>
                <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">
                  Filter Candidates
                </h2>
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 text-sm hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Location */}
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-3">
                  <span>📍</span> Location
                </p>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(locationCounts).map(([loc, count]) => {
                    const active = draftLocations.includes(loc);
                    return (
                      <button
                        key={loc}
                        onClick={() =>
                          setDraftLocations((prev) =>
                            prev.includes(loc)
                              ? prev.filter((l) => l !== loc)
                              : [...prev, loc],
                          )
                        }
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border text-sm transition-all ${active ? "bg-blue-50 border-blue-500" : "bg-white border-gray-200 hover:border-gray-300"}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 transition-all ${active ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}
                        >
                          {active && (
                            <svg
                              width="10"
                              height="8"
                              viewBox="0 0 10 8"
                              fill="none"
                            >
                              <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="white"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`flex-1 text-left ${active ? "text-blue-700" : "text-gray-700"}`}
                        >
                          {loc}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Availability */}
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-3">
                  <span>✅</span> Availability
                </p>
                <div className="flex flex-col gap-1.5">
                  {AVAILABILITY_OPTIONS.map(({ value, label, color }) => {
                    const active = draftAvailability.includes(value);
                    return (
                      <div
                        key={value}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border border-gray-200 bg-white"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: color }}
                        />
                        <span className="flex-1 text-sm text-gray-700">
                          {label}
                        </span>
                        <button
                          role="switch"
                          aria-checked={active}
                          onClick={() =>
                            setDraftAvailability((prev) =>
                              prev.includes(value)
                                ? prev.filter((v) => v !== value)
                                : [...prev, value],
                            )
                          }
                          className={`relative w-[38px] h-[22px] rounded-full transition-colors duration-200 flex-shrink-0 ${active ? "bg-blue-600" : "bg-gray-200"}`}
                        >
                          <span
                            className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${active ? "translate-x-[19px]" : "translate-x-[3px]"}`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2.5">
              <button
                onClick={() => {
                  setDraftLocations([]);
                  setDraftExperience([]);
                  setDraftAvailability([]);
                }}
                className="flex-1 py-3 rounded-[10px] border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={() => {
                  setAppliedLocations(draftLocations);
                  setAppliedExperience(draftExperience);
                  setAppliedAvailability(draftAvailability);
                  setFiltersOpen(false);
                }}
                className="cursor-pointer flex-[1.6] py-3 rounded-[10px] bg-[#1E3A8A] text-white text-sm font-semibold hover:bg-blue-900 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
