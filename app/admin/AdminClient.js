"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL, CONFIG } from "../config";
import "./admin.css";

const TOKEN_KEY = "wedding_admin_token";

async function adminFetch(path, token, options = {}) {
  const res = await fetch(`${API_URL}/api/admin/${path}`, {
    ...options,
    headers: { Accept: "application/json", "X-Admin-Token": token },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error("failed");
  return res;
}

const when = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

export default function AdminClient() {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [updated, setUpdated] = useState(null);

  // The site's layout locks scrolling for the opening cover; this page must scroll.
  useEffect(() => {
    document.body.classList.remove("locked");
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  const load = useCallback(async (t) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("messages", t);
      setMessages(await res.json());
      setUpdated(new Date());
      sessionStorage.setItem(TOKEN_KEY, t);
      setToken(t);
    } catch (e) {
      if (e.message === "unauthorized") {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken("");
        setError("That token wasn't accepted.");
      } else {
        setError("Could not reach the API. Check that it is running and that CORS allows this site.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load when a token exists, then refresh every minute
  useEffect(() => {
    if (!token) return;
    load(token);
    const id = setInterval(() => load(token), 60000);
    return () => clearInterval(id);
  }, [token, load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? messages.filter((m) => `${m.name} ${m.message}`.toLowerCase().includes(q)) : messages;
  }, [messages, query]);

  async function confirmDelete() {
    try {
      await adminFetch(`messages/${toDelete.id}`, token, { method: "DELETE" });
      setMessages((list) => list.filter((m) => m.id !== toDelete.id));
      setToDelete(null);
    } catch {
      setToDelete(null);
      setError("Could not delete that message. Please try again.");
    }
  }

  async function exportCsv() {
    try {
      const res = await adminFetch("messages/export", token);
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "messages.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    }
  }

  function signOut() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setMessages([]);
    setInput("");
  }

  // ---------- Sign in ----------
  if (!token) {
    return (
      <div className="adm">
        <div className="adm-login">
          <h1>Admin</h1>
          <p className="muted">Enter your admin token to read the messages.</p>
          <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) load(input.trim()); }}>
            <input type="password" placeholder="Admin token" value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
            {error && <div className="adm-err" role="alert">{error}</div>}
            <button className="btn" type="submit" disabled={loading}>{loading ? "Checking…" : "Sign in"}</button>
          </form>
        </div>
      </div>
    );
  }

  // ---------- Messages ----------
  return (
    <div className="adm">
      <div className="adm-top">
        <div>
          <h1>Messages for the couple</h1>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
            {CONFIG.partner1} &amp; {CONFIG.partner2}
            {updated && ` · updated ${updated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
        <div className="adm-actions">
          <button className="btn ghost" onClick={() => load(token)} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
          <button className="btn ghost" onClick={exportCsv}>Export CSV</button>
          <button className="btn ghost" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {error && <div className="adm-err" role="alert">{error}</div>}

      <div className="tools">
        <div className="stat"><b>{messages.length}</b><span>{messages.length === 1 ? "Message" : "Messages"}</span></div>
        <input className="search" placeholder="Search by name or message" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {shown.map((m) => (
        <div className="mcard" key={m.id}>
          <div className="mhead">
            <b>{m.name}</b>
            <small>{when(m.created_at)}</small>
          </div>
          <p className="mtext">{m.message}</p>
          <button className="linkbtn" onClick={() => setToDelete(m)}>Delete</button>
        </div>
      ))}

      {shown.length === 0 && (
        <div className="empty">
          {messages.length === 0 ? "No messages yet. They will appear here as guests send them." : "No messages match your search."}
        </div>
      )}

      {/* Delete confirmation */}
      {toDelete && (
        <div className="overlay modal" role="dialog" aria-modal="true" aria-labelledby="delTitle"
             onClick={(e) => { if (e.target === e.currentTarget) setToDelete(null); }}>
          <div className="box confirm">
            <h2 id="delTitle" style={{ fontSize: 28 }}>Delete this message?</h2>
            <p className="muted">From {toDelete.name}. This can&rsquo;t be undone.</p>
            <div className="adm-actions" style={{ justifyContent: "center" }}>
              <button className="btn" onClick={confirmDelete}>Delete</button>
              <button className="btn ghost" onClick={() => setToDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
