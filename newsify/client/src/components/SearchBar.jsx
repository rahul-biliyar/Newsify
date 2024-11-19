import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${query}`);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="input-container">
        <input
          type="text"
          placeholder="Search with AI..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="AI-powered search"
        />
        <button type="submit">
          <span className="material-icons">search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
