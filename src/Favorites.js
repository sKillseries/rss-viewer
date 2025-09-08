import { useEffect, useState } from "react";
import "./Articles.css";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  // Fonction pour charger les favoris
  const fetchFavorites = () => {
    fetch("http://backend:9080/api/favorites")
      .then((res) => res.json())
      .then((data) => setFavorites(data))
      .catch((err) => console.error("Erreur fetch favoris:", err));
  };

  // Fonction pour supprimer un favori
  const removeFavorite = (id) => {
    fetch(`http://backend:9080/api/favorites/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          // Mise à jour locale
          setFavorites((prev) => prev.filter((fav) => fav.id !== id));
        } else {
          console.error("Erreur suppression favori")
        }
      })
      .catch((err) => console.error("Erreur réseau:", err));
  };

  // Charger favoris = polling automatique
  useEffect(() => {
    fetchFavorites();
    const interval = setInterval(fetchFavorites, 60000); // 60s
    return () => clearInterval(interval); // nettoyage intervalle
  })

  return (
    <div className="main-content">
      <h1>⭐ Favoris</h1>
      {favorites.length === 0 ? (
        <p>Aucun faori pour le moment.</p>
      ) : (
        favorites.map((fav) => (
          <div className="article-card" key={fav.id}>
            <h2>{fav.article.title}</h2>
            <p>{fav.article.description}</p>
            <div className="article-meta">
              <span>📌 {fav.article.source}</span>
              <span>{new Date(fav.article.pub_date).toLocaleDateString()}</span>
            </div>
            <div className="actions">
              <a
                href={fav.article.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Lire l'article →
              </a>
              <button
                onClick={() => removeFavorite(fav.id)}
                className="remove-btn"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
