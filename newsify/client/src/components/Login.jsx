import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token);
      alert(`Welcome, ${response.data.username}`);
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <section>
      <header>
        <h1>Login to Newsify</h1>
      </header>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <footer>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </footer>
    </section>
  );
};

export default Login;
