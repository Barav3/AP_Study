import { Link } from "react-router-dom";

export default function EmptySlot({ subject }) {
  return (
    <div className="empty-slot">
      <div className="glyph" aria-hidden>{subject.icon}</div>
      <h2>{subject.name}</h2>
      <p>
        No study app is deployed to this slot yet. Head to the admin panel to paste a
        URL or upload a bundle — then this world will light up.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Link to="/" className="btn">← Back to hub</Link>
        <Link to="/admin" className="btn primary">Deploy an app</Link>
      </div>
    </div>
  );
}
