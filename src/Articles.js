import { useEffect, useState } from "react";
import "./Articles.css";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

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
  const fetchArticles = () => {
    const url = new URL("http://backend:9080/api/articles");
    if (selectedCategory) url.searchParams.append("category", selectedCategory);
    if (search) url.searchParams.append("q", search);
    if (sort) url.searchParams.append("sort", sort);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        const cats = [...new Set(data.map((a) => a.category))].filter(Boolean);
        setCategories(cats);
      })
      .catch((err) => console.error("Erreur fetch articles:", err));
    };

  // Charger articles + polling automatique toutes les 60s
  useEffect(() => {
    fetchArticles();
    const interval = setInterval(fetchArticles, 60000); //60s
    return () => clearInterval(interval); //nettoyage
  }, [selectedCategory, search, sort]);

  // Marquer comme lu
  function markAsRead(id) {
    fetch(`http://backend:9080/api/articles/${id}/read`, {
      method: "PATCH",
    }).then(() => {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
    });
  }

  function addFavorite(id) {
    fetch(`http://backend:9080/api/articles/${id}/favorite`, {
      method: "POST",
    });
  }

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

        {/* Recherche */}
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Tri */}
        <select onChange={(e) => setSort(e.target.value)} value={sort}>
          <option value="">Trier par défaut</option>
          <option value="pub_date">Date</option>
          <option value="title">Titre</option>
          <option value="source">Source</option>
        </select>

        {/* Toggle Dark Mode */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="toggle-btn"
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
          <div
            className={`article-card ${article.is_read ? "read" : ""}`}
            key={article.id}
          >
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <div className="article-meta">
              <span>📌 {article.source}</span>
              <span>{new Date(article.pub_date).toLocaleDateString()}</span>
            </div>
            <div className="actions">
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                Lire l'article →
              </a>
              <button onClick={() => markAsRead(article.id)}>✅ Lu</button>
              <button onClick={() => addFavorite(article.id)}>⭐ Favori</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
