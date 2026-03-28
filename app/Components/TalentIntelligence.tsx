"use client";
import React from "react";

interface Candidate {
  initials: string;
  name: string;
  role: string;
  exp: string;
  score: number;
  avatarBg: string;
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
    scoreColor: "text-[#10B981]",
  },
  {
    initials: "PN",
    name: "Priya Nair",
    role: "Product Lead",
    exp: "6 yrs",
    score: 91,
    avatarBg: "bg-[#F59E0B]",
    scoreColor: "text-[#10B981]",
  },
  {
    initials: "RK",
    name: "Rohan Kapoor",
    role: "Head of Product",
    exp: "9 yrs",
    score: 88,
    avatarBg: "bg-[#10B981]",
    scoreColor: "text-[#F59E0B]",
  },
  {
    initials: "SV",
    name: "Sanya Verma",
    role: "PM Fintech",
    exp: "5 yrs",
    score: 82,
    avatarBg: "bg-[#8B5CF6]",
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
    <div className="relative min-h-[80vh] bg-[#F0F0EC] overflow-hidden font-sans">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main layout */}
      <div className="relative z-10 max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-12 py-16 lg:py-24 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 min-h-[80vh]">
        
        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 w-full max-w-[560px] lg:pt-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#E2E2DC] rounded-full px-4 py-[6px] text-[11px] font-semibold tracking-widest text-[#1a1a1a] uppercase mb-8">
            <span className="w-[7px] h-[7px] rounded-full bg-[#4F63FF] inline-block" />
            AI-POWERED TALENT INTELLIGENCE
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(48px,6vw,80px)] font-extrabold leading-[1.0] tracking-[-2px] text-[#0f0f0f] mb-6">
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

          {/* Subtext */}
          <p className="text-[15px] text-[#555] leading-[1.65] max-w-[420px] mb-9">
            Vetta&apos;s real-time AI engine reads your JD, infers the skills
            and personality traits you need, then surfaces your perfect match
            from a curated pool of 1,200+ pre-vetted professionals.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-9">
            <a
              href="#"
              className="inline-flex items-center gap-3 bg-[#2C4EFF] hover:bg-[#1a3ae0] text-white text-[15px] font-semibold rounded-[10px] px-6 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              Get Started Free
              <span className="w-8 h-8 bg-white/20 rounded-[6px] flex items-center justify-center text-lg">
                →
              </span>
            </a>

            <a
              href="#"
              className="inline-flex items-center gap-2 bg-white hover:border-[#aaa] text-[#111] text-[15px] font-medium border-[1.5px] border-[#E2E2DC] rounded-[10px] px-[22px] py-[15px] transition-all duration-300 hover:-translate-y-1"
            >
              ▶ Watch Demo
            </a>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-3 text-[13.5px] text-[#444]">
            <div className="flex">
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
              <span className="font-bold text-[#111]">
                240+ hiring teams
              </span>{" "}
              across India & APAC
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="relative flex-1 w-full max-w-[520px] flex justify-center">
          
          {/* Floating badge */}
          <div className="absolute -top-4 -left-4 bg-white border-[1.5px] border-[#E2E2DC] rounded-xl px-4 py-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-10">
            <div className="text-[28px] font-extrabold text-[#2C4EFF] leading-none">
              96%
            </div>
            <div className="text-[11px] text-[#888] mt-[2px] whitespace-nowrap">
              Top match score
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[18px] shadow-[0_24px_64px_rgba(0,0,0,0.13)] overflow-hidden w-full transform lg:translate-y-4">
            
            {/* Header */}
            <div className="bg-[#2C4EFF] px-5 py-[14px] flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold text-white">
                  SM — Fintech · Match Results
                </div>
                <div className="text-[11.5px] text-white/70 mt-[1px]">
                  Analysis complete · 8 skills detected
                </div>
              </div>
              <div className="bg-white/15 text-white text-[11px] font-bold px-[10px] py-1 rounded-[6px] tracking-[0.04em]">
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
                    className={`inline-flex items-center justify-center w-[38px] h-[38px] rounded-full text-white text-[13px] font-bold ${c.avatarBg}`}
                  >
                    {c.initials}
                  </span>

                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-[#111]">
                      {c.name}
                    </div>
                    <div className="text-[12px] text-[#888] mt-[1px]">
                      {c.role} · {c.exp}
                    </div>
                  </div>

                  <div className={`text-[15px] font-bold ${c.scoreColor}`}>
                    {c.score}%
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#F4F4F0] bg-[#FAFAF8] flex justify-end">
              <div className="text-right">
                <div className="text-[22px] font-extrabold text-[#10B981]">
                  2.1S
                </div>
                <div className="text-[11px] text-[#888] mt-[1px]">
                  AI match time
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