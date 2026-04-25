import { Link } from "react-router-dom";

export default function SubjectTile({ subject, deployed, activityCount = 0, index = 0 }) {
  const isLive = activityCount > 0 || deployed;
  const statusLabel = activityCount > 0
    ? `${activityCount} app${activityCount === 1 ? "" : "s"}`
    : isLive ? "live" : "empty";

  return (
    <Link
      to={`/s/${subject.id}`}
      className={`tile ${isLive ? "live" : "empty"}`}
      style={{ "--tile-index": index }}
      aria-label={`Open ${subject.name}`}
    >
      <div className="tile-top">
        <span className="tile-icon" aria-hidden>{subject.icon}</span>
        <span className={`tile-status ${isLive ? "live-status" : ""}`}>
          <span className="status-dot" />
          {statusLabel}
        </span>
      </div>
      <div>
        <p className="tile-title">{subject.name}</p>
        <div className="tile-category">{subject.category}</div>
      </div>
    </Link>
  );
}
