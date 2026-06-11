import React, { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const isMobile = window.innerWidth < 768;

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        setMessage("Login successful! Redirecting...");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        setMessage(data.error || "Login failed!");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #d8f3dc 0%, #f5f7fb 45%, #caf0f8 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: "25px",
          padding: isMobile ? "30px 20px" : "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              color: "#1b4332",
              marginBottom: "10px",
              fontSize: "2rem",
              fontWeight: "800",
            }}
          >
            Postal<span style={{ color: "#52b788" }}>Track</span>
          </h1>

          <p
            style={{
              color: "#6c757d",
              fontSize: "0.95rem",
            }}
          >
            Welcome back! Login to continue.
          </p>
        </div>

        {/* EMAIL */}
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#1b4332",
              fontWeight: "600",
            }}
          >
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#1b4332",
              fontWeight: "600",
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div><div style={{ textAlign: 'right', marginBottom: '1rem', marginTop: '-0.3rem' }}>
  <a href="/forgot-password" style={{ color: '#2d6a4f', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>
    Forgot Password?
  </a>
</div>

        {/* BUTTON */}
        <button onClick={handleLogin} style={loginBtn}>
          Login
        </button>

        {/* MESSAGE */}
        {message && (
          <p
            style={{
              marginTop: "18px",
              textAlign: "center",
              color: "#2d6a4f",
              fontWeight: "600",
            }}
          >
            {message}
          </p>
        )}

        {/* LINKS */}
        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
            color: "#6c757d",
            fontSize: "0.95rem",
          }}
        >
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#52b788",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Register
            </Link>
          </p>

          <p style={{ marginTop: "12px" }}>
            <Link
              to="/"
              style={{
                color: "#1b4332",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #dfe7ec",
  outline: "none",
  fontSize: "1rem",
  background: "rgba(255,255,255,0.9)",
  boxSizing: "border-box",
};

const loginBtn = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "none",
  background: "#52b788",
  color: "white",
  fontWeight: "700",
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(82,183,136,0.25)",
};

export default Login;