"use client";

import { useState } from "react";
import { Building2, Globe, CheckCircle, AlertCircle } from "lucide-react";

export default function CreateOrgPage() {
  const [form, setForm] = useState({
    name: "",
    domain: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/create-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Something went wrong" });
        return;
      }

      setMessage({ type: "success", text: "Organization created successfully" });
      setForm({ name: "", domain: "" });
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-2xl mx-auto">
      <div className="border-b border-white/10 p-8">
        <h1 className="text-4xl font-extrabold text-white" style={{ fontFamily: "var(--font-syne)" }}>
          Create Organization
        </h1>
        <p className="mt-2 text-sm text-gray-400">Add a new organization to the platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-8">
        <section>
          <div className="grid gap-4">
            <Input
              icon={<Building2 size={18} />}
              placeholder="Organization Name"
              value={form.name}
              onChange={(v) => handleChange("name", v)}
            />

            <Input
              icon={<Globe size={18} />}
              placeholder="Domain (Optional)"
              value={form.domain}
              onChange={(v) => handleChange("domain", v)}
            />
          </div>
        </section>

        {message && (
          <div className={`flex items-center gap-2 rounded-xl border p-4 ${message.type === "success" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
            {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <button
          disabled={loading}
          className="cursor-pointer h-14 w-full rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating Org..." : "Create Organization"}
        </button>
      </form>
    </div>
  );
}

function Input({
  icon,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-500"
      />
    </div>
  );
}
