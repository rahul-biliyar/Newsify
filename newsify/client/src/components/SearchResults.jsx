import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchBar from "./SearchBar";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@4.0.12/+esm";

const SearchResults = () => {
  const { query } = useParams();
  const [articles, setArticles] = useState([]);
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const searchApiUrl = "http://localhost:8000/api/search";

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true); // Set loading state before fetching
      try {
        const response = await axios.get(searchApiUrl, {
          params: { query },
        });
        const { articles, aiResponse } = response.data;
        setArticles(articles);
        setAiResponse(aiResponse);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setAiResponse("Failed to retrieve search results.");
      }
      setIsLoading(false); // End loading state after fetching
    };

    // Only fetch if articles are not already loaded for the current query
    if (isLoading) {
      fetchSearchResults();
    }
  }, [query, isLoading]);

  const handleArticleClick = (article) => {
    navigate(`/article`, { state: { article } });
  };

  return (
    <section>
      <SearchBar />
      <h2>Search Results for "{query}"</h2>
      <div
        className="ai-response"
        dangerouslySetInnerHTML={{ __html: marked(aiResponse) }}
      />
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

export default SearchResults;
