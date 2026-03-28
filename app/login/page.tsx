"use client"
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError('');

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.email)) {
        setSubmitError('Please enter a valid email address.');
        return;
      }

      // Password validation (min 6 chars)
      if (value.password.length < 6) {
        setSubmitError('Password must be at least 6 characters.');
        return;
      }

      // Simulate auth — replace with real API call
      console.log('Logging in:', value);
      router.push('/dashboard');
    },
  });

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* Left Panel - Blue */}
      <div className="relative flex w-[50%] flex-col justify-between bg-[#1A35E8] px-12 py-10 text-white">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-sm font-bold text-white">
            V
          </div>
          <span className="text-lg font-bold tracking-widest uppercase">Vetta</span>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-6">
          <h1 className="text-[4rem] font-extrabold leading-[1.05] tracking-tight">
            Welcome back to your talent intelligence platform.
          </h1>
          <p className="text-base font-normal text-white/70 max-w-sm">
            Match the right people to the right roles — faster than ever. Your curated talent pool is waiting.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: '1,240+', label: 'Vetted professionals' },
            { value: '94%', label: 'Placement success' },
            { value: '2.1s', label: 'Match time' },
            { value: '240+', label: 'Enterprise clients' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/10 px-5 py-4">
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="mt-0.5 text-sm text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Cream */}
      <div className="flex flex-1 flex-col justify-center bg-[#F5F2EC] px-16">
        <Link
          href="/"
          className="mb-10 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors w-fit"
        >
          <span className="text-base">←</span>
          <span>Back to home</span>
        </Link>

        <div className="mb-8">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Sign in to Vetta</h2>
          <p className="mt-2 text-sm text-gray-500">Enter your corporate credentials to access the platform</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-5 max-w-md"
        >
          {/* Work Email */}
          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) => {
                if (!value) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Enter a valid email address';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-gray-800">
                  Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:ring-2 focus:ring-[#1A35E8]/20 ${
                    field.state.meta.errors.length > 0
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-200 focus:border-[#1A35E8]'
                  }`}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Password */}
          <form.Field
            name="password"
            validators={{
              onBlur: ({ value }) => {
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Password must be at least 6 characters';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-800">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:ring-2 focus:ring-[#1A35E8]/20 ${
                    field.state.meta.errors.length > 0
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-200 focus:border-[#1A35E8]'
                  }`}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Keep signed in + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#1A35E8]"
              />
              <span className="text-sm text-gray-700">Keep me signed in</span>
            </label>
            <a href="#" className="text-sm font-semibold text-[#1A35E8] hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Global submit error */}
          {submitError && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
              {submitError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A35E8] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#1530cc] active:scale-[0.99]"
          >
            Sign In <span className="text-base">→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;