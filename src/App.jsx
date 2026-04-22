import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Subject from "./pages/Subject.jsx";
import Admin from "./pages/Admin.jsx";
import Guide from "./pages/Guide.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/s/:subjectId" element={<Subject />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="center-screen">
      <h1>404</h1>
      <p>This world doesn't exist.</p>
      <Link to="/" className="btn">Back to hub</Link>
    </div>
  );
}
