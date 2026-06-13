export function StatsBar({
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
  const stats = [
    {
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      label: "Matched",
      value: String(matched),
      color: "bg-blue-50 text-blue-500",
    },
    {
      icon: "M5 13l4 4L19 7",
      label: "90%+ Match",
      value: String(topMatch),
      color: "bg-emerald-50 text-emerald-500",
    },
    {
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
      label: "Avg Match",
      value: `${avgMatch}%`,
      color: "bg-yellow-50 text-yellow-500",
    },
    {
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      label: "Compute Time",
      value: computeTime,
      color: "bg-sky-50 text-sky-500",
    },
  ];

  return (
    <div className="border-b border-gray-100 bg-white p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-sm"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.color}`}
            >
              <svg
                className="h-5 w-5"
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

            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-none text-gray-900 sm:text-xl">
                {stat.value}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}