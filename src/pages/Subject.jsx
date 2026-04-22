import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSubject, fetchActivities, fetchActivity } from "../lib/supabase.js";
import { findSubject } from "../lib/subjects.js";
import SubjectFrame from "../components/SubjectFrame.jsx";
import EmptySlot from "../components/EmptySlot.jsx";

// Two modes:
//   /s/:subjectId              → grid of activities inside this subject
//   /s/:subjectId/a/:activityId → embed that activity's iframe
export default function Subject() {
  const { subjectId, activityId } = useParams();
  const fallback = findSubject(subjectId);
  const [subject, setSubject] = useState(fallback);
  const [activities, setActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    // Always fetch the subject meta + the list of activities in it.
    Promise.all([
      fetchSubject(subjectId).catch(() => null),
      fetchActivities(subjectId).catch((e) => { setErr(e.message); return []; }),
    ]).then(([remoteSubject, acts]) => {
      if (!alive) return;
      setSubject(remoteSubject ? { ...fallback, ...remoteSubject } : fallback);
      setActivities(acts);
    }).finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [subjectId, fallback]);

  // If launching a specific activity, look it up in the list we already have.
  useEffect(() => {
    if (!activityId) { setCurrentActivity(null); return; }
    const match = activities.find((a) => a.id === activityId);
    if (match) {
      setCurrentActivity(match);
    } else {
      // Fallback: direct lookup (list may not have loaded yet)
      fetchActivity(subjectId, activityId).then((a) => setCurrentActivity(a)).catch(() => {});
    }
  }, [activityId, subjectId, activities]);

  if (!fallback) {
    return (
      <div className="center-screen">
        <h1>Unknown subject</h1>
        <Link to="/" className="btn">Back to hub</Link>
      </div>
    );
  }

  // ---- Activity embed mode ----
  if (activityId) {
    if (loading && !currentActivity) {
      return <div className="center-screen"><p>Loading activity…</p></div>;
    }
    if (!currentActivity) {
      return (
        <div className="center-screen">
          <h1>Activity not found</h1>
          <Link to={`/s/${subjectId}`} className="btn">← Back to {subject?.name}</Link>
        </div>
      );
    }
    return (
      <div className="subject-shell">
        <div className="subject-topbar">
          <div className="crumb">
            <Link to={`/s/${subjectId}`} className="btn" aria-label="Back to subject">←</Link>
            <span className="icon" aria-hidden>{currentActivity.icon || subject?.icon || "🎓"}</span>
            <span className="name">
              <Link to={`/s/${subjectId}`} style={{ color: "inherit" }}>{subject?.name}</Link>
              {" · "}
              {currentActivity.name}
            </span>
            <span className="tag">Live</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {currentActivity.deploy_url && currentActivity.deploy_mode === "url" && (
              <a href={currentActivity.deploy_url} target="_blank" rel="noreferrer" className="btn">
                Open in new tab ↗
              </a>
            )}
            <Link to="/admin" className="btn">Admin</Link>
          </div>
        </div>
        <div className="subject-frame-wrap">
          <SubjectFrame
            src={currentActivity.deploy_mode === "url" ? currentActivity.deploy_url : undefined}
            srcDoc={currentActivity.deploy_mode === "inline" ? currentActivity.inline_html : undefined}
            title={currentActivity.name}
          />
        </div>
      </div>
    );
  }

  // ---- Subject-folder mode (list of activities) ----
  return (
    <div className="subject-folder">
      <header className="subject-folder-header">
        <div className="crumb">
          <Link to="/" className="btn" aria-label="Back to hub">←</Link>
          <span className="icon-large" aria-hidden style={{ background: `linear-gradient(135deg, ${subject?.color} 0%, color-mix(in srgb, ${subject?.color} 60%, #000) 100%)` }}>
            {subject?.icon}
          </span>
          <div>
            <h1 style={{ margin: 0 }}>{subject?.name}</h1>
            {subject?.description && <p className="note">{subject.description}</p>}
          </div>
        </div>
        <Link to="/admin" className="btn">Admin</Link>
      </header>

      {err && (
        <div className="card" style={{ padding: 12, marginBottom: 16, fontSize: 13, color: "#f4bcbc", background: "#2a1d1d", border: "1px solid #4a3333" }}>
          Couldn't load activities ({err}). Database might not be configured yet.
        </div>
      )}

      {loading ? (
        <p className="note">Loading activities…</p>
      ) : activities.length === 0 ? (
        <EmptySlot subject={subject} />
      ) : (
        <div className="activity-grid">
          {activities.map((a) => (
            <Link
              key={a.id}
              to={`/s/${subjectId}/a/${a.id}`}
              className="activity-tile"
              style={{ "--tile-color": subject?.color || "#4a9b7e" }}
            >
              <span className="activity-icon" aria-hidden>{a.icon || "🎯"}</span>
              <div>
                <div className="activity-name">{a.name}</div>
                {a.description && <div className="activity-desc">{a.description}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
