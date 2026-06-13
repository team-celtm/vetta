"use client";
import Link from "next/link";
import React from "react";

interface Candidate {
  initials: string;
  name: string;
  role: string;
  exp: string;
  score: number;
  avatarBg: string;
  scoreBg: string;
  scoreColor: string;
}

const candidates: Candidate[] = [
  {
    initials: "AM",
    name: "Aarav Mehta",
    role: "Sr. PM",
    exp: "7 yrs exp",
    score: 96,
    avatarBg: "bg-[#4F63FF]",
    scoreBg: "bg-[#ECFDF5]",
    scoreColor: "text-[#10B981]",
  },
  {
    initials: "PN",
    name: "Priya Nair",
    role: "Product Lead",
    exp: "6 yrs",
    score: 91,
    avatarBg: "bg-[#F59E0B]",
    scoreBg: "bg-[#ECFDF5]",
    scoreColor: "text-[#10B981]",
  },
  {
    initials: "RK",
    name: "Rohan Kapoor",
    role: "Head of Product",
    exp: "9 yrs",
    score: 88,
    avatarBg: "bg-[#10B981]",
    scoreBg: "bg-[#FFFBEB]",
    scoreColor: "text-[#F59E0B]",
  },
  {
    initials: "SV",
    name: "Sanya Verma",
    role: "PM Fintech",
    exp: "5 yrs",
    score: 82,
    avatarBg: "bg-[#8B5CF6]",
    scoreBg: "bg-[#FFFBEB]",
    scoreColor: "text-[#F59E0B]",
  },
];

const avatarColors: string[] = [
  "bg-[#E74C3C]",
  "bg-[#F39C12]",
  "bg-[#27AE60]",
  "bg-[#8E44AD]",
];
const avatarLetters: string[] = ["R", "S", "M", "P"];

const TalentIntelligence: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#F0F0EC] overflow-hidden font-sans">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main layout — full-width with padding, flex col on mobile, row on desktop */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16 flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-10">

        {/* ── LEFT COLUMN — wider, no max-w cap ── */}
        <div className="w-full lg:flex-[1.1] lg:max-w-none pt-2">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#E2E2DC] rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-widest text-[#1a1a1a] uppercase mb-7">
            <span className="w-[7px] h-[7px] rounded-full bg-[#4F63FF] inline-block flex-shrink-0" />
            AI-POWERED TALENT INTELLIGENCE
          </div>

          {/* Headline — scales down gracefully on small screens */}
          <h1 className="font-extrabold leading-none tracking-[-2px] text-[#0f0f0f] mb-6 text-[clamp(48px,7vw,80px)]">
            Hire the
            <br />
            Exact
            <br />
            <span className="text-[#2C4EFF]">
              Right
              <br />
              Person.
            </span>
            <br />
            Every
            <br />
            Time.
          </h1>

          {/* Subtext — no max-w cap so it stretches with the column */}
          <p className="text-[15px] text-[#555] leading-[1.65] mb-9 max-w-sm lg:max-w-none">
            Vetta&apos;s real-time AI engine reads your JD, infers the skills
            and personality traits you need, then surfaces your perfect match
            from a curated pool of 1,200+ pre-vetted professionals.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-9">
            <Link
              href="/login"
              className="cursor-pointer inline-flex items-center gap-3 bg-[#2C4EFF] hover:bg-[#1a3ae0] text-white text-[15px] font-semibold rounded-[10px] px-4 py-3 xl:px-6 xl:py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              Get Started Free
              <span className="w-8 h-8 bg-white/20 rounded-[6px] flex items-center justify-center text-lg">
                →
              </span>
            </Link>

            <a
              href="#"
              className="inline-flex items-center gap-2 bg-white hover:border-[#aaa] text-[#111] text-[15px] font-medium border-[1.5px] border-[#E2E2DC] rounded-[10px] px-[22px] py-[15px] transition-all duration-300 hover:-translate-y-1"
            >
              ▶ Watch Demo
            </a>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-3 text-[13.5px] text-[#444]">
            <div className="flex flex-shrink-0">
              {avatarLetters.map((letter, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center justify-center w-[30px] h-[30px] rounded-full text-white text-[13px] font-semibold border-2 border-[#F0F0EC] ${avatarColors[i]} ${
                    i !== 0 ? "-ml-2" : ""
                  }`}
                >
                  {letter}
                </span>
              ))}
            </div>
            <span>
              Trusted by{" "}
              <span className="font-bold text-[#111]">240+ hiring teams</span>{" "}
              across India & APAC
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN — wider card ── */}
        <div className="relative w-full lg:flex-[1.2] flex justify-center lg:justify-end">

          {/* Floating badge — repositioned for mobile */}
          <div className="absolute -top-3 left-2 sm:-top-4 sm:-left-4 bg-white border-[1.5px] border-[#E2E2DC] rounded-xl px-4 py-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-10">
            <div className="text-[28px] font-extrabold text-[#2C4EFF] leading-none">
              96%
            </div>
            <div className="text-[11px] text-[#888] mt-[2px] whitespace-nowrap">
              Top match score
            </div>
          </div>

          {/* Card — full width on mobile, wider on desktop */}
          <div className="bg-white rounded-[18px] shadow-[0_24px_64px_rgba(0,0,0,0.13)] overflow-hidden w-full mt-8 sm:mt-4 lg:mt-4 lg:translate-y-4">

            {/* Header */}
            <div className="bg-[#2C4EFF] px-5 py-[14px] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[15px] font-bold text-white truncate">
                  SM — Fintech · Match Results
                </div>
                <div className="text-[11.5px] text-white/70 mt-[1px]">
                  Analysis complete · 8 skills detected
                </div>
              </div>
              <div className="bg-white/15 text-white text-[11px] font-bold px-[10px] py-1 rounded-[6px] tracking-[0.04em] flex-shrink-0">
                75% threshold
              </div>
            </div>

            {/* Candidates */}
            <div>
              {candidates.map((c, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAF8] transition ${
                    i !== candidates.length - 1
                      ? "border-b border-[#F4F4F0]"
                      : ""
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-[38px] h-[38px] rounded-full text-white text-[13px] font-bold flex-shrink-0 ${c.avatarBg}`}
                  >
                    {c.initials}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#111] truncate">
                      {c.name}
                    </div>
                    <div className="text-[12px] text-[#888] mt-[1px] truncate">
                      {c.role} · {c.exp}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center justify-center min-w-[52px] px-3 py-[5px] rounded-[8px] text-[14px] font-bold flex-shrink-0 ${c.scoreBg} ${c.scoreColor}`}
                  >
                    {c.score}%
                  </span>
                </div>
              ))}
            </div>

            {/* Slider + AI match time footer */}
            <div className="px-5 py-4 border-t border-[#F4F4F0] bg-[#FAFAF8]">
              <div className="flex items-center justify-between gap-4">

                {/* Slider section */}
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[#555] mb-2">
                    Match Threshold
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min={50}
                      max={100}
                      defaultValue={75}
                      readOnly
                      className="w-full h-[4px] rounded-full appearance-none pointer-events-none"
                      style={{
                        background: `linear-gradient(to right, #2C4EFF 0%, #2C4EFF 50%, #D1D5DB 50%, #D1D5DB 100%)`,
                      }}
                    />
                    <style>{`
                      input[type='range']::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: white;
                        border: 2.5px solid #2C4EFF;
                        box-shadow: 0 2px 6px rgba(44,78,255,0.25);
                        cursor: default;
                      }
                      input[type='range']::-moz-range-thumb {
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: white;
                        border: 2.5px solid #2C4EFF;
                        box-shadow: 0 2px 6px rgba(44,78,255,0.25);
                        cursor: default;
                      }
                    `}</style>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-[#E8E8E4] flex-shrink-0" />

                {/* AI match time */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[22px] font-extrabold text-[#10B981] leading-none">
                    2.1S
                  </div>
                  <div className="text-[11px] text-[#888] mt-[3px]">
                    AI match time
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentIntelligence;