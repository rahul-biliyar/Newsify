import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import FeaturedArticles from "./components/FeaturedArticles";
import SearchResults from "./components/SearchResults";
import ArticleDetail from "./components/ArticleDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import "./styles.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <section className="hero">
                    <h1>Good Morning, Rahul!</h1>
                    <SearchBar />
                  </section>
                  <FeaturedArticles />
                </>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search/:query" element={<SearchResults />} />
            <Route path="/article" element={<ArticleDetail />} />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2024 Newsify. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
