import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:4000";

export default function App() {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [edit, setEdit] = useState(null); // {id, revision, firstName, lastName, email}

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
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setForm({ firstName: "", lastName: "", email: "" });
      await loadContacts(search);
      alert("Contact created ✅");
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  async function updateContact() {
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/contacts/${edit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: edit.firstName,
          lastName: edit.lastName,
          email: edit.email,
          revision: edit.revision
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setEdit(null);
      await loadContacts(search);
      alert("Contact updated ✅");
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  async function deleteContact(id) {
    if (!confirm("Delete this contact?")) return;
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/contacts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await loadContacts(search);
      alert("Contact deleted ✅");
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  return (
    <div style={{ fontFamily: "Arial", padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h2>Wix Contacts Dashboard (API Key)</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Search by first name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => loadContacts(search)} disabled={loading} style={{ padding: "8px 12px" }}>
          Search
        </button>
        <button onClick={() => { setSearch(""); loadContacts(""); }} disabled={loading} style={{ padding: "8px 12px" }}>
          Reset
        </button>
      </div>

      {err && <div style={{ background: "#ffe5e5", padding: 10, marginBottom: 12 }}>{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Create */}
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3>Add Contact</h3>
          <input
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <input
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <button onClick={createContact} disabled={!canSubmit} style={{ padding: "8px 12px" }}>
            Create
          </button>
        </div>

        {/* Edit */}
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3>Edit Contact</h3>
          {!edit ? (
            <div style={{ color: "#666" }}>Select a contact from the table to edit.</div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                id: {edit.id} | revision: {edit.revision}
              </div>
              <input
                placeholder="First name"
                value={edit.firstName}
                onChange={(e) => setEdit((p) => ({ ...p, firstName: e.target.value }))}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                placeholder="Last name"
                value={edit.lastName}
                onChange={(e) => setEdit((p) => ({ ...p, lastName: e.target.value }))}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                placeholder="Email"
                value={edit.email}
                onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={updateContact} style={{ padding: "8px 12px" }}>Save</button>
                <button onClick={() => setEdit(null)} style={{ padding: "8px 12px" }}>Cancel</button>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 style={{ marginTop: 16 }}>Contacts</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead>
            <tr style={{ background: "#f6f6f6" }}>
              <th align="left">First</th>
              <th align="left">Last</th>
              <th align="left">Email</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{c.firstName}</td>
                <td>{c.lastName}</td>
                <td>{c.email}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEdit({ ...c })}>Edit</button>
                  <button onClick={() => deleteContact(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan="4" style={{ color: "#666" }}>No contacts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
