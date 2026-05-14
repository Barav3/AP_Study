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
  const [subject, setSubject]               = useState(fallback);
  const [activities, setActivities]         = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [err, setErr]                       = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

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

  useEffect(() => {
    if (!activityId) { setCurrentActivity(null); return; }
    const match = activities.find((a) => a.id === activityId);
    if (match) {
      setCurrentActivity(match);
    } else {
      fetchActivity(subjectId, activityId).then((a) => setCurrentActivity(a)).catch(() => {});
    }
  }, [activityId, subjectId, activities]);

  if (!fallback) {
    return (
      <div className="center-screen">
        <h1>Unknown subject</h1>
        <Link to="/" className="btn">← hub</Link>
      </div>
    );
  }

  // ── Activity embed mode ──────────────────────────────────
  if (activityId) {
    if (loading && !currentActivity) {
      return <div className="center-screen"><p style={{ color: "var(--text-2)" }}>Loading…</p></div>;
    }
    if (!currentActivity) {
      return (
        <div className="center-screen">
          <h1>Activity not found</h1>
          <Link to={`/s/${subjectId}`} className="btn">← {subject?.name}</Link>
        </div>
      );
    }
    return (
      <div className="subject-shell">
        <div className="subject-topbar">
          <div className="topbar-crumb">
            <Link to={`/s/${subjectId}`} className="btn sm" aria-label="Back to subject">←</Link>
            <span className="topbar-icon" aria-hidden>{currentActivity.icon || subject?.icon || "🎓"}</span>
            <span className="topbar-path">
              <Link to={`/s/${subjectId}`} style={{ color: "var(--text-2)" }}>
                {subject?.short || subject?.name}
              </Link>
              {" / "}
              <strong>{currentActivity.name}</strong>
            </span>
            <span className="topbar-live">live</span>
          </div>
          <div className="topbar-actions">
            {currentActivity.deploy_mode === "url" && currentActivity.deploy_url && (
              <a href={currentActivity.deploy_url} target="_blank" rel="noreferrer" className="btn sm">
                ↗ new tab
              </a>
            )}
            <Link to="/admin" className="btn sm">admin</Link>
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

  // ── Subject-folder mode ──────────────────────────────────
  return (
    <div className="subject-folder">
      <header className="subject-folder-header">
        <div className="folder-crumb">
          <Link to="/" className="btn" aria-label="Back to hub">←</Link>
          <span className="folder-icon" aria-hidden>{subject?.icon}</span>
          <div className="folder-meta">
            <h1>{subject?.name}</h1>
            {subject?.description && <p className="note">{subject.description}</p>}
          </div>
        </div>
        <Link to="/admin" className="btn">admin</Link>
      </header>

      {err && (
        <div className="err-banner" style={{ marginBottom: 20 }}>
          Couldn't load activities — DB might not be configured yet.
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
