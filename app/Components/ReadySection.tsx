"use client";

import React from "react";

const ReadySection: React.FC = () => {
  return (
    <div className="h-[70vh] bg-[#EEEEE9] flex items-center justify-center px-6 py-12">
      <div className="relative w-full max-w-4xl text-center bg-[#2C4EFF] rounded-4xl px-6 py-16 md:px-12 md:py-20 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -bottom-20 -left-16 w-75 h-75 bg-white/5 rounded-full pointer-events-none"></div>
        <div className="absolute -top-16 -right-10 w-55 h-55 bg-white/5 rounded-full pointer-events-none"></div>

        {/* Heading */}
        <h2
          className=" text-white font-extrabold 
          text-4xl md:text-5xl lg:text-6xl 
          leading-tight tracking-tight mb-4"
        >
          Ready to hire smarter?
        </h2>

        {/* Subtext */}
        <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8">
          Join 240+ companies using Vetta to find their perfect hires. No setup
          fees. No minimum contract.
        </p>

        {/* Button */}
        <a
          href="#"
          className="inline-block bg-white text-[#2C4EFF] font-semibold text-sm md:text-base
          px-8 py-4 rounded-full transition-all duration-200
          hover:bg-[#F0F0EC] hover:-translate-y-px"
        >
          Start Free — No Credit Card Needed
        </a>
      </div>
    </div>
  );
};

export default ReadySection;
