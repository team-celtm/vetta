"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white  shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-md font-extrabold">
              V
            </div>
            <span className="text-xl font-extrabold tracking-wide">VETTA</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
            <Link href="#" className="hover:text-black transition">
              Platform
            </Link>
            <Link href="#" className="hover:text-black transition">
              How it Works
            </Link>
            <Link href="#" className="hover:text-black transition">
              Pricing
            </Link>
            <Link href="#" className="hover:text-black transition">
              Customers
            </Link>
          </div>

          {/* RIGHT - Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <button className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer">
                Sign In
              </button>
            </Link>
            <Link href="/login">
              <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Request Demo →
              </button>
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-4 bg-white border-t">
          <Link href="#" className="block text-gray-700">
            Platform
          </Link>
          <Link href="#" className="block text-gray-700">
            How it Works
          </Link>
          <Link href="#" className="block text-gray-700">
            Pricing
          </Link>
          <Link href="#" className="block text-gray-700">
            Customers
          </Link>

          <div className="flex flex-col gap-3 pt-2">
            <Link href="/login">
              <button className="w-full px-4 py-2 border rounded-lg">
                Sign In
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">
                Request Demo →
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
