"use client";

import { SettingsData } from "@/app/Types/settings.interface";
import { INDUSTRIES, ROLE_COLORS } from "@/utils/constants";
import { capitalize, getAvatarColor, getInitials } from "@/utils/Helpers";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

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
  const [industryOpen, setIndustryOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIndustryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        setDomain(json.org.domain);
      } catch (err: unknown) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load settings.",
        );
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
          : prev,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <svg
            className="w-5 h-5 animate-spin text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  // ── Render: fetch error ───────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-red-200 p-6 max-w-md w-full text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold text-sm mb-1">
            Failed to load settings
          </p>
          <p className="text-gray-500 text-xs mb-4">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render: main ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your organization profile and team
            </p>
          </div>

          <div className="flex items-center gap-4">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
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
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Changes saved
              </span>
            )}

            {saveError && (
              <span className="text-sm font-medium text-red-500">
                {saveError}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className={`flex w-full sm:w-auto items-center justify-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-150 shadow-sm
                ${
                  isDirty && !saving
                    ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {saving && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-8 max-w-screen-xl mx-auto space-y-8">
        {/* ── Company Profile ────────────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Company Profile
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Your organization details and branding preferences
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
            {/* Company Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-5">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-900">
                  Company Name
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Shown in outreach emails and candidate profiles
                </p>
              </div>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full sm:w-72 shrink-0 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                placeholder="Enter company name"
              />
            </div>

            {/* Industry */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-5">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-900">
                  Industry
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Helps AI infer domain-fit signals
                </p>
              </div>
              <div className="relative w-full sm:w-72 shrink-0">
                <div ref={dropdownRef} className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setIndustryOpen((prev) => !prev)}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-sm transition hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <span
                      className={industry ? "text-gray-900" : "text-gray-400"}
                    >
                      {industry || "Select industry"}
                    </span>

                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        industryOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {industryOpen && (
                    <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => {
                            setIndustry(ind);
                            setIndustryOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-blue-50 ${
                            industry === ind
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {ind}

                          {industry === ind && (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Primary City */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-5">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-900">
                  Primary City
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Used as the default location for new searches
                </p>
              </div>
              <input
                type="text"
                value={primaryCity}
                onChange={(e) => setPrimaryCity(e.target.value)}
                className="w-full sm:w-72 shrink-0 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                placeholder="e.g. Bangalore, India"
              />
            </div>

            {/* Domain (read-only) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-5">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-900">
                  Domain
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Contact support to change your verified domain
                </p>
              </div>
              <input
                type="text"
                value={domain}
                readOnly
                disabled
                className="w-full sm:w-72 shrink-0 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-not-allowed"
                placeholder="e.g. acme.com"
              />
            </div>
          </div>
        </section>

        {/* ── Team Members ───────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Team Members
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage who can access Vetta in your organization
              </p>
            </div>
            {data?.team_members && data.team_members.length > 0 && (
              <span className="text-xs font-medium text-gray-400 hidden sm:inline-block">
                {data.team_members.length}{" "}
                {data.team_members.length === 1 ? "member" : "members"}
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="divide-y divide-gray-100">
              {data?.team_members.map((member, idx) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={member.full_name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full ${getAvatarColor(
                          idx,
                        )} flex items-center justify-center text-white text-sm font-semibold shrink-0`}
                      >
                        {getInitials(member.full_name)}
                      </div>
                    )}
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-md shrink-0 ${
                      ROLE_COLORS[member.role] ?? ROLE_COLORS["viewer"]
                    }`}
                  >
                    {capitalize(member.role)}
                  </span>
                </div>
              ))}

              {data?.team_members.length === 0 && (
                <div className="px-4 sm:px-6 py-10 text-center">
                  <p className="text-sm text-gray-400">
                    No team members found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingPage;
