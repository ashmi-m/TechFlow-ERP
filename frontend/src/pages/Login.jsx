import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import workspaceImage from "../assets/techflow-workspace.png";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password.");
      }

      if (!data.user || !data.token) {
        throw new Error("Authentication information not received.");
      }

      // Admin portal accepts ONLY admin accounts
      if (data.user.role !== "admin") {
        throw new Error(
          "Access denied. This account is not an Admin account. Please use your correct login portal."
        );
      }

      // Store authentication
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      otherStorage.removeItem("token");
      otherStorage.removeItem("user");

      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please make sure the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Forgot password functionality will be implemented later.");
  };

  return (
    <main className={`login-page ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="login-container">

        {/* LEFT BRANDING PANEL */}
        <section className="login-intro">

          <header className="brand-header">
            <a
              href="#home"
              className="brand"
              onClick={(event) => event.preventDefault()}
            >
              <span className="brand-icon">T</span>

              <span className="brand-name">
                TechFlow <strong>ERP</strong>
              </span>
            </a>
          </header>

          <div className="intro-content">
            <span className="intro-badge">
              YOUR WORKSPACE, REIMAGINED
            </span>

            <h1>
              Work Smarter.
              <br />
              Achieve <span>More.</span>
            </h1>

            <p className="intro-description">
              A modern ERP solution to manage your projects,
              employees and teams efficiently.
            </p>

            <div className="feature-list">

              <article className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 19V10M10 19V5M16 19v-7M22 19V3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3>Manage Resources</h3>
                  <p>Organize your teams efficiently.</p>
                </div>
              </article>

              <article className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16 4.5a3.5 3.5 0 0 1 0 6.8M17 14.5a4 4 0 0 1 4 4V20"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3>Track Projects</h3>
                  <p>Monitor progress and deadlines.</p>
                </div>
              </article>

              <article className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="m13 2-9 12h7l-1 8 10-13h-7V2Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3>Boost Productivity</h3>
                  <p>Bring your entire team together.</p>
                </div>
              </article>

            </div>
          </div>
{/* PREMIUM WORKSPACE IMAGE */}
<div className="workspace-visual" aria-hidden="true">
  <img
    src={workspaceImage}
    alt="TechFlow ERP workspace"
  />
</div>

          <footer className="intro-footer">
            <span className="footer-line"></span>
            © 2026 TechFlow ERP. All rights reserved.
          </footer>

        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="login-form-section">

          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDarkMode((previous) => !previous)}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          >
            <span className={!darkMode ? "selected" : ""}>☀</span>
            <span className={darkMode ? "selected" : ""}>☾</span>
          </button>

          <div className="form-content">

            <div className="admin-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2 20 5v6c0 5.2-3.4 9-8 11-4.6-2-8-5.8-8-11V5l8-3Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="9" r="2.5" fill="currentColor" />
                <path
                  d="M7.5 17a4.5 4.5 0 0 1 9 0"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="welcome-section">
              <span className="welcome-badge">ADMIN PORTAL</span>

              <h2>Admin Login</h2>

              <p>
                Welcome back! Please sign in to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">

              <div className="form-group">
                <label htmlFor="email">Email Address</label>

                <div className="input-field">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="input-field">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="sign-in-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <span aria-hidden="true">→</span>}
              </button>

              <div className="secure-note">
                <span>◆</span>
                Secure Access • TechFlow ERP
              </div>

            </form>

            {/* EXISTING SOCIAL PLACEHOLDERS */}
            <div className="divider">
              <span>Or continue with</span>
            </div>

            <div className="social-buttons">

              <button
                type="button"
                aria-label="Google login"
                onClick={() =>
                  alert("Google authentication will be added later.")
                }
              >
                <span className="google-letter">G</span>
                Google
              </button>

              <button
                type="button"
                aria-label="Microsoft login"
                onClick={() =>
                  alert("Microsoft authentication will be added later.")
                }
              >
                <span className="microsoft-letter">▦</span>
                Microsoft
              </button>

              <button
                type="button"
                aria-label="GitHub login"
                onClick={() =>
                  alert("GitHub authentication will be added later.")
                }
              >
                <span className="github-letter">◉</span>
                GitHub
              </button>

            </div>

            <p className="copyright">
              © 2026 TechFlow ERP. All rights reserved.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Login;