import { useEffect, useState } from "react";
import "./Articles.css";

export default function Favorites() {
  const [rawFavorites, setRawFavorites] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sort, setSort] = useState("");

  // Debounce search (500ms)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(id);
  }, [search]);

  // Charger darkMode depuis localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  // Sauvegarder darkMode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Fetch favoris avec AbortController
  useEffect(() => {
    const controller = new AbortController();

    async function fetchFavorites() {
      try {
        const url = new URL("http://backend:9080/api/favorites");
        if (debouncedSearch) url.searchParams.append("q", debouncedSearch.toLowerCase());

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          console.error(`Erreur HTTP (${res.status}) lors du fetch favoris`);
          setRawFavorites([]);
          return;
        }

        const data = await res.json();
        let results = Array.isArray(data) ? data : [];

        // Filtrage côté client
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          results = results.filter((fav) => {
            const title = (fav.article?.title || "").toLowerCase();
            const desc = (fav.article?.description || "").toLowerCase();
            return title.includes(q) || desc.includes(q);
          });
        }

        setRawFavorites(results);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Erreur fetch favoris:", err);
        }
      }
    }

    fetchFavorites();

    return () => controller.abort(); // annule la requête si composant démonte ou nouvelle recherche
  }, [debouncedSearch]);

  // Appliquer le tri côté client
  useEffect(() => {
    function applySort(items, sortKey) {
      const arr = [...items];
      if (!sortKey) return arr;

      if (sortKey === "pub_date") {
        arr.sort((a, b) => {
          const da = a.article?.pub_date ? Date.parse(a.article.pub_date) : 0;
          const db = b.article?.pub_date ? Date.parse(b.article.pub_date) : 0;
          return db - da;
        });
      } else if (sortKey === "title") {
        arr.sort((a, b) => {
          const ta = (a.article?.title || "").toLowerCase();
          const tb = (b.article?.title || "").toLowerCase();
          return ta.localeCompare(tb);
        });
      } else if (sortKey === "source") {
        arr.sort((a, b) => {
          const sa = (a.article?.source || "").toLowerCase();
          const sb = (b.article?.source || "").toLowerCase();
          return sa.localeCompare(sb);
        });
      }

      return arr;
    }

    setFavorites(applySort(rawFavorites, sort));
  }, [sort, rawFavorites]);

  return (
    <div className="app-container">
      <aside className="sidebar">
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
          <option value="pub_date">Date (plus récent)</option>
          <option value="title">Titre (A → Z)</option>
          <option value="source">Source (A → Z)</option>
        </select>

        {/* Toggle Dark Mode */}
        <div style={{ marginTop: "20px" }}>
          <button onClick={() => setDarkMode(!darkMode)} className="toggle-btn">
            {darkMode ? "🌞 Mode clair" : "🌙 Mode sombre"}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <h1>Mes favoris</h1>
        {favorites.length === 0 ? (
          <p>Aucun favori pour l’instant</p>
        ) : (
          favorites.map((fav) => (
            <div className="article-card" key={fav.id}>
              <h2>{fav.article?.title}</h2>
              <p>{fav.article?.description}</p>
              <div className="article-meta">
                <span>📌 {fav.article?.source}</span>
                <span>
                  {fav.article?.pub_date
                    ? new Date(fav.article.pub_date).toLocaleDateString()
                    : ""}
                </span>
              </div>
              <div className="actions">
                <a href={fav.article?.link} target="_blank" rel="noopener noreferrer">
                  Lire l'article →
                </a>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
