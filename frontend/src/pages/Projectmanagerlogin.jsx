
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Projectmanagerlogin.css";

const API_URL = "http://localhost:5000/api/auth/login";

function Projectmanagerlogin() {
  const navigate = useNavigate();

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI states
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Theme state
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("pm-login-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });

  // Save theme preference
  useEffect(() => {
    try {
      localStorage.setItem("pm-login-theme", theme);
    } catch {
      // Continue if storage is unavailable
    }
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((previous) =>
      previous === "dark" ? "light" : "dark"
    );
  };

  // Project Manager Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

     if (data.user?.role !== "project_manager") {
  throw new Error("Access denied. Please use a Project Manager account.");
}
      // Remember Me storage
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      otherStorage.removeItem("token");
      otherStorage.removeItem("user");

      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      // Navigate to dashboard
      navigate("/project-manager/dashboard", {
        replace: true,
      });

    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Please make sure the backend is running."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`pm-login-page pm-theme-${theme}`}>
      <div className="pm-login-container">

        {/* LEFT SECTION - HERO */}
        <section className="pm-hero-section">

          {/* Brand */}
          <div className="pm-brand">
            <div className="pm-logo" aria-hidden="true">
              T
            </div>

            <h2>
              TechFlow <span>ERP</span>
            </h2>
          </div>

          {/* Portal Badge */}
          <div className="pm-portal-badge">
            <span aria-hidden="true">▣</span>
            PROJECT MANAGER PORTAL
          </div>

          {/* Hero Content */}
          <div className="pm-hero-content">
            <div className="pm-hero-text">
              <h1>
                Manage Projects.
                <br />
                Lead Teams.
                <br />
                <span>Achieve More.</span>
              </h1>

              <p>
                Plan smarter, collaborate better and deliver
                successful projects with TechFlow ERP.
              </p>

              {/* Features */}
              <div className="pm-features">
                <div className="pm-feature">
                  <span className="pm-feature-icon" aria-hidden="true">
                    ✓
                  </span>
                  <span>Manage Projects</span>
                </div>

                <div className="pm-feature">
                  <span className="pm-feature-icon" aria-hidden="true">
                    ▦
                  </span>
                  <span>Track Tasks</span>
                </div>

                <div className="pm-feature">
                  <span className="pm-feature-icon" aria-hidden="true">
                    ♟
                  </span>
                  <span>Manage Team</span>
                </div>
              </div>
            </div>

            {/* Project Image */}
            <div className="pm-workspace">
              <img
                src="/images/Futuristic Blue Project Dashboard Workspace.png"
                alt="Project management dashboard displayed on a laptop"
                className="pm-workspace-image"
              />
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="pm-tagline">
            PLAN <span>•</span>
            COLLABORATE <span>•</span>
            DELIVER
            <div></div>
          </div>
        </section>

        {/* RIGHT SECTION - LOGIN */}
        <section className="pm-form-section">

          {/* Theme Toggle */}
          <button
            type="button"
            className="pm-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span aria-hidden="true">
              {theme === "dark" ? "☀" : "☾"}
            </span>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          {/* Brand */}
          <div className="pm-form-brand">
            <div className="pm-logo" aria-hidden="true">
              T
            </div>

            <h2>
              TechFlow <span>ERP</span>
            </h2>
          </div>

          {/* Welcome */}
          <div className="pm-welcome">
            <span>WELCOME BACK</span>

            <h1>Project Manager Login</h1>

            <p>
              Manage your projects. Empower your team.
              Deliver results.
            </p>
          </div>

          {/* Login Form */}
          <form
            className="pm-login-form"
            onSubmit={handleLogin}
            aria-busy={loading}
          >
            {/* Email */}
            <div className="pm-input-group">
              <label htmlFor="pm-email">
                Email address
              </label>

              <div className="pm-input-box">
                <span aria-hidden="true">✉</span>

                <input
                  id="pm-email"
                  name="email"
                  type="email"
                  placeholder="projectmanager@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="pm-input-group">
              <label htmlFor="pm-password">
                Password
              </label>

              <div className="pm-input-box">
                <span aria-hidden="true">♙</span>

                <input
                  id="pm-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="pm-show-password"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="pm-form-options">
              <label className="pm-remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  disabled={loading}
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="pm-forgot"
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                className="pm-error-message"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            {/* Sign In */}
            <button
              type="submit"
              className="pm-signin-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="pm-spinner"
                    aria-hidden="true"
                  ></span>
                  Signing in...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="pm-or">
            <span></span>
            or
            <span></span>
          </div>

          {/* Secure Access */}
          <div className="pm-secure">
            <span aria-hidden="true">⬟</span>
            Secure Access
          </div>

          <p className="pm-workspace-text">
            Your projects, all in one place.
          </p>

          {/* Footer */}
          <footer className="pm-footer">
            © 2026 TechFlow ERP. All rights reserved.
          </footer>
        </section>
      </div>
    </main>
  );
}

export default Projectmanagerlogin;
