"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function CreateUserPage() {
  const [form, setForm] = useState({
    adminEmail: "",
    adminPassword: "",
    email: "",
    password: "",
    full_name: "",
    role: "member",
    org_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showUserPass, setShowUserPass] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/orgs")
      .then((r) => r.json())
      .then((data) => setOrgs(data.orgs ?? []))
      .catch(() => {});
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Something went wrong",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "User created successfully",
      });

      setForm({
        adminEmail: "",
        adminPassword: "",
        email: "",
        password: "",
        full_name: "",
        role: "member",
        org_id: "",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    admin: "bg-red-500/15 text-red-400 border-red-500/30",
    manager: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    member: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    viewer: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  };

  return (
    <div className="relative min-h-screen overflow-y-auto bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb25,transparent_30%),radial-gradient(circle_at_bottom_right,#7c3aed25,transparent_30%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="border-b border-white/10 p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-blue-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                Admin Panel
              </div>

              <h1
                className="text-4xl font-extrabold text-white"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                Create User
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Add a new member to your organization
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 p-8">
              {/* ADMIN */}
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Admin Credentials
                </h2>

                <div className="space-y-4">
                  <Input
                    icon={<Mail size={18} />}
                    placeholder="Admin Email"
                    type="email"
                    value={form.adminEmail}
                    onChange={(v) => handleChange("adminEmail", v)}
                  />

                  <Input
                    icon={<Lock size={18} />}
                    placeholder="Admin Password"
                    type={showAdminPass ? "text" : "password"}
                    value={form.adminPassword}
                    onChange={(v) => handleChange("adminPassword", v)}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                      >
                        {showAdminPass ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    }
                  />
                </div>
              </section>

              {/* Divider */}
              <div className="h-px bg-white/10" />

              {/* USER */}
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  New User Details
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    icon={<User size={18} />}
                    placeholder="Full Name"
                    value={form.full_name}
                    onChange={(v) => handleChange("full_name", v)}
                  />

                  <Input
                    icon={<Mail size={18} />}
                    placeholder="User Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => handleChange("email", v)}
                  />

                  <Input
                    icon={<Lock size={18} />}
                    placeholder="Password"
                    type={showUserPass ? "text" : "password"}
                    value={form.password}
                    onChange={(v) => handleChange("password", v)}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowUserPass(!showUserPass)}
                      >
                        {showUserPass ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    }
                  />

                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <select
                      value={form.org_id}
                      onChange={(e) => handleChange("org_id", e.target.value)}
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-white outline-none focus:border-blue-500"
                    >
                      <option value="" disabled hidden>
                        Select Organisation
                      </option>

                      {orgs.map((org) => (
                        <option
                          key={org.id}
                          value={org.id}
                          className="bg-slate-900 text-white"
                        >
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative md:col-span-2">
                    <Shield
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <select
                      value={form.role}
                      onChange={(e) => handleChange("role", e.target.value)}
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-white outline-none focus:border-blue-500"
                    >
                      <option value="admin" className="bg-slate-900 text-white">
                        Admin
                      </option>

                      <option
                        value="manager"
                        className="bg-slate-900 text-white"
                      >
                        Manager
                      </option>

                      <option
                        value="member"
                        className="bg-slate-900 text-white"
                      >
                        Member
                      </option>

                      <option
                        value="viewer"
                        className="bg-slate-900 text-white"
                      >
                        Viewer
                      </option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${roleColors[form.role as keyof typeof roleColors]}`}
                  >
                    {form.role}
                  </span>
                </div>
              </section>

              {/* Message */}
              {message && (
                <div
                  className={`flex items-center gap-2 rounded-xl border p-4 ${
                    message.type === "success"
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  {message.text}
                </div>
              )}

              {/* Button */}
              <button
                disabled={loading}
                className="cursor-pointer h-14 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating User..." : "Create User"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

type InputProps = {
  icon: React.ReactNode;
  right?: React.ReactNode;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
};

function Input({
  icon,
  right,
  value,
  placeholder,
  type = "text",
  onChange,
}: InputProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        {icon}
      </div>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-12 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-500"
      />

      {right && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          {right}
        </div>
      )}
    </div>
  );
}
