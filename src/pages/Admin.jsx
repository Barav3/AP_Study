import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  signInWithPassword,
  signOut,
  getSession,
  onAuthChange,
  fetchActivities,
  upsertActivity,
  deleteActivity,
} from "../lib/supabase.js";
import { AP_SUBJECTS } from "../lib/subjects.js";

// Admin is the password-gated upload portal. It lets the admin:
//   1. Sign in with Supabase email/password
//   2. Pick any AP subject (folder)
//   3. Add, edit, and remove activities (mini-apps) inside that subject
//   4. For each activity, choose URL or inline HTML deploy

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

  if (checking) return <div className="center-screen"><p>Checking session…</p></div>;
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
    setErr(null); setBusy(true);
    try { await signInWithPassword(email, password); }
    catch (e) { setErr(e.message || String(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="center-screen">
      <form className="card" style={{ padding: 28, width: "min(420px, 92vw)", textAlign: "left" }} onSubmit={submit}>
        <h1 style={{ marginTop: 0 }}>Admin sign in</h1>
        <p className="note" style={{ color: "var(--text-dim)", fontSize: 13 }}>
          Uploads are locked to the admin account. Use the email/password you set in Supabase Auth.
        </p>
        <div style={{ marginTop: 16 }}>
          <label className="label">Email</label>
          <input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="label">Password</label>
          <input className="input" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {err && <div style={{ color: "var(--danger)", marginTop: 10, fontSize: 13 }}>{err}</div>}
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
  const [subjectId, setSubjectId] = useState(AP_SUBJECTS[0].id);
  const [activities, setActivities] = useState([]);
  const [editing, setEditing] = useState(null); // activity draft or null
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const subject = useMemo(
    () => AP_SUBJECTS.find((s) => s.id === subjectId),
    [subjectId]
  );

  const reload = () => {
    fetchActivities(subjectId)
      .then(setActivities)
      .catch((e) => setStatus({ type: "err", msg: e.message }));
  };

  useEffect(() => {
    reload();
    setEditing(null);
    setStatus(null);
  }, [subjectId]);

  const startNew = () => {
    const base = (subject?.id || "activity") + "-" + Date.now().toString(36);
    setEditing({
      id: base,
      subject_id: subjectId,
      name: "",
      icon: "🎯",
      description: "",
      deploy_mode: "inline",
      deploy_url: "",
      inline_html: "",
      sort_order: activities.length,
    });
    setStatus(null);
  };

  const startEdit = (a) => { setEditing({ ...a }); setStatus(null); };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { setStatus({ type: "err", msg: "Activity name is required." }); return; }
    setBusy(true); setStatus(null);
    try {
      const payload = {
        id: editing.id,
        subject_id: subjectId,
        name: editing.name.trim(),
        icon: editing.icon || null,
        description: editing.description || null,
        deploy_mode: null,
        deploy_url: null,
        inline_html: null,
        sort_order: editing.sort_order ?? 0,
      };
      if (editing.deploy_mode === "url" && editing.deploy_url) {
        payload.deploy_mode = "url";
        payload.deploy_url = editing.deploy_url;
      } else if (editing.deploy_mode === "inline" && editing.inline_html) {
        payload.deploy_mode = "inline";
        payload.inline_html = editing.inline_html;
      }
      await upsertActivity(payload);
      setStatus({ type: "ok", msg: "Saved." });
      setEditing(null);
      reload();
    } catch (e) {
      setStatus({ type: "err", msg: e.message || String(e) });
    } finally { setBusy(false); }
  };

  const remove = async (a) => {
    if (!confirm(`Delete "${a.name}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      await deleteActivity(a.id);
      setStatus({ type: "ok", msg: "Deleted." });
      reload();
    } catch (e) {
      setStatus({ type: "err", msg: e.message || String(e) });
    } finally { setBusy(false); }
  };

  const update = (patch) => setEditing((d) => ({ ...d, ...patch }));

  const onFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: "err", msg: "File too big (max 2 MB)." }); return;
    }
    const text = await file.text();
    update({ inline_html: text });
    setStatus({ type: "ok", msg: `Loaded ${file.name} (${Math.round(file.size / 1024)} KB). Click Save to publish.` });
  };

  return (
    <div className="admin">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin</h1>
          <p className="note">Signed in as {session.user?.email}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/guide" className="btn">Guide</Link>
          <Link to="/" className="btn">← Hub</Link>
          <button className="btn" onClick={signOut}>Sign out</button>
        </div>
      </header>

      {/* Subject picker */}
      <div className="card">
        <div className="row">
          <label className="label">Subject folder</label>
          <select className="select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {AP_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
            ))}
          </select>
        </div>
        <p className="note" style={{ marginTop: 4 }}>
          Each subject is a folder that holds multiple mini-apps (activities).
          Pick a subject above, then add or edit its activities below.
        </p>
      </div>

      {/* Activity list for selected subject */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>Activities in {subject?.name}</h3>
          <button className="btn primary" onClick={startNew} disabled={busy || !!editing}>
            + New activity
          </button>
        </div>
        {activities.length === 0 ? (
          <p className="note">No activities yet. Click "+ New activity" to add one.</p>
        ) : (
          <ul className="activity-list">
            {activities.map((a) => (
              <li key={a.id} className="activity-list-item">
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: 22 }} aria-hidden>{a.icon || "🎯"}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <div className="note" style={{ fontSize: 12 }}>
                      {a.deploy_mode === "url"    && <>URL · <code>{a.deploy_url}</code></>}
                      {a.deploy_mode === "inline" && <>Inline HTML · {((a.inline_html || "").length / 1024).toFixed(1)} KB</>}
                      {!a.deploy_mode             && <>No deploy configured</>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={`/s/${subjectId}/a/${a.id}`} className="btn">Preview ↗</Link>
                  <button className="btn" onClick={() => startEdit(a)} disabled={busy || !!editing}>Edit</button>
                  <button className="btn" onClick={() => remove(a)} disabled={busy} style={{ color: "var(--danger)" }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Editor panel (shown when creating or editing) */}
      {editing && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{activities.find((a) => a.id === editing.id) ? "Edit activity" : "New activity"}</h3>

          <div className="row row-2">
            <div>
              <label className="label">Icon (emoji)</label>
              <input className="input" value={editing.icon || ""} onChange={(e) => update({ icon: e.target.value })} placeholder="🎯" />
            </div>
            <div>
              <label className="label">Display name</label>
              <input className="input" value={editing.name} onChange={(e) => update({ name: e.target.value })} placeholder="Practice Tests" />
            </div>
          </div>

          <div className="row">
            <label className="label">Description (optional)</label>
            <input className="input" value={editing.description || ""} onChange={(e) => update({ description: e.target.value })} placeholder="Full AP-format practice exams" />
          </div>

          <div className="row">
            <label className="label">Deploy source</label>
            <div className="mode-tabs">
              <button type="button" className={`chip ${editing.deploy_mode === "url" ? "active" : ""}`} onClick={() => update({ deploy_mode: "url" })}>
                🌐 Hosted URL
              </button>
              <button type="button" className={`chip ${editing.deploy_mode === "inline" ? "active" : ""}`} onClick={() => update({ deploy_mode: "inline" })}>
                📝 Paste / upload HTML
              </button>
            </div>
          </div>

          {editing.deploy_mode === "url" && (
            <div className="row">
              <label className="label">Deployed app URL</label>
              <input className="input" placeholder="https://my-study-app.vercel.app" value={editing.deploy_url || ""} onChange={(e) => update({ deploy_url: e.target.value })} />
              <p className="note">The activity loads this URL in a sandboxed iframe.</p>
            </div>
          )}

          {editing.deploy_mode === "inline" && (
            <>
              <div className="row">
                <label className="label">Upload an .html file</label>
                <input type="file" accept=".html,text/html" className="input" onChange={onFilePicked} />
                <p className="note">Single-file HTML apps only (max 2 MB).</p>
              </div>
              <div className="row">
                <label className="label">Paste HTML (or edit what you uploaded)</label>
                <textarea
                  className="textarea"
                  style={{ minHeight: 220, fontFamily: "SFMono-Regular, Consolas, monospace", fontSize: 12.5 }}
                  placeholder={`<!doctype html>\n<html>\n  <head><title>My app</title></head>\n  <body>...</body>\n</html>`}
                  value={editing.inline_html || ""}
                  onChange={(e) => update({ inline_html: e.target.value })}
                />
                {editing.inline_html && (
                  <p className="note">Size: {(new Blob([editing.inline_html]).size / 1024).toFixed(1)} KB.</p>
                )}
              </div>
            </>
          )}

          <div className="actions">
            <button className="btn primary" onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save activity"}
            </button>
            <button className="btn" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className="card" style={{ marginTop: 14, fontSize: 13, color: status.type === "ok" ? "var(--ok)" : "var(--danger)" }}>
          {status.msg}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Need help?</h3>
        <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginTop: 0 }}>
          The <Link to="/guide">Guide</Link> walks through deploying a mini-app,
          pasting its URL or HTML into an activity, and troubleshooting iframe issues.
        </p>
      </div>
    </div>
  );
}
