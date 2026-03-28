"use client";

import React from "react";

const stats = [
  { value: "1,240+", label: "Pre-vetted professionals" },
  { value: "94%", label: "Placement success rate" },
  { value: "2.1s", label: "Avg. AI match time" },
  { value: "240+", label: "Enterprise clients" },
];

const Numbers: React.FC = () => {
  return (
    <div className="w-full bg-white px-4 sm:px-6 lg:px-8 py-10">
      
      <div
        className="
          max-w-6xl mx-auto
          grid grid-cols-2 md:grid-cols-4
          divide-y md:divide-y-0 md:divide-x divide-gray-200
        "
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="
              flex flex-col items-center justify-center
              py-6 md:py-0
              md:px-8
              text-center
            "
          >
            {/* VALUE */}
            <span
              className="
                text-[#1C3FFF]
                font-extrabold
                text-3xl sm:text-4xl md:text-5xl
                leading-none tracking-tight
              "
              style={{
                fontFamily:
                  "'Arial Black', 'Arial Bold', Arial, sans-serif",
              }}
            >
              {stat.value}
            </span>

            {/* LABEL */}
            <span className="text-gray-500 text-xs sm:text-sm mt-2 max-w-[140px] sm:max-w-none">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Numbers;