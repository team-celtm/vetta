
"use client"
import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 mb-8">
          Error 404
        </div>

        {/* 404 */}
        <h1 className="text-8xl md:text-9xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
          404
        </h1>

        {/* Heading */}
        <h2 className="mt-6 text-3xl md:text-4xl font-bold">
          Page not found
        </h2>

        {/* Description */}
        <p className="mt-4 text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
          The page you&apos;re looking for doesn&apos;t exist, may have been moved,
          or the URL might be incorrect.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium"
          >
            <Home size={18} />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 transition"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Decorative Card */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-white/3 backdrop-blur-xl p-8">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Search className="text-blue-400" size={28} />
            </div>
          </div>

          <h3 className="text-xl font-semibold">
            Looking for something specific?
          </h3>

          <p className="text-slate-400 mt-3">
            Check the URL, return to the homepage, or continue exploring the
            Vetta Talent Intelligence platform.
          </p>
        </div>
      </div>
    </div>
  );
}

