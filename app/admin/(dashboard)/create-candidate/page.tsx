"use client";

import { useState } from "react";
import {
  Mail,
  User,
  Building2,
  Phone,
  MapPin,
  Briefcase,
  Code,
  Globe,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

type Skill = { name: string; level: number };
type WorkHistory = { title: string; company: string; from: string; to: string | null; current: boolean };
type Certification = { name: string; issuer: string; year: number };

export default function CreateCandidatePage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    linkedin_url: "",
    city: "",
    country: "IN",
    remote_ok: true,
    availability: "open",
    years_exp: "0",
    current_title: "",
    current_company: "",
    is_active: true,
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [workHistory, setWorkHistory] = useState<WorkHistory[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [personality, setPersonality] = useState({
    data_driven: 0,
    communication: 0,
    bias_to_action: 0,
    team_player: 0,
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePersonalityChange = (key: string, value: number) => {
    setPersonality((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/create-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          years_exp: parseInt(form.years_exp) || 0,
          skills,
          work_history: workHistory,
          certifications,
          personality_scores: personality,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Something went wrong" });
        return;
      }

      setMessage({ type: "success", text: "Candidate created successfully" });

      setForm((prev) => ({
        ...prev,
        full_name: "",
        email: "",
        phone: "",
        linkedin_url: "",
        city: "",
        current_title: "",
        current_company: "",
      }));
      setSkills([]);
      setWorkHistory([]);
      setCertifications([]);
      setPersonality({ data_driven: 0, communication: 0, bias_to_action: 0, team_player: 0 });
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="border-b border-white/10 p-8">
        <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-syne)" }}>
          Create Candidate
        </h1>
        <p className="mt-2 text-sm text-gray-400">Add a new candidate directly to the database</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-8">
        {/* CANDIDATE BASIC */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Candidate Basic Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input icon={<User size={18} />} placeholder="Full Name" value={form.full_name} onChange={(v) => handleChange("full_name", v)} />
            <Input icon={<Mail size={18} />} placeholder="Email" type="email" value={form.email} onChange={(v) => handleChange("email", v)} />
            <Input icon={<Phone size={18} />} placeholder="Phone" value={form.phone} onChange={(v) => handleChange("phone", v)} />
            <Input icon={<Globe size={18} />} placeholder="LinkedIn URL" value={form.linkedin_url} onChange={(v) => handleChange("linkedin_url", v)} />
            <Input icon={<MapPin size={18} />} placeholder="City" value={form.city} onChange={(v) => handleChange("city", v)} />
            <Input icon={<Briefcase size={18} />} placeholder="Current Title" value={form.current_title} onChange={(v) => handleChange("current_title", v)} />
            <Input icon={<Building2 size={18} />} placeholder="Current Company" value={form.current_company} onChange={(v) => handleChange("current_company", v)} />
            
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-gray-400">Years of Experience</label>
              <input type="number" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" value={form.years_exp} onChange={(e) => handleChange("years_exp", e.target.value)} />
            </div>
            
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-gray-400">Availability</label>
              <select className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" value={form.availability} onChange={(e) => handleChange("availability", e.target.value)}>
                <option value="open">Open to offers</option>
                <option value="available-now">Available Now</option>
                <option value="available-2weeks">2 Weeks Notice</option>
                <option value="available-1month">1 Month+ Notice</option>
                <option value="not-looking">Not looking</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="remote_ok" checked={form.remote_ok} onChange={(e) => handleChange("remote_ok", e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500" />
              <label htmlFor="remote_ok" className="text-sm text-gray-300">Remote OK?</label>
            </div>
          </div>
        </section>
        
        <div className="h-px bg-white/10" />

        {/* DYNAMIC FORMS */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Structured Data</h2>
          
          <div className="space-y-8">
            {/* SKILLS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-300"><Code size={16} className="text-blue-400" /> Skills</label>
                <button type="button" onClick={() => setSkills([...skills, { name: "", level: 50 }])} className="cursor-pointer text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"><Plus size={14} /> Add Skill</button>
              </div>
              {skills.map((skill, index) => (
                <div key={index} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/10">
                  <input type="text" placeholder="Skill Name (e.g. React)" className="flex-1 rounded-lg bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/5" value={skill.name} onChange={(e) => { const newSkills = [...skills]; newSkills[index].name = e.target.value; setSkills(newSkills); }} />
                  <input type="number" placeholder="Level (0-100)" min="0" max="100" className="w-24 rounded-lg bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/5" value={skill.level} onChange={(e) => { const newSkills = [...skills]; newSkills[index].level = parseInt(e.target.value) || 0; setSkills(newSkills); }} />
                  <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== index))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            {/* WORK HISTORY */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-300"><FileText size={16} className="text-emerald-400" /> Work History</label>
                <button type="button" onClick={() => setWorkHistory([...workHistory, { title: "", company: "", from: "", to: "", current: false }])} className="cursor-pointer text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300"><Plus size={14} /> Add Job</button>
              </div>
              {workHistory.map((job, index) => (
                <div key={index} className="grid gap-2 bg-white/5 p-3 rounded-xl border border-white/10 relative">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Job Title" className="rounded-lg bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/5 border border-white/5" value={job.title} onChange={(e) => { const newWH = [...workHistory]; newWH[index].title = e.target.value; setWorkHistory(newWH); }} />
                    <input type="text" placeholder="Company" className="rounded-lg bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/5 border border-white/5" value={job.company} onChange={(e) => { const newWH = [...workHistory]; newWH[index].company = e.target.value; setWorkHistory(newWH); }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="From (YYYY-MM)" className="w-1/3 rounded-lg bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/5 border border-white/5" value={job.from} onChange={(e) => { const newWH = [...workHistory]; newWH[index].from = e.target.value; setWorkHistory(newWH); }} />
                    <input type="text" placeholder="To (YYYY-MM)" disabled={job.current} className="w-1/3 rounded-lg bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/5 border border-white/5 disabled:opacity-50" value={job.to || ""} onChange={(e) => { const newWH = [...workHistory]; newWH[index].to = e.target.value; setWorkHistory(newWH); }} />
                    <div className="flex items-center gap-2 px-2 flex-1">
                      <input type="checkbox" checked={job.current} onChange={(e) => { const newWH = [...workHistory]; newWH[index].current = e.target.checked; if(e.target.checked) newWH[index].to = null; setWorkHistory(newWH); }} />
                      <span className="text-xs text-gray-300">Current</span>
                    </div>
                    <button type="button" onClick={() => setWorkHistory(workHistory.filter((_, i) => i !== index))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* CERTIFICATIONS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-300"><Globe size={16} className="text-purple-400" /> Certifications</label>
                <button type="button" onClick={() => setCertifications([...certifications, { name: "", issuer: "", year: new Date().getFullYear() }])} className="cursor-pointer text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300"><Plus size={14} /> Add Cert</button>
              </div>
              {certifications.map((cert, index) => (
                <div key={index} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/10">
                  <input type="text" placeholder="Name" className="flex-1 rounded-lg bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/5" value={cert.name} onChange={(e) => { const newCerts = [...certifications]; newCerts[index].name = e.target.value; setCertifications(newCerts); }} />
                  <input type="text" placeholder="Issuer" className="flex-1 rounded-lg bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/5" value={cert.issuer} onChange={(e) => { const newCerts = [...certifications]; newCerts[index].issuer = e.target.value; setCertifications(newCerts); }} />
                  <input type="number" placeholder="Year" className="w-24 rounded-lg bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/5" value={cert.year} onChange={(e) => { const newCerts = [...certifications]; newCerts[index].year = parseInt(e.target.value) || 2024; setCertifications(newCerts); }} />
                  <button type="button" onClick={() => setCertifications(certifications.filter((_, i) => i !== index))} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            {/* PERSONALITY */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-300"><User size={16} className="text-pink-400" /> Personality Scores</label>
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                {Object.keys(personality).map((key) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400 capitalize">{key.replace(/_/g, " ")}</span>
                    <input type="number" min="0" max="100" className="w-20 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white focus:outline-none border border-white/10" value={personality[key as keyof typeof personality]} onChange={(e) => handlePersonalityChange(key, parseInt(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div className={`rounded-xl p-4 text-sm font-medium ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={loading} className="cursor-pointer w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Creating..." : "Create Candidate"}
        </button>
      </form>
    </div>
  );
}

interface InputProps {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  right?: React.ReactNode;
}

function Input({ icon, placeholder, type = "text", value, onChange, right }: InputProps) {
  return (
    <div className="relative flex items-center">
      <div className="pointer-events-none absolute left-4 text-gray-400">{icon}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:bg-white/10 focus:outline-none" />
      {right && <div className="absolute right-4">{right}</div>}
    </div>
  );
}
