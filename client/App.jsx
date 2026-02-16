import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:4000";

export default function App() {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [edit, setEdit] = useState(null);

  const canSubmit = useMemo(() => {
    return Boolean(form.email || form.firstName || form.lastName);
  }, [form]);

  async function loadContacts(q = "") {
    setLoading(true);
    setErr("");
    try {
      const url = new URL(`${API_BASE}/api/contacts`);
      if (q) url.searchParams.set("search", q);
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load contacts");
      setContacts(data.items || []);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts("");
  }, []);

  async function createContact() {
    try {
      const res = await fetch(`${API_BASE}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setForm({ firstName: "", lastName: "", email: "" });
      // Directly add the new contact to the local list to avoid waiting for eventual consistency
      if (data.item) {
        setContacts(prev => [data.item, ...prev]);
      }
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  async function updateContact() {
    try {
      const res = await fetch(`${API_BASE}/api/contacts/${edit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setEdit(null);
      await loadContacts(search);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  async function deleteContact(id) {
    if (!confirm("Delete this contact?")) return;
    try {
      await fetch(`${API_BASE}/api/contacts/${id}`, { method: "DELETE" });
      await loadContacts(search);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ background: "linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 30%, #a78bfa 60%, #8b5cf6 100%)" }}>

      {/* Centered card — login-page style */}
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-violet-900 tracking-tight">Wix Contacts Dashboard</h1>
          <p className="text-violet-700/70 text-base">Manage contacts securely via server-side API Key</p>
        </div>

        {/* Error */}
        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
            <span>{err}</span>
            <button onClick={() => setErr("")} className="text-red-400 hover:text-red-600 ml-3 text-lg font-bold">×</button>
          </div>
        )}

        {/* Search Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-violet-200/50 p-6">
          <div className="flex gap-3">
            <input
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/80 border border-violet-200 text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
              placeholder="Search by first name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadContacts(search)}
            />
            <button
              onClick={() => loadContacts(search)}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition shadow-md shadow-violet-300/30"
            >
              Search
            </button>
          </div>
        </div>

        {/* Add Contact Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-violet-200/50 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-violet-900">Add Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="px-4 py-2.5 rounded-xl bg-white/80 border border-violet-200 text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))}
            />
            <input
              className="px-4 py-2.5 rounded-xl bg-white/80 border border-violet-200 text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))}
            />
            <input
              className="px-4 py-2.5 rounded-xl bg-white/80 border border-violet-200 text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          <button
            onClick={createContact}
            disabled={!canSubmit}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium transition shadow-md shadow-violet-300/30"
          >
            Create Contact
          </button>
        </div>

        {/* Edit Contact Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-violet-200/50 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-violet-900">Edit Contact</h2>
          {!edit ? (
            <p className="text-violet-400 text-sm">Select a contact from the table to edit.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  className="px-4 py-2.5 rounded-xl bg-white/80 border border-violet-200 text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
                  value={edit.firstName}
                  onChange={(e) => setEdit(p => ({ ...p, firstName: e.target.value }))}
                />
                <input
                  className="px-4 py-2.5 rounded-xl bg-white/80 border border-violet-200 text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
                  value={edit.lastName}
                  onChange={(e) => setEdit(p => ({ ...p, lastName: e.target.value }))}
                />
                <input
                  className="px-4 py-2.5 rounded-xl bg-white/80 border border-violet-200 text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
                  value={edit.email}
                  onChange={(e) => setEdit(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={updateContact}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-medium transition shadow-md shadow-violet-300/30"
                >
                  Save
                </button>
                <button
                  onClick={() => setEdit(null)}
                  className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-700 py-2.5 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        {/* Contacts Table Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-violet-200/50 p-6">
          <h2 className="text-lg font-semibold text-violet-900 mb-4">
            Contacts {!loading && <span className="text-violet-400 font-normal text-sm">({contacts.length})</span>}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-violet-200 text-violet-500 uppercase text-xs tracking-wider">
                  <th className="py-3 pr-4">First</th>
                  <th className="py-3 pr-4">Last</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-violet-400">Loading...</td>
                  </tr>
                )}
                {!loading && contacts.map(c => (
                  <tr key={c.id} className="border-b border-violet-100 hover:bg-violet-50/50 transition">
                    <td className="py-3 pr-4 text-violet-900 font-medium">{c.firstName || "—"}</td>
                    <td className="py-3 pr-4 text-violet-800">{c.lastName || "—"}</td>
                    <td className="py-3 pr-4 text-violet-600">{c.email || <span className="text-violet-300 italic">No email</span>}</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => setEdit({ ...c })}
                        className="bg-violet-500 hover:bg-violet-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteContact(c.id)}
                        className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && contacts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-violet-400 py-8 text-center text-sm">
                      No contacts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-violet-500/60 pb-4">
          Powered by Wix API · {contacts.length} contact{contacts.length !== 1 ? "s" : ""} loaded
        </div>

      </div>
    </div>
  );
}
