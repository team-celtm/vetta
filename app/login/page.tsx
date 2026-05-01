
//app/login/page.tsx
"use client"
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError('');
      setIsLoading(true);

      // Client-side validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.email)) {
        setSubmitError('Please enter a valid email address.');
        setIsLoading(false);
        return;
      }
      if (value.password.length < 6) {
        setSubmitError('Password must be at least 6 characters.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // keepSignedIn can be sent to the API to adjust token TTL if needed
          body: JSON.stringify({ email: value.email, password: value.password, keepSignedIn }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Use the server's error message (e.g. "Invalid email or password.")
          setSubmitError(data.error ?? 'Something went wrong. Please try again.');
          return;
        }

        // Success — redirect to dashboard
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push('/dashboard');

      } catch {
        setSubmitError('Could not reach the server. Check your connection.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row font-sans">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1A35E8] px-6 md:px-10 lg:px-12 py-8 md:py-10 text-white">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-sm font-bold">
            V
          </div>
          <span className="text-lg font-bold tracking-widest uppercase">Vetta</span>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold leading-tight tracking-tight">
            Welcome back to your talent intelligence platform.
          </h1>
          <p className="text-sm md:text-base text-white/70 max-w-sm">
            Match the right people to the right roles — faster than ever. Your curated talent pool is waiting.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: '1,240+', label: 'Vetted professionals' },
            { value: '94%',    label: 'Placement success' },
            { value: '2.1s',   label: 'Match time' },
            { value: '240+',   label: 'Enterprise clients' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/10 px-4 py-3">
              <p className="text-xl md:text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs md:text-sm text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-1 flex-col justify-center bg-[#F5F2EC] px-5 sm:px-8 md:px-12 lg:px-16 py-10">

        <Link
          href="/"
          className="mb-6 md:mb-10 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors w-fit"
        >
          <span>←</span>
          <span>Back to home</span>
        </Link>

        {/* Heading */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Sign in to Vetta
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            Enter your corporate credentials to access the platform
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4 md:gap-5 w-full max-w-md"
        >
          {/* EMAIL */}
          <form.Field name="email">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">Work Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-[#1A35E8]/20 disabled:opacity-50"
                />
              </div>
            )}
          </form.Field>

          {/* PASSWORD */}
          <form.Field name="password">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-800">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-[#1A35E8]/20 disabled:opacity-50"
                />
              </div>
            )}
          </form.Field>

          {/* OPTIONS */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="h-4 w-4 accent-[#1A35E8]"
              />
              <span>Keep me signed in</span>
            </label>
            <a href="#" className="text-[#1A35E8] font-semibold hover:underline">
              Forgot password?
            </a>
          </div>

          {/* ERROR */}
          {submitError && (
            <p className="text-sm text-red-500">{submitError}</p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-xl bg-[#1A35E8] px-6 py-3 md:py-4 text-sm font-bold text-white hover:bg-[#1530cc] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {isLoading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;