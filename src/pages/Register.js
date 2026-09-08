import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const images = [
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2067&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim()
    ) {
      setMessage("❌ Please fill in all fields before registering.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://postaltrack-backend-production.up.railway.app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone_number: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage("❌ " + (data.error || data.message || "Registration failed!"));
      }
    } catch (err) {
      setMessage("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${img}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.85)",
            opacity: currentImage === i ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(216,243,220,0.82) 0%, rgba(245,247,251,0.75) 45%, rgba(202,240,248,0.82) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 3,
        }}
      >
        {images.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentImage(i)}
            style={{
              width: currentImage === i ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: currentImage === i ? "#52b788" : "rgba(255,255,255,0.5)",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "460px",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.9)",
          borderRadius: "28px",
          padding: "40px 35px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ color: "#1b4332", fontSize: "1.8rem", fontWeight: "900" }}>
              Postal<span style={{ color: "#52b788" }}>Track</span>
            </span>
          </Link>
        </div>

        <h2
          style={{
            color: "#1b4332",
            fontSize: "1.5rem",
            fontWeight: "800",
            margin: "0 0 6px",
            textAlign: "center",
          }}
        >
          Create Account
        </h2>
        <p
          style={{
            color: "#6c757d",
            fontSize: "0.88rem",
            margin: "0 0 28px",
            textAlign: "center",
          }}
        >
          Fill in your details to get started for free
        </p>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#2d6a4f",
                fontSize: "0.78rem",
                fontWeight: "700",
                letterSpacing: "0.8px",
                display: "block",
                marginBottom: "7px",
              }}
            >
              FULL NAME
            </label>
            <div style={{ position: "relative" }}>
              <svg
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="12" cy="8" r="4" stroke="#52b788" strokeWidth="2" />
                <path d="M4 20C4 17.8 7.6 16 12 16C16.4 16 20 17.8 20 20" stroke="#52b788" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                name="full_name"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  background: "rgba(241,248,244,0.8)",
                  border: "1.5px solid rgba(82,183,136,0.2)",
                  borderRadius: "12px",
                  color: "#1b4332",
                  fontSize: "0.92rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#2d6a4f",
                fontSize: "0.78rem",
                fontWeight: "700",
                letterSpacing: "0.8px",
                display: "block",
                marginBottom: "7px",
              }}
            >
              EMAIL ADDRESS
            </label>
            <div style={{ position: "relative" }}>
              <svg
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="#52b788" strokeWidth="2" />
                <path d="M2 6L12 13L22 6" stroke="#52b788" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                name="email"
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  background: "rgba(241,248,244,0.8)",
                  border: "1.5px solid rgba(82,183,136,0.2)",
                  borderRadius: "12px",
                  color: "#1b4332",
                  fontSize: "0.92rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#2d6a4f",
                fontSize: "0.78rem",
                fontWeight: "700",
                letterSpacing: "0.8px",
                display: "block",
                marginBottom: "7px",
              }}
            >
              PHONE NUMBER
            </label>
            <div style={{ position: "relative" }}>
              <svg
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#52b788" strokeWidth="2" />
              </svg>
              <input
                name="phone_number"
                placeholder="0XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  background: "rgba(241,248,244,0.8)",
                  border: "1.5px solid rgba(82,183,136,0.2)",
                  borderRadius: "12px",
                  color: "#1b4332",
                  fontSize: "0.92rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                color: "#2d6a4f",
                fontSize: "0.78rem",
                fontWeight: "700",
                letterSpacing: "0.8px",
                display: "block",
                marginBottom: "7px",
              }}
            >
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <svg
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#52b788" strokeWidth="2" />
                <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="#52b788" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                name="password"
                placeholder="Create a strong password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 42px",
                  background: "rgba(241,248,244,0.8)",
                  border: "1.5px solid rgba(82,183,136,0.2)",
                  borderRadius: "12px",
                  color: "#1b4332",
                  fontSize: "0.92rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="#52b788" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#52b788" strokeWidth="2" strokeLinecap="round" />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="#52b788" strokeWidth="2" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#52b788" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="#52b788" strokeWidth="2" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "rgba(82,183,136,0.5)" : "linear-gradient(135deg, #52b788, #40916c)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 25px rgba(82,183,136,0.35)",
              marginBottom: "18px",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {message && (
          <div
            style={{
              padding: "11px 16px",
              borderRadius: "10px",
              marginBottom: "14px",
              background: message.includes("✅") ? "rgba(82,183,136,0.1)" : "rgba(255,100,100,0.1)",
              border: `1.5px solid ${
                message.includes("✅") ? "rgba(82,183,136,0.4)" : "rgba(255,100,100,0.4)"
              }`,
              color: message.includes("✅") ? "#2d6a4f" : "#c1121f",
              fontSize: "0.85rem",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            {message}
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#6c757d", fontSize: "0.85rem", margin: "0 0 8px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#52b788", fontWeight: "700", textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
          <Link to="/" style={{ color: "#2d6a4f", fontSize: "0.8rem", textDecoration: "none", fontWeight: "600" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;