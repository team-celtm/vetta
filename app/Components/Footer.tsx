"use client";

import React from "react";
import dayjs from "dayjs";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0A0F1C] text-gray-400">
      
      <div className="max-w-7xl mx-auto px-6 py-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* LEFT - Logo */}
          <div className="text-white font-semibold tracking-wide text-lg">
            VETTA
          </div>

         
        <div className="text-sm text-gray-400 text-center">
  © {dayjs().year()} Vetta Technologies Pvt. Ltd. · Precision Talent Intelligence
</div>

       
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms
            </a>
            <a href="#" className="hover:text-white transition">
              Contact
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;