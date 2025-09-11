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

  // Charger articles + polling
  useEffect(() => {
    function fetchArticles() {
      const url = new URL("http://backend:9080/api/articles");
      if (sort) url.searchParams.append("sort", sort);

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          // ✅ Normalisation des catégories/tags
          const normalized = data.map((a) => ({
            ...a,
            categories: a.category
              ? (Array.isArray(a.category) ? a.category : String(a.category))
                  .replace(/[{}"]/g, "")
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean)
              : [],
          }));

          setArticles(normalized);

          // ✅ Extraire tous les tags uniques
          const allTags = normalized.flatMap((a) => a.categories);
          setCategories([...new Set(allTags)]);
        })
        .catch((err) => console.error("Erreur fetch articles:", err));
    }

    fetchArticles();
    const interval = setInterval(fetchArticles, 60000); // 60s
    return () => clearInterval(interval);
  }, [sort]);

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

  // ✅ Appliquer recherche insensible à la casse + filtre catégorie
  const filteredArticles = articles.filter((article) => {
    let matchesSearch = true;
    let matchesCategory = true;

    if (search) {
      const q = search.toLowerCase();
      matchesSearch =
        article.title.toLowerCase().includes(q) ||
        article.description.toLowerCase().includes(q) ||
        article.categories.some((c) => c.toLowerCase().includes(q));
    }

    if (selectedCategory) {
      matchesCategory = article.categories
        .map((c) => c.toLowerCase())
        .includes(selectedCategory.toLowerCase());
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Recherche */}
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Categories/tags */}
        <select
          onChange={(e) =>
            setSelectedCategory(e.target.value || null)
          }
          value={selectedCategory || ""}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Tri */}
        <select onChange={(e) => setSort(e.target.value)} value={sort}>
          <option value="">Trier par défaut</option>
          <option value="pub_date">Date (plus récent)</option>
          <option value="title">Titre (A → Z)</option>
          <option value="source">Source (A → Z)</option>
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
          {selectedCategory
            ? `Articles : ${selectedCategory}`
            : "Tous les articles"}
        </h1>
        {filteredArticles.map((article) => (
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

            {/* ✅ Tags cliquables */}
            <div className="tags">
              {article.categories.map((tag, i) => (
                <span
                  key={i}
                  className="tag"
                  onClick={() => setSelectedCategory(tag)}
                >
                  #{tag}
                </span>
              ))}
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
