import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const isMobile = window.innerWidth < 768;

  // ✅ If user is already logged in, redirect straight to dashboard
  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        overflowX: "hidden",
        background: "#f5f7fb",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: isMobile ? "15px 20px" : "18px 70px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(15px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            color: "#1b4332",
            fontSize: isMobile ? "1.4rem" : "1.7rem",
            fontWeight: "800",
          }}
        >
          Postal
          <span style={{ color: "#52b788" }}>Track</span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {/* Track always visible for everyone */}
          <Link to="/track" style={{ textDecoration: "none" }}>
            <button style={trackBtn}>🔍 Track</button>
          </Link>

          {token ? (
            <>
              <Link to="/dashboard" style={{ textDecoration: "none" }}>
                <button style={dashboardNavBtn}>📦 Dashboard</button>
              </Link>

              <button onClick={handleLogout} style={logoutBtn}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button style={loginBtn}>Login</button>
              </Link>

              <Link to="/register" style={{ textDecoration: "none" }}>
                <button style={createAccountBtn}>Create Account</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        style={{
          minHeight: "100vh",
          paddingTop: isMobile ? "150px" : "120px",
          paddingLeft: isMobile ? "20px" : "70px",
          paddingRight: isMobile ? "20px" : "70px",
          paddingBottom: "60px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "50px",
          background:
            "linear-gradient(135deg, #d8f3dc 0%, #f5f7fb 45%, #caf0f8 100%)",
        }}
      >
        {/* LEFT SIDE */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 18px",
              borderRadius: "30px",
              background: "rgba(82,183,136,0.15)",
              border: "1px solid rgba(82,183,136,0.2)",
              color: "#2d6a4f",
              fontSize: "0.85rem",
              marginBottom: "25px",
              fontWeight: "600",
            }}
          >
            🚚 Live Parcel Tracking Available
          </div>

          <h1
            style={{
              color: "#081c15",
              fontSize: isMobile ? "2.5rem" : "4.5rem",
              lineHeight: 1.1,
              marginBottom: "20px",
              fontWeight: "900",
            }}
          >
            Ghana's Smartest
            <br />
            <span style={{ color: "#52b788" }}>
              Courier Tracking
            </span>
            <br />
            Platform
          </h1>

          <p
            style={{
              color: "#4f5d75",
              lineHeight: 1.8,
              fontSize: isMobile ? "0.95rem" : "1.05rem",
              maxWidth: "550px",
              marginBottom: "35px",
            }}
          >
            Send parcels, track deliveries in real-time, and receive instant
            notifications across Ghana with PostalTrack.
          </p>

          {/* HERO BUTTON — only Track Parcel, Create Account moved to navbar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <Link to="/track" style={{ textDecoration: "none" }}>
              <button style={heroBtn}>🔍 Track Parcel</button>
            </Link>
          </div>

          {/* STATS */}
          <div
            style={{
              marginTop: "50px",
              display: "flex",
              flexWrap: "wrap",
              gap: "30px",
            }}
          >
            {[
              ["500+", "Parcels"],
              ["100+", "Customers"],
              ["99%", "Success"],
            ].map((item, index) => (
              <div key={index}>
                <h2
                  style={{
                    color: "#2d6a4f",
                    margin: 0,
                    fontSize: "2rem",
                  }}
                >
                  {item[0]}
                </h2>

                <p
                  style={{
                    color: "#4f5d75",
                    marginTop: "5px",
                  }}
                >
                  {item[1]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE CARD */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              width: isMobile ? "100%" : "380px",
              maxWidth: "380px",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "25px",
              padding: "25px",
              backdropFilter: "blur(18px)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "25px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#6c757d",
                    margin: 0,
                    fontSize: "0.8rem",
                  }}
                >
                  Tracking Number
                </p>

                <h3
                  style={{
                    color: "#081c15",
                    marginTop: "8px",
                  }}
                >
                  TRK177889329
                </h3>
              </div>

              <div
                style={{
                  background: "#52b788",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  height: "fit-content",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                }}
              >
                LIVE
              </div>
            </div>

            {[
              "Parcel Booked",
              "Dispatched",
              "In Transit",
              "Out for Delivery",
              "Delivered",
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: i < 3 ? "#52b788" : "#dfe7ec",
                  }}
                />

                <span
                  style={{
                    color: i < 3 ? "#081c15" : "#6c757d",
                    fontWeight: i < 3 ? "600" : "500",
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{
          padding: isMobile ? "60px 20px" : "90px 70px",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#081c15",
            fontSize: isMobile ? "2rem" : "3rem",
            marginBottom: "15px",
          }}
        >
          Why Choose PostalTrack?
        </h2>

        <p
          style={{
            color: "#6c757d",
            marginBottom: "50px",
          }}
        >
          Fast, secure and reliable courier management across Ghana.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "25px",
          }}
        >
          {features.map((item, index) => (
            <div
              key={index}
              style={{
                width: isMobile ? "100%" : "250px",
                background: "white",
                padding: "30px",
                borderRadius: "20px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "15px" }}>
                {item.icon}
              </div>

              <h3 style={{ color: "#081c15" }}>
                {item.title}
              </h3>

              <p
                style={{
                  color: "#6c757d",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: isMobile ? "60px 20px" : "90px 70px",
          textAlign: "center",
          background: "linear-gradient(135deg, #52b788 0%, #40916c 100%)",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: isMobile ? "2rem" : "3rem",
            marginBottom: "20px",
          }}
        >
          Ready To Ship?
        </h2>

        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            marginBottom: "35px",
          }}
        >
          Join hundreds of customers using PostalTrack daily.
        </p>

        <Link to="/register" style={{ textDecoration: "none" }}>
          <button style={ctaBtn}>Get Started</button>
        </Link>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "25px 20px",
          textAlign: "center",
          background: "#1b4332",
        }}
      >
        <h3 style={{ color: "white" }}>
          Postal<span style={{ color: "#95d5b2" }}>Track</span>
        </h3>

        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            marginTop: "10px",
            fontSize: "0.9rem",
          }}
        >
          © 2026 PostalTrack — Ghana 🇬🇭
        </p>
      </footer>
    </div>
  );
}

/* ─── BUTTONS ─────────────────────────────────────────────── */

/* Track — white with green border, clean outlined style */
const trackBtn = {
  padding: "10px 22px",
  borderRadius: "8px",
  border: "2px solid #52b788",
  background: "white",
  color: "#2d6a4f",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.9rem",
};

/* Login — dark green filled */
const loginBtn = {
  padding: "10px 22px",
  borderRadius: "8px",
  border: "none",
  background: "#1b4332",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.9rem",
};

/* Create Account — medium/light green filled */
const createAccountBtn = {
  padding: "10px 22px",
  borderRadius: "8px",
  border: "none",
  background: "#52b788",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.9rem",
};

/* Dashboard nav — dark green */
const dashboardNavBtn = {
  padding: "10px 22px",
  borderRadius: "8px",
  border: "none",
  background: "#52b788",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.9rem",
};

/* Logout — red */
const logoutBtn = {
  padding: "10px 22px",
  borderRadius: "8px",
  border: "none",
  background: "#c1121f",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.9rem",
};

/* Hero primary — bold green */
const heroBtn = {
  padding: "15px 35px",
  borderRadius: "10px",
  border: "none",
  background: "#52b788",
  color: "white",
  fontWeight: "800",
  cursor: "pointer",
  fontSize: "1rem",
  boxShadow: "0 10px 25px rgba(82,183,136,0.35)",
};

const greenBtn = {
  padding: "10px 22px",
  borderRadius: "8px",
  border: "none",
  background: "#52b788",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "0.9rem",
};

const secondaryBtn = {
  padding: "15px 35px",
  borderRadius: "10px",
  border: "2px solid #1b4332",
  background: "white",
  color: "#1b4332",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "1rem",
};

const dashboardHeroBtn = {
  padding: "15px 35px",
  borderRadius: "10px",
  border: "none",
  background: "#1b4332",
  color: "white",
  fontWeight: "800",
  cursor: "pointer",
  fontSize: "1rem",
  boxShadow: "0 10px 25px rgba(27,67,50,0.25)",
};

const ctaBtn = {
  padding: "15px 35px",
  borderRadius: "10px",
  border: "none",
  background: "white",
  color: "#1b4332",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "1rem",
};

const features = [
  {
    icon: "⚡",
    title: "Fast Delivery",
    desc: "Quick nationwide parcel delivery with real-time updates.",
  },
  {
    icon: "📍",
    title: "Live Tracking",
    desc: "Track your shipment instantly from pickup to delivery.",
  },
  {
    icon: "🔒",
    title: "Secure Service",
    desc: "Your parcels are protected and handled safely.",
  },
  {
    icon: "📧",
    title: "Email Alerts",
    desc: "Receive instant delivery and shipment notifications.",
  },
];

export default Home;