import { Link } from "react-router-dom";

export default function SubjectTile({ subject, deployed }) {
  const style = { "--tile-color": subject.color };
  return (
    <Link to={`/s/${subject.id}`} className="tile" style={style} aria-label={`Enter ${subject.name}`}>
      <span className={`tile-badge ${deployed ? "live" : "empty"}`}>
        {deployed ? "LIVE" : "EMPTY"}
      </span>
      <div className="tile-icon" aria-hidden>{subject.icon}</div>
      <div>
        <h3 className="tile-title">{subject.short}</h3>
        <div className="tile-sub">{subject.category}</div>
      </div>
    </Link>
  );
}
