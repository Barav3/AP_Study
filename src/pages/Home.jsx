import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AP_SUBJECTS, CATEGORIES, isActiveSubjectId } from "../lib/subjects.js";
import { fetchSubjects } from "../lib/supabase.js";
import SubjectTile from "../components/SubjectTile.jsx";

// Merges the hardcoded canonical AP list with Supabase data. **Local is the
// gate** — a remote row is only merged in if its subject is uncommented in
// src/lib/subjects.js. That way commented-out subjects stay hidden even if
// they were previously seeded into Supabase.
function mergeSubjects(local, remote) {
  const byId = new Map(local.map((s) => [s.id, { ...s }]));
  for (const r of remote) {
    if (!isActiveSubjectId(r.id)) continue;
    const prev = byId.get(r.id) || {};
    byId.set(r.id, { ...prev, ...r });
  }
  return Array.from(byId.values());
}

export default function Home() {
  const [remote, setRemote] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetchSubjects()
      .then(setRemote)
      .catch((e) => setErr(e.message || String(e)));
  }, []);

  const subjects = useMemo(() => mergeSubjects(AP_SUBJECTS, remote), [remote]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (q && !(`${s.name} ${s.short}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [subjects, category, query]);

  const liveCount = subjects.filter((s) => s.deploy_url || s.bundle_path).length;

  return (
    <div className="home">
      <header className="home-header">
        <div>
          <h1>IJsMadeSomeBullshit</h1>
          <p>Pick a world. Study anywhere. {liveCount} live {liveCount === 1 ? "slot" : "slots"}.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="input"
            style={{ width: 220 }}
            placeholder="Search subjects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Link to="/admin" className="btn">Admin</Link>
        </div>
      </header>

      <div className="category-bar" role="tablist">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            className={`chip ${category === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {err && (
        <div className="card" style={{
          padding: 12, borderRadius: 12, border: "1px solid #4a3333",
          background: "#2a1d1d", color: "#f4bcbc", marginBottom: 16, fontSize: 13,
        }}>
          Couldn't reach Supabase ({err}). Showing local subject list — tiles will still
          open but slots won't have deployed apps until the DB is connected.
        </div>
      )}

      <div className="grid">
        {filtered.map((s) => (
          <SubjectTile
            key={s.id}
            subject={s}
            deployed={!!(s.deploy_url || s.bundle_path)}
          />
        ))}
      </div>
    </div>
  );
}
