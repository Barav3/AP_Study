import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSubject } from "../lib/supabase.js";
import { findSubject } from "../lib/subjects.js";
import SubjectFrame from "../components/SubjectFrame.jsx";
import EmptySlot from "../components/EmptySlot.jsx";

export default function Subject() {
  const { subjectId } = useParams();
  const fallback = findSubject(subjectId);
  const [subject, setSubject] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchSubject(subjectId)
      .then((remote) => {
        if (!alive) return;
        // Merge remote over local fallback so we still render metadata if DB
        // doesn't have a row for this subject yet.
        setSubject(remote ? { ...fallback, ...remote } : fallback);
      })
      .catch(() => {
        if (alive) setSubject(fallback);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [subjectId, fallback]);

  if (!fallback) {
    return (
      <div className="center-screen">
        <h1>Unknown subject</h1>
        <Link to="/" className="btn">Back to hub</Link>
      </div>
    );
  }

  const deployedSrc = subject?.deploy_url || null;
  const inlineHtml = subject?.inline_html || null;
  const hasDeployment = Boolean(deployedSrc || inlineHtml);

  return (
    <div className="subject-shell">
      <div className="subject-topbar">
        <div className="crumb">
          <Link to="/" className="btn" aria-label="Back to hub">←</Link>
          <span className="icon" aria-hidden>{subject?.icon || "🎓"}</span>
          <span className="name">{subject?.name}</span>
          {hasDeployment && <span className="tag">Live</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {deployedSrc && !inlineHtml && (
            <a href={deployedSrc} target="_blank" rel="noreferrer" className="btn">
              Open in new tab ↗
            </a>
          )}
          <Link to="/admin" className="btn">Admin</Link>
        </div>
      </div>
      <div className="subject-frame-wrap">
        {loading && !hasDeployment ? (
          <div className="empty-slot">
            <div className="glyph">⏳</div>
            <p>Loading slot…</p>
          </div>
        ) : hasDeployment ? (
          <SubjectFrame
            src={inlineHtml ? undefined : deployedSrc}
            srcDoc={inlineHtml || undefined}
            title={subject.name}
          />
        ) : (
          <EmptySlot subject={subject} />
        )}
      </div>
    </div>
  );
}
