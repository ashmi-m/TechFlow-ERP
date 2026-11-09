
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const TEAM_IMAGE =
  "https://res.cloudinary.com/dmnfj34up/image/upload/v1792861507/Graphic_Mockup_Right_of_Left_Column.png";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Dark mode is enabled by default
  const [darkMode, setDarkMode] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login using the backend API
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
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();
console.log("LOGIN DATA:", data);
console.log("Logged-in role:", data.user?.role);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      // Validate user role before storing login information
      const role = data.user?.role;

     const roleRoutes = {
  admin: "/dashboard",
  project_manager: "/project-manager/dashboard",
  employee: "/employee/dashboard",
};

      if (!roleRoutes[role]) {
        throw new Error(
          "Invalid user role. Please contact the administrator."
        );
      }

      // Save login information
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      // Remove old login information from the other storage
      otherStorage.removeItem("token");
      otherStorage.removeItem("user");

      // Redirect users based on their role
      navigate(roleRoutes[role], { replace: true });

    } catch (err) {
      console.error("Login error:", err);

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

        {/* LEFT PANEL */}
        <section className="login-intro">

          {/* BRAND HEADER */}
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

            <p className="brand-tagline">
              Work Smarter <span>•</span> Build Together <span>•</span> Grow Faster
            </p>
          </header>

          {/* INTRO CONTENT */}
          <div className="intro-content">

            <div className="intro-badge">
              <span className="status-dot"></span>
              One workspace. Endless possibilities.
            </div>

            <h1>
              Your Team.
              <br />
              Your Projects.
              <br />
              <span>All in One Place.</span>
            </h1>

            <p className="intro-description">
              Simplify your workflow with{" "}
              <strong>TechFlow ERP.</strong> Manage employees,
              track projects, and bring your entire team together.
            </p>

            {/* FEATURES */}
            <div className="feature-list">

              <article className="feature-item">
                <div className="feature-icon" aria-hidden="true">
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
                  <h3>Manage Employees</h3>
                  <p>Organize teams, roles and departments.</p>
                </div>
              </article>

              <article className="feature-item">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3.5"
                      y="4"
                      width="17"
                      height="16"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 2.8v3M16 2.8v3M3.5 9h17M8 13h3M8 16h6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <h3>Track Projects</h3>
                  <p>Monitor milestones, progress and deadlines.</p>
                </div>
              </article>

              <article className="feature-item">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 17.5 9 12l3.5 3.5L20 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.5 7H20v5.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <h3>Boost Productivity</h3>
                  <p>Collaborate better and get more done.</p>
                </div>
              </article>

            </div>
          </div>

          {/* TEAM ILLUSTRATION */}
          <div className="illustration-decoration" aria-hidden="true">
            <div className="decoration-orbit orbit-one"></div>
            <div className="decoration-orbit orbit-two"></div>
          </div>

          <div className="team-illustration">
            <img
              src={TEAM_IMAGE}
              alt="Team collaborating on projects"
              className="team-image"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="illustration-caption">
            <span>Better</span>
            <span>Together</span>
            <span className="caption-underline"></span>
          </div>

          {/* LEFT FOOTER */}
          <div className="intro-footer">
            <span className="footer-dot"></span>
            Designed for teams that move forward.
          </div>

        </section>

        {/* RIGHT PANEL */}
        <section className="login-form-section">

          {/* THEME TOGGLE */}
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDarkMode((previous) => !previous)}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          >
            <span aria-hidden="true">
              {darkMode ? "☀" : "☾"}
            </span>

            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <div className="form-content">

            {/* BRAND */}
            <div className="form-brand">
              <div className="form-brand-icon">T</div>

              <h2>
                TechFlow <span>ERP</span>
              </h2>
            </div>

            {/* WELCOME */}
            <div className="welcome-section">
              <div className="welcome-badge">WELCOME BACK</div>

              <h3>Welcome Back!</h3>

              <p className="form-subtitle">
                Sign in to your account to continue.
              </p>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleSubmit} className="login-form">

              {/* EMAIL */}
              <div className="form-group">
                <label htmlFor="email">Email address</label>

                <div className="input-field">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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

              {/* PASSWORD */}
              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="input-field">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="15.5"
                      r="1.2"
                      fill="currentColor"
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

              {/* FORM OPTIONS */}
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
                  Forgot password?
                </button>

              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}

              {/* SIGN IN */}
              <button
                className="sign-in-button"
                type="submit"
                disabled={loading}
              >
                <span>
                  {loading ? "Signing in..." : "Sign In"}
                </span>

                {!loading && (
                  <span className="sign-in-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </button>

              <p className="secure-note">
                Your workspace, all in one place.
              </p>

            </form>

            {/* SOCIAL LOGIN */}
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
              </button>

              <button
                type="button"
                aria-label="Microsoft login"
                onClick={() =>
                  alert("Microsoft authentication will be added later.")
                }
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" fill="#F35325" />
                  <rect x="13" y="3" width="8" height="8" fill="#81BC06" />
                  <rect x="3" y="13" width="8" height="8" fill="#05A6F0" />
                  <rect x="13" y="13" width="8" height="8" fill="#FFBA08" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="GitHub login"
                onClick={() =>
                  alert("GitHub authentication will be added later.")
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.75-1.31-3.75-1.31-.5-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 1.7 2.62 1.21 3.26.92.1-.72.39-1.21.71-1.49-2.47-.28-5.07-1.24-5.07-5.51 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.28-2.61 5.22-5.09 5.5.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                </svg>
              </button>

            </div>

            {/* COPYRIGHT */}
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
