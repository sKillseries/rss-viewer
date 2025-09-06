import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Articles from "./Articles";
import Favorites from "./Favorites";

export default function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/">📑 Articles</Link>
        <Link to="/favorites">⭐ Favoris</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Articles />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </Router>
  );
}
