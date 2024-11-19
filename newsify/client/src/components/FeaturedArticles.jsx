import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FeaturedArticles = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const api_key = "7cbf35ec96564be1b12f1a328830215f";
  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=6&apiKey=${api_key}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(url);
        setArticles(response.data.articles);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [url]);

  const handleArticleClick = (article) => {
    navigate(`/article`, { state: { article } });
  };

  return (
    <section className="articles-section">
      <h2>Featured Articles</h2>
      <div className="grid">
        {isLoading
          ? [...Array(6)].map((_, index) => (
              <article key={index} className="loading-article">
                <div className="loading-image"></div>
                <div className="loading-text"></div>
              </article>
            ))
          : articles.map((article, index) => (
              <article
                key={index}
                onClick={() => handleArticleClick(article)}
                className="clickable"
              >
                {article.urlToImage ? (
                  <img src={article.urlToImage} alt={article.title} />
                ) : (
                  <div className="loading-image"></div>
                )}
                <h2>{article.title}</h2>
              </article>
            ))}
      </div>
    </section>
  );
};

export default FeaturedArticles;
