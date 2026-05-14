import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AP_SUBJECTS, CATEGORIES, isActiveSubjectId } from "../lib/subjects.js";
import { fetchSubjects, fetchActivityCounts } from "../lib/supabase.js";
import SubjectTile from "../components/SubjectTile.jsx";

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
  const [remote, setRemote]             = useState([]);
  const [activityCounts, setActivityCounts] = useState({});
  const [category, setCategory]         = useState("All");
  const [query, setQuery]               = useState("");
  const [err, setErr]                   = useState(null);

  useEffect(() => {
    fetchSubjects()
      .then(setRemote)
      .catch((e) => setErr(e.message || String(e)));
    fetchActivityCounts()
      .then(setActivityCounts)
      .catch(() => {});
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

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-wordmark">
          <h1>IJsMadeSomeBullshit</h1>
          <span className="tagline">select a subject</span>
        </div>

        <div className="home-controls">
          <div className="search-wrap">
            <input
              className="input"
              placeholder="Search subjects"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search subjects"
            />
          </div>
          <Link to="/guide" className="btn">Guide</Link>
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
        <div className="err-banner">
          Couldn't reach Supabase — showing local list. Slots will open but
          won't have deployed apps until the DB is connected.
        </div>
      )}

      <div className="grid">
        {filtered.map((s, i) => (
          <SubjectTile
            key={s.id}
            subject={s}
            activityCount={activityCounts[s.id] || 0}
            deployed={(activityCounts[s.id] || 0) > 0}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
