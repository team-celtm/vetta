"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgData {
  id: string;
  name: string;
  industry: string;
  primary_city: string;
  plan: string;
  domain:string;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface SettingsData {
  org: OrgData;
  team_members: TeamMember[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Fintech / BFSI",
  "Healthcare",
  "E-commerce",
  "SaaS / Tech",
  "Manufacturing",
  "Education",
  "Real Estate",
  "Logistics",
  "Media & Entertainment",
  "Other",
];

const ROLE_COLORS: Record<string, string> = {
  admin: "text-blue-600 border border-blue-200 bg-blue-50",
  manager: "text-orange-500 border border-orange-200 bg-orange-50",
  member: "text-green-600 border border-green-200 bg-green-50",
  viewer: "text-gray-500 border border-gray-200 bg-gray-50",
};

const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-orange-500",
  "bg-blue-600",
  "bg-purple-600",
  "bg-rose-500",
  "bg-emerald-600",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Component ────────────────────────────────────────────────────────────────

const SettingPage: React.FC = () => {
  // Remote state
  const [data, setData] = useState<SettingsData | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form state (derived from remote, editable)
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
   const [domain, setDomain] = useState("");
  const [primaryCity, setPrimaryCity] = useState("");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Fetch org settings on mount ──────────────────────────────────────────
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoadingPage(true);
        setFetchError(null);

        const res = await fetch("/api/settings/org", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `Request failed: ${res.status}`);
        }

        const json: SettingsData = await res.json();
        setData(json);

        // Seed form fields from fetched data
        setCompanyName(json.org.name);
        setIndustry(json.org.industry);
        setPrimaryCity(json.org.primary_city);
        setDomain(json.org.domain)
      } catch (err: unknown) {
        setFetchError(err instanceof Error ? err.message : "Failed to load settings.");
      } finally {
        setLoadingPage(false);
      }
    }

    fetchSettings();
  }, []);

  // ── Save handler ─────────────────────────────────────────────────────────
  async function handleSave() {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const res = await fetch("/api/settings/org", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          industry,
          primary_city: primaryCity,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.error ?? `Save failed: ${res.status}`);
      }

      // Update local data so isDirty resets
      setData((prev) =>
        prev
          ? {
              ...prev,
              org: {
                ...prev.org,
                name: body.org.name,
                industry: body.org.industry,
                primary_city: body.org.primary_city,
              },
            }
          : prev
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const isDirty =
    data !== null &&
    (companyName !== data.org.name ||
      industry !== data.org.industry ||
      primaryCity !== data.org.primary_city);

  // ── Render: loading ───────────────────────────────────────────────────────
  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading settings…
        </div>
      </div>
    );
  }

  // ── Render: fetch error ───────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl border border-red-200 p-6 max-w-md w-full text-center shadow-sm">
          <p className="text-red-500 font-semibold text-sm mb-1">Failed to load settings</p>
          <p className="text-gray-500 text-xs">{fetchError}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-sm text-blue-600 underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render: main ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-end gap-3 px-8 pt-5 pb-4">
        {saveSuccess && (
          <span className="text-sm text-green-600 font-medium">✓ Changes saved</span>
        )}
        {saveError && (
          <span className="text-sm text-red-500 font-medium">{saveError}</span>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={`text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-150 shadow-sm
            ${isDirty && !saving
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-blue-300 cursor-not-allowed"
            }`}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="px-8 pb-10 max-w-screen-xl mx-auto space-y-8">

        {/* ── Company Profile ────────────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Company Profile</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Your organization details and branding preferences
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
            {/* Company Name */}
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-gray-800">Company Name</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Shown in outreach emails and candidate profiles
                </p>
              </div>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-64 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter company name"
              />
            </div>

            {/* Industry */}
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-gray-800">Industry</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Helps AI infer domain-fit signals
                </p>
              </div>
              <div className="relative w-64">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full appearance-none text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white cursor-pointer"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Primary City */}
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-gray-800">Primary City</p>
              </div>
              <input
                type="text"
                value={primaryCity}
                onChange={(e) => setPrimaryCity(e.target.value)}
                className="w-64 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g. Bangalore, India"
              />
            </div>

              <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-gray-800">Domain</p>
              </div>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-64 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g. Bangalore, India"
              />
            </div>

          </div>
        </section>

        {/* ── Team Members ───────────────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage who can access Vetta in your organization
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="divide-y divide-gray-100">
              {data?.team_members.map((member, idx) => (
                <div key={member.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={member.full_name}
                        width={10}
                        height={10}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full ${getAvatarColor(idx)} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
                      >
                        {getInitials(member.full_name)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{member.full_name}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                      ROLE_COLORS[member.role] ?? ROLE_COLORS["viewer"]
                    }`}
                  >
                    {capitalize(member.role)}
                  </span>
                </div>
              ))}

              {data?.team_members.length === 0 && (
                <p className="px-6 py-5 text-sm text-gray-400">No team members found.</p>
              )}
            </div>

            {/* Invite */}
            <div className="px-6 py-5 border-t border-gray-100">
              <button className="flex items-center gap-2 text-sm text-gray-600 font-medium border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors duration-150">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Invite Team Member
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingPage;