const features = [
  {
    icon: "🧠",
    iconBg: "bg-pink-100",
    title: "JD Intelligence Engine",
    description:
      "Upload any job description and our NLP engine instantly extracts 20+ skill signals, seniority levels, personality requirements, and cultural fit markers.",
    highlight: false,
  },
  {
    icon: "🎯",
    iconBg: "bg-teal-100",
    title: "Precision Match Slider",
    description:
      "Drag your match threshold between 40–95%. The pool expands or tightens in real time, showing exactly how many candidates qualify at each level.",
    highlight: true,
  },
  {
    icon: "📊",
    iconBg: "bg-purple-100",
    title: "Skill Radar Profiles",
    description:
      "Each candidate comes with a 6-axis radar chart, bar-chart breakdowns, certifications, work history, and verified contact details — all in one place.",
    highlight: false,
  },
  {
    icon: "🤝",
    iconBg: "bg-yellow-100",
    title: "Personality Fit Scoring",
    description:
      "Beyond skills — we score leadership potential, team-player index, communication style, and extroversion level so you hire for culture too.",
    highlight: false,
  },
  {
    icon: "✅",
    iconBg: "bg-green-100",
    title: "100% Vetted Pool",
    description:
      "Every professional in our pool has been background-checked, skill-assessed, and reference-verified. Zero noise, only signal.",
    highlight: true,
  },
  {
    icon: "⚡",
    iconBg: "bg-orange-100",
    title: "One-Click Outreach",
    description:
      "Shortlist candidates, schedule interviews, and send personalized outreach messages without leaving the platform. Full pipeline management built in.",
    highlight: false,
  },
];

const PlatformFeatures = () => {
  return (
    <section className="w-full bg-[#f0ece4] py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-8 h-px bg-blue-500" />
          <span className="text-blue-600 text-xs font-semibold tracking-widest uppercase">
            Platform Features
          </span>
        </div>

        {/* Heading */}
        <h2
          className="text-[#0d1117] font-black text-5xl md:text-6xl leading-[1.05] mb-5 max-w-lg"
          style={{
            fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif",
          }}
        >
          Intelligence built for modern hiring teams
        </h2>

        {/* Subtext */}
        <p className="text-gray-500 text-sm leading-relaxed max-w-md mb-14">
          From JD upload to first interview in under an hour. Vetta&apos;s AI
          does the heavy lifting so your team can focus on conversations, not
          spreadsheets.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="
    group
    bg-white  cursor-pointer rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden
    transition-all duration-300
    hover:shadow-md
  "
              style={{
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {/* Top Blue Line (Hover) */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-[#1C3FFF] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center text-2xl`}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-[#0d1117] font-bold text-base leading-snug">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
