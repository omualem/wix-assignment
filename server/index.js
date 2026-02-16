import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Debug: log incoming requests to /api/contacts so we can see if client calls reach server
app.use((req, res, next) => {
  if (req.path && req.path.startsWith("/api/contacts")) {
    try {
      console.log(`--> ${req.method} ${req.path}`, Object.keys(req.body || {}).length ? req.body : "(no body)");
    } catch (e) {
      console.log(`--> ${req.method} ${req.path}`);
    }
  }
  next();
});

const WIX_BASE = "https://www.wixapis.com";
const apiKey = process.env.WIX_API_KEY;
if (!apiKey) {
  console.warn("Warning: WIX_API_KEY not set in environment. Set it in .env before running.");
}

function wixHeaders() {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.WIX_API_KEY}`,
    "wix-account-id": process.env.WIX_ACCOUNT_ID,
    "wix-site-id": process.env.WIX_SITE_ID
  };
  return headers;
}

async function wixFetch(path, options = {}) {
  const res = await fetch(`${WIX_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...wixHeaders()
    }
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch (e) {
    json = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(json?.message || `Wix API error: ${res.status}`);
    err.details = json;
    err.status = res.status;
    throw err;
  }

  return json;
}

// Normalize different possible Wix contact shapes to a simple item used by the frontend
function normalizeRawItem(item) {
  const c = item?.contact || item || {};
  const id = c._id || c.id || c.contactId || undefined;
  const revision = c.revision || c?.contact?.revision || c.revisionNumber || undefined;
  const firstName = c.info?.name?.first || c.info?.name?.firstName || c.primaryInfo?.firstName || "";
  const lastName = c.info?.name?.last || c.info?.name?.lastName || "";
  const email = c.primaryEmail?.email || c.info?.emails?.items?.[0]?.email || c.primaryInfo?.email || "";
  return { id, revision, firstName: firstName || "", lastName: lastName || "", email: email || "", raw: c };
}

// Health and root
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("Wix Contacts proxy — use /api/contacts"));

/**
 * GET /api/contacts?search=yo
 * Uses Wix REST POST /contacts/v4/contacts/query to fetch contacts,
 * then filters locally by first name (safe and simple).
 */
app.get("/api/contacts", async (req, res) => {
  try {
    const search = (req.query.search || "").trim().toLowerCase();

    // ── DEBUG: verify env vars & headers ──
    console.log("[GET /api/contacts] ENV  WIX_SITE_ID   =", process.env.WIX_SITE_ID);
    console.log("[GET /api/contacts] ENV  WIX_ACCOUNT_ID=", process.env.WIX_ACCOUNT_ID);
    console.log("[GET /api/contacts] ENV  WIX_API_KEY   =", process.env.WIX_API_KEY ? "<set>" : "<NOT SET>");
    const headersUsed = wixHeaders();
    console.log("[GET /api/contacts] Headers sent:", {
      "wix-site-id": headersUsed["wix-site-id"],
      "wix-account-id": headersUsed["wix-account-id"],
      Authorization: headersUsed.Authorization ? headersUsed.Authorization.slice(0, 20) + "..." : "<missing>"
    });

    // Wix Contacts v4 expects "paging", NOT "pagination"
    const body = { paging: { limit: 50 } };
    const wixRes = await wixFetch(`/contacts/v4/contacts/query`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    // ── DEBUG: log the full raw Wix response ──
    console.log("[GET /api/contacts] Raw Wix response keys:", Object.keys(wixRes || {}));
    console.log("[GET /api/contacts] Raw Wix response:", JSON.stringify(wixRes, null, 2));

    // Wix Contacts v4 returns data under "contacts", NOT "items"
    const rawContacts = wixRes?.contacts || wixRes?.items || [];
    console.log("[GET /api/contacts] Contacts found:", rawContacts.length);
    if (rawContacts.length > 0) {
      console.log("[GET /api/contacts] Sample contact:", JSON.stringify(rawContacts[0]));
    }

    const items = rawContacts.map(normalizeRawItem);

    const filtered = search
      ? items.filter((it) => (it.firstName || "").toLowerCase().includes(search))
      : items;

    res.json({ items: filtered });
  } catch (err) {
    console.error("GET /api/contacts error:", err);
    res.status(500).json({ error: err.message || "Server error", details: err.details || undefined });
  }
});

/**
 * POST /api/contacts
 * body: { firstName, lastName, email }
 */
app.post("/api/contacts", async (req, res) => {
  try {
    const { firstName = "", lastName = "", email = "" } = req.body || {};
    if (!email && !firstName && !lastName) {
      return res.status(400).json({ error: "At least one of name/email is required." });
    }

    const payload = {
      info: {
        name: { first: firstName, last: lastName },
        emails: email ? { items: [{ email }] } : undefined
      }
    };

    console.log('Calling Wix create contact with payload:', payload);
    const created = await wixFetch(`/contacts/v4/contacts`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    console.log('Wix create response:', created);

    // Normalize the created contact (Wix may wrap under `contact`)
    const item = normalizeRawItem(created.contact || created);
    return res.json({ id: item.id, revision: item.revision, item });
  } catch (err) {
    console.error("POST /api/contacts error:", err);
    res.status(500).json({ error: err.message || "Server error", details: err.details || undefined });
  }
});

/**
 * PATCH /api/contacts/:id
 * body: { firstName, lastName, email, revision }
 */
app.patch("/api/contacts/:id", async (req, res) => {
  try {
    const contactId = req.params.id;
    const { firstName = "", lastName = "", email = "", revision } = req.body || {};
    if (revision === undefined || revision === null) {
      return res.status(400).json({ error: "Missing revision." });
    }

    const payload = {
      info: {
        name: { first: firstName, last: lastName },
        emails: email ? { items: [{ email }] } : undefined
      }
    };

    // Wix expects revision as query param for optimistic concurrency
    const updated = await wixFetch(`/contacts/v4/contacts/${contactId}?revision=${revision}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    res.json({ id: updated._id, revision: updated.revision });
  } catch (err) {
    console.error("PATCH /api/contacts/:id error:", err);
    res.status(500).json({ error: err.message || "Server error", details: err.details || undefined });
  }
});

/**
 * DELETE /api/contacts/:id
 */
app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const contactId = req.params.id;
    await wixFetch(`/contacts/v4/contacts/${contactId}`, { method: "DELETE" });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/contacts/:id error:", err);
    res.status(500).json({ error: err.message || "Server error", details: err.details || undefined });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
