import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@4.0.12/+esm";

const ArticleDetail = () => {
  const { state } = useLocation();
  const article = state?.article;
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAISummary = async () => {
      if (!article) return;

      console.log("Fetching AI Summary for article:", article.title);

      try {
        setLoading(true);
        setError("");

        const response = await axios.post(
          "http://localhost:8000/api/ai-summary",
          {
            title: article.title,
            url: article.url,
            description: article.description,
            urlToImage: article.urlToImage,
          }
        );

        const markdown = response.data.summary || "";
        setAiSummary(marked(markdown));
        console.log("AI Summary fetched successfully.");
      } catch (error) {
        console.error("Error fetching AI summary:", error);
        setError("Failed to generate summary. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (article) {
      fetchAISummary();
    }
  }, [article]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div
      className="article-detail-container"
      style={{ display: "flex", minHeight: "100vh" }}
    >
      <div className="article-iframe" style={{ width: "75%", height: "100vh" }}>
        <iframe
          src={article.url}
          title={article.title}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          loading="lazy"
        />
      </div>

      <div
        className="ai-summary"
        style={{
          width: "25%",
          padding: "20px",
          borderLeft: "1px solid #ddd",
          overflowY: "auto",
        }}
      >
        <h2>AI Summary</h2>
        <div dangerouslySetInnerHTML={{ __html: aiSummary }} />
      </div>
    </div>
  );
};

export default ArticleDetail;
