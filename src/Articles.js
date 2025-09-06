import { useEffect, useState } from "react";
import "./Articles.css";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Charger darkMode depuis localStorage au démarrage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  // Appliquer darkMode et sauvegarder dans localStorage
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Charger articles
  useEffect(() => {
    const url = selectedCategory
      ? `http://rss-backend.test/api/articles?category=${selectedCategory}`
      : "http://rss-backend.test/api/articles";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        const cats = [...new Set(data.map((a) => a.category))].filter(Boolean);
        setCategories(cats);
      });
  }, [selectedCategory]);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Catégories</h2>
        <ul>
          <li
            className={!selectedCategory ? "active" : ""}
            onClick={() => setSelectedCategory(null)}
          >
            Tous les articles
          </li>
          {categories.map((cat, idx) => (
            <li
              key={idx}
              className={selectedCategory === cat ? "active" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </li>
          ))}
        </ul>

        {/* Toggle Dark Mode */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: darkMode ? "#4da3ff" : "#333",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            {darkMode ? "🌞 Mode clair" : "🌙 Mode sombre"}
          </button>
        </div>
      </aside>

      {/* Liste des articles */}
      <main className="main-content">
        <h1>
          {selectedCategory ? `Articles : ${selectedCategory}` : "Tous les articles"}
        </h1>
        {articles.map((article) => (
          <div className="article-card" key={article.id}>
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <div className="article-meta">
              <span>📌 {article.source}</span>
              <span>{new Date(article.pub_date).toLocaleDateString()}</span>
            </div>
            <a href={article.link} target="_blank" rel="noopener noreferrer">
              Lire l'article →
            </a>
          </div>
        ))}
      </main>
    </div>
  );
}
