import { Link } from "react-router-dom";

export default function SubjectTile({ subject, deployed, activityCount = 0 }) {
  const isLive = activityCount > 0 || deployed;
  const statusLabel = activityCount > 0
    ? `${activityCount} app${activityCount === 1 ? "" : "s"}`
    : isLive ? "live" : null;

  return (
    <Link
      to={`/s/${subject.id}`}
      className={`tile ${isLive ? "live" : "empty"}`}
      style={subject.color ? { '--tile-color': subject.color } : undefined}
      aria-label={`Open ${subject.name}`}
    >
      <div className="tile-top">
        <span className="tile-icon" aria-hidden>{subject.icon}</span>
        {statusLabel && (
          <span className={`tile-status ${isLive ? "live-status" : ""}`}>
            {statusLabel}
          </span>
        )}
      </div>
      <div>
        <p className="tile-title">{subject.name}</p>
        <div className="tile-category">{subject.category}</div>
      </div>
    </Link>
  );
}
