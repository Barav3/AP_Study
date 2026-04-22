import { Link } from "react-router-dom";

export default function SubjectTile({ subject, deployed, activityCount = 0 }) {
  const style = { "--tile-color": subject.color };
  const badge =
    activityCount > 0
      ? `${activityCount} app${activityCount === 1 ? "" : "s"}`
      : deployed
        ? "LIVE"
        : "EMPTY";
  return (
    <Link to={`/s/${subject.id}`} className="tile" style={style} aria-label={`Enter ${subject.name}`}>
      <span className={`tile-badge ${activityCount > 0 || deployed ? "live" : "empty"}`}>
        {badge}
      </span>
      <div className="tile-icon" aria-hidden>{subject.icon}</div>
      <div>
        <h3 className="tile-title">{subject.short}</h3>
        <div className="tile-sub">{subject.category}</div>
      </div>
    </Link>
  );
}
