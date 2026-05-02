import React from "react";

const steps = [
  {
    number: "01",
    title: "Upload Your JD",
    description:
      "Paste or upload any job description — PDF, DOCX, or plain text. We accept any format.",
  },
  {
    number: "02",
    title: "AI Parses & Infers",
    description:
      "Our engine extracts skills, seniority, domain, and personality attributes in under 3 seconds.",
  },
  {
    number: "03",
    title: "Set Your Threshold",
    description:
      "Drag the match slider to control precision vs. volume. See your pool update in real time.",
  },
  {
    number: "04",
    title: "Engage Top Talent",
    description:
      "Review full profiles, shortlist, schedule interviews, or send outreach in one click.",
  },
];

const Working = () => {
  return (
    <section className="relative w-full bg-[#0b0f1c] overflow-hidden py-20 px-8 md:px-16">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Subtle radial vignette to darken corners */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, transparent 40%, rgba(11,15,28,0.85) 100%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-8 h-px bg-blue-500" />
          <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">
            How It Works
          </span>
        </div>

        {/* Heading */}
        <h2
          className="text-white font-black text-5xl md:text-6xl leading-[1.05] mb-6 max-w-lg"
         
        >
          From JD to shortlist in four steps
        </h2>

        {/* Subtext */}
        <p className="text-gray-400 text-base max-w-md mb-16 leading-relaxed">
          No configuration. No manual tagging. Just upload and let Vetta&apos;s
          engine do what it was built for.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 ease-out
             hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10
             border border-white/10 hover:border-blue-500 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(4px)",
              }}
            >
              {/* Step number */}
              <span
                className="text-7xl font-black leading-none"
                style={{
                  fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif",
                  color: "rgba(37, 99, 235, 0.45)",
                }}
              >
                {step.number}
              </span>

              {/* Title */}
              <h3 className="text-white font-bold text-base leading-snug">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Working;
