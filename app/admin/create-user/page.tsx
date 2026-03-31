"use client";

import { useState } from "react";

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
  const [message, setMessage] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

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
        setMessage(data.error);
        return;
      }

      setMessage("✅ User created successfully");

    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Admin Create User</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <h2 className="font-semibold">Admin Credentials</h2>

        <input
          placeholder="Admin Email"
          value={form.adminEmail}
          onChange={(e) => handleChange("adminEmail", e.target.value)}
          className="border p-3 rounded"
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={form.adminPassword}
          onChange={(e) => handleChange("adminPassword", e.target.value)}
          className="border p-3 rounded"
        />

        <hr />

        <h2 className="font-semibold">New User</h2>

        <input
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) => handleChange("full_name", e.target.value)}
          className="border p-3 rounded"
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="border p-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className="border p-3 rounded"
        />

        <input
          placeholder="Org ID"
          value={form.org_id}
          onChange={(e) => handleChange("org_id", e.target.value)}
          className="border p-3 rounded"
        />

        <select
          value={form.role}
          onChange={(e) => handleChange("role", e.target.value)}
          className="border p-3 rounded"
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>

        <button
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded"
        >
          {loading ? "Creating..." : "Create User"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}