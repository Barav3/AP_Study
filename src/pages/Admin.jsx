import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  signInWithPassword,
  signOut,
  getSession,
  onAuthChange,
  fetchSubjects,
  upsertSubject,
} from "../lib/supabase.js";
import { AP_SUBJECTS, findSubject, isActiveSubjectId } from "../lib/subjects.js";

// Admin is the password-gated "upload portal". It lets the admin:
//   1. Sign in with Supabase email/password
//   2. Pick any AP subject slot
//   3. Assign a URL (v1) or bundle path (v1.1) to that slot
//   4. Override tile metadata (icon, color) per slot
//
// Everything writes through RLS; the anon key alone cannot upsert subjects.

export default function Admin() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setChecking(false);
    });
    const { data } = onAuthChange(setSession);
    return () => data?.subscription?.unsubscribe();
  }, []);

  if (checking) {
    return <div className="center-screen"><p>Checking session…</p></div>;
  }
  if (!session) return <LoginForm />;
  return <AdminPanel session={session} />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signInWithPassword(email, password);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center-screen">
      <form className="card" style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: 28, width: "min(420px, 92vw)",
        textAlign: "left",
      }} onSubmit={submit}>
        <h1 style={{ marginTop: 0 }}>Admin sign in</h1>
        <p className="note" style={{ color: "var(--text-dim)", fontSize: 13 }}>
          Uploads are locked to the admin account. Use the email/password you set in Supabase Auth.
        </p>
        <div style={{ marginTop: 16 }}>
          <label className="label">Email</label>
          <input
            className="input" type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="label">Password</label>
          <input
            className="input" type="password" required autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && (
          <div style={{ color: "var(--danger)", marginTop: 10, fontSize: 13 }}>{err}</div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "space-between" }}>
          <Link to="/" className="btn">← Hub</Link>
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminPanel({ session }) {
  const [remote, setRemote] = useState([]);
  const [selectedId, setSelectedId] = useState(AP_SUBJECTS[0].id);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const reload = () => fetchSubjects().then(setRemote).catch((e) => setStatus({ type: "err", msg: e.message }));

  useEffect(() => { reload(); }, []);

  const merged = useMemo(() => {
    // Local list is the gate — commented-out subjects never appear in admin
    // dropdown, even if they exist in Supabase.
    const byId = new Map(AP_SUBJECTS.map((s) => [s.id, { ...s }]));
    for (const r of remote) {
      if (!isActiveSubjectId(r.id)) continue;
      const prev = byId.get(r.id) || {};
      byId.set(r.id, { ...prev, ...r });
    }
    return Array.from(byId.values());
  }, [remote]);

  const selected = merged.find((s) => s.id === selectedId) || findSubject(selectedId);

  const [draft, setDraft] = useState(selected);
  useEffect(() => { setDraft(selected); }, [selectedId, remote]);

  const save = async () => {
    if (!draft) return;
    setBusy(true); setStatus(null);
    try {
      await upsertSubject({
        id: draft.id,
        name: draft.name,
        icon: draft.icon,
        color: draft.color,
        description: draft.description || null,
        category: draft.category,
        deploy_mode: draft.deploy_url ? "url" : (draft.bundle_path ? "bundle" : null),
        deploy_url: draft.deploy_url || null,
        bundle_path: draft.bundle_path || null,
      });
      await reload();
      setStatus({ type: "ok", msg: "Saved." });
    } catch (e) {
      setStatus({ type: "err", msg: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  };

  const clearSlot = async () => {
    setDraft((d) => ({ ...d, deploy_url: "", bundle_path: "" }));
  };

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="admin">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin</h1>
          <p className="note">Signed in as {session.user?.email}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/" className="btn">← Hub</Link>
          <button className="btn" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <div className="card">
        <div className="row">
          <label className="label">Subject slot</label>
          <select
            className="select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {merged.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {(s.deploy_url || s.bundle_path) ? "  •  LIVE" : ""}
              </option>
            ))}
          </select>
        </div>

        {draft && (
          <>
            <div className="preview-tile" style={{ "--tile-color": draft.color }}>
              <span className="icon">{draft.icon}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{draft.name}</div>
                <div style={{ fontSize: 11, opacity: .85, textTransform: "uppercase", letterSpacing: ".1em" }}>
                  {draft.category}
                </div>
              </div>
            </div>

            <div className="row row-2" style={{ marginTop: 18 }}>
              <div>
                <label className="label">Icon (emoji)</label>
                <input className="input" value={draft.icon || ""} onChange={(e) => update({ icon: e.target.value })} />
              </div>
              <div>
                <label className="label">Tile color (hex)</label>
                <input className="input" value={draft.color || ""} onChange={(e) => update({ color: e.target.value })} />
              </div>
            </div>

            <div className="row">
              <label className="label">Display name</label>
              <input className="input" value={draft.name || ""} onChange={(e) => update({ name: e.target.value })} />
            </div>

            <div className="row">
              <label className="label">Description</label>
              <textarea className="textarea" value={draft.description || ""} onChange={(e) => update({ description: e.target.value })} />
            </div>

            <div className="row">
              <label className="label">Deployed app URL (v1)</label>
              <input
                className="input"
                placeholder="https://my-study-app.vercel.app"
                value={draft.deploy_url || ""}
                onChange={(e) => update({ deploy_url: e.target.value })}
              />
              <p className="note">
                Paste the URL of any deployed app. It loads in a sandboxed iframe when users enter this subject.
                Bundle uploads will arrive in a future version.
              </p>
            </div>

            <div className="actions">
              <button className="btn primary" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save slot"}
              </button>
              <button className="btn" onClick={clearSlot} disabled={busy}>
                Clear deploy
              </button>
              <Link to={`/s/${draft.id}`} className="btn">Preview ↗</Link>
            </div>

            {status && (
              <div style={{
                marginTop: 14, fontSize: 13,
                color: status.type === "ok" ? "var(--ok)" : "var(--danger)",
              }}>{status.msg}</div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Need help?</h3>
        <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginTop: 0 }}>
          The <Link to="/guide">Guide</Link> walks through deploying a mini-app,
          pasting its URL into a slot, and troubleshooting iframe embedding issues.
        </p>
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: "pointer", color: "var(--text-dim)" }}>
            First-time hub setup (Supabase)
          </summary>
          <ol style={{ color: "var(--text-dim)", lineHeight: 1.7, marginTop: 8 }}>
            <li>Create a Supabase project. Run <code>supabase/schema.sql</code> in the SQL editor.</li>
            <li>In Auth → Users, create yourself an email/password user (this is the admin).</li>
            <li>Copy <code>.env.example</code> → <code>.env</code> and fill in the URL + anon key. On Vercel, add the same two env vars in Project Settings.</li>
            <li>Come back here, sign in, and point a slot at any deployed app URL.</li>
          </ol>
        </details>
      </div>
    </div>
  );
}
