import { useEffect, useState } from "react";
import "./Articles.css";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetch("http://rss-backend.test/api/favorites")
      .then((res) => res.json())
      .then((data) => setFavorites(data));
  }, []);

  return (
    <div className="main-content">
      <h1>⭐ Favoris</h1>
      {favorites.map((fav) => (
        <div className="article-card" key={fav.id}>
          <h2>{fav.article.title}</h2>
          <p>{fav.article.description}</p>
          <div className="article-meta">
            <span>📌 {fav.article.source}</span>
            <span>
              {new Date(fav.article.pub_date).toLocaleDateString()}
            </span>
          </div>
          <a
            href={fav.article.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Lire l'article →
          </a>
        </div>
      ))}
    </div>
  );
}
