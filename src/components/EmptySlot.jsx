import { Link } from "react-router-dom";

export default function EmptySlot({ subject }) {
  return (
    <div className="empty-slot">
      <div className="glyph" aria-hidden>{subject.icon}</div>
      <h2>{subject.name}</h2>
      <p>
        No study app deployed to this slot yet. Paste a URL or upload a
        single-file HTML app to bring it to life.
      </p>
      <div className="empty-actions">
        <Link to="/" className="btn">← hub</Link>
        <Link to="/guide" className="btn">how it works</Link>
        <Link to="/admin" className="btn primary">deploy →</Link>
      </div>
    </div>
  );
}
