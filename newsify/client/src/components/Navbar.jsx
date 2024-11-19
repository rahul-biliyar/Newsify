import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    document.head.appendChild(link);

    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUsername(userData?.username || "User");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUsername("");
    navigate("/login");
  };

  return (
    <header>
      <nav>
        <div class="logo">
          <span className="material-icons">newspaper</span>
          <a href="/">Newsify</a>
        </div>
        <nav>
          {isLoggedIn ? (
            <>
              <span className="material-icons">person</span>{" "}
              <a href="/profile">{username}</a>
              <a href="/login" onClick={handleLogout}>
                Logout
              </a>
            </>
          ) : (
            <a href="/login">Login</a>
          )}
        </nav>
      </nav>
    </header>
  );
};

export default Navbar;
