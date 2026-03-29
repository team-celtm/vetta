import React from 'react';

const testimonials = [
  {
    quote:
      '"We used to spend 3 weeks sourcing candidates for senior roles. With Vetta, we had 6 qualified shortlisted candidates in an afternoon. The match quality is genuinely impressive."',
    name: 'Riya Nambiar',
    role: 'VP People · Razorpay',
    initials: 'RN',
    avatarBg: 'bg-blue-600',
  },
  {
    quote:
      '"The personality fit scoring is what sets Vetta apart. We didn\'t just get skilled candidates — we got people who genuinely fit our team culture. Retention went up 40%."',
    name: 'Ankit Malhotra',
    role: 'CHRO · Freshworks',
    initials: 'AM',
    avatarBg: 'bg-orange-500',
  },
  {
    quote:
      '"We\'ve used every major ATS on the market. Vetta is the first tool that actually understands what we need instead of just keyword-matching. It\'s the future of recruiting."',
    name: 'Pooja Sharma',
    role: 'Talent Director · Flipkart',
    initials: 'PS',
    avatarBg: 'bg-teal-600',
  },
];

const Stars = () => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
      </svg>
    ))}
  </div>
);

const CustomerStories = () => {
  return (
    <section className="w-full bg-[#f0ece4] py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-5">
          <span className="block w-8 h-px bg-blue-500" />
          <span className="text-blue-600 text-xs font-semibold tracking-widest uppercase">
            Customer Stories
          </span>
        </div>

        {/* Heading */}
        <h2
          className="text-[#0d1117] font-black text-5xl md:text-6xl leading-[1.05] mb-14"
          
        >
          Hiring teams
          <br />
          love Vetta
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-8 flex flex-col justify-between gap-8"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="flex flex-col gap-5">
                <Stars />
                <p className="text-[#0d1117] text-sm leading-relaxed italic">{t.quote}</p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-[#0d1117] font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerStories;