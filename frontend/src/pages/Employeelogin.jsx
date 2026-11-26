
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import employeeHero from "../assets/techflow-employee-hero.png";
import "./EmployeeLogin.css";

const API_URL = "http://localhost:5000/api/auth/login";

function EmployeeLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: localStorage.getItem("employeeEmail") || "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(
    Boolean(localStorage.getItem("employeeEmail"))
  );

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [theme, setTheme] = useState(
    localStorage.getItem("employeeLoginTheme") || "light"
  );

  // Save selected theme
  useEffect(() => {
    localStorage.setItem("employeeLoginTheme", theme);
  }, [theme]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Handle employee login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Invalid email or password."
        );
      }

      if (!result.user || !result.token) {
        throw new Error(
          "Invalid server response. Please try again."
        );
      }

      // Only employees can access this portal
      if (result.user.role !== "employee") {
        throw new Error(
          "Access denied. Please use the correct login portal."
        );
      }

      // Clear previous login information
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Store login information
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("token", result.token);
      storage.setItem("user", JSON.stringify(result.user));

      // Remember email if selected
      if (rememberMe) {
        localStorage.setItem("employeeEmail", email);
      } else {
        localStorage.removeItem("employeeEmail");
      }

      // Navigate to employee dashboard
      navigate("/employee/dashboard", { replace: true });

    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = () => {
    setMessage(
      "Please contact your HR or system administrator to reset your password."
    );
  };

  // Contact admin
  const handleContactAdmin = () => {
    setMessage(
      "Please contact your HR or system administrator for login assistance."
    );
  };

  return (
    <main className="employee-login-page" data-theme={theme}>
      <div className="employee-login-wrapper">

        {/* LEFT LOGIN PANEL */}
        <section className="employee-form-section">
          <div className="employee-login-card">

            {/* BRAND */}
            <div className="employee-login-brand">
              <div className="employee-brand-logo">
                <span>T</span>
              </div>

              <div className="employee-brand-details">
                <h2>
                  TechFlow <span>ERP</span>
                </h2>

                <p>
                  Work Smarter <span>•</span> Grow Together
                  <span>•</span> Achieve More
                </p>
              </div>
            </div>

            {/* HEADING */}
            <div className="employee-login-intro">
              <span className="employee-portal-label">
                EMPLOYEE PORTAL
              </span>

              <h1>Welcome Back!</h1>

              <p>
                Sign in to your employee account to continue.
              </p>
            </div>

            {/* LOGIN FORM */}
            <form
              onSubmit={handleSubmit}
              className="employee-login-form"
            >

              {/* EMAIL */}
              <div className="employee-input-group">
                <label htmlFor="employee-email">
                  <svg viewBox="0 0 24 24">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="m3 7 9 7 9-7" />
                  </svg>

                  Email Address
                </label>

                <div className="employee-input-wrapper">
                  <input
                    id="employee-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="employee-input-group">
                <label htmlFor="employee-password">
                  <svg viewBox="0 0 24 24">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>

                  Password
                </label>

                <div className="employee-input-wrapper">
                  <input
                    id="employee-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="employee-password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24">
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.4 3.3" />
                        <path d="M6.2 6.2C3.8 7.7 2.5 10 2 12c1 2.5 4.5 7 10 7 1 0 2-.2 2.9-.5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="employee-login-options">
                <label className="employee-remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                  />

                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="employee-forgot-button"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div
                  className="employee-error-message"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* INFO MESSAGE */}
              {message && (
                <div
                  className="employee-info-message"
                  role="status"
                >
                  {message}
                </div>
              )}

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                className="employee-signin-button"
                disabled={loading}
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* DIVIDER */}
            <div className="employee-login-divider">
              <span>or</span>
            </div>

            {/* CONTACT ADMIN */}
            <button
              type="button"
              className="employee-contact-button"
              onClick={handleContactAdmin}
            >
              <svg viewBox="0 0 24 24">
                <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
                <rect x="3" y="12" width="4" height="7" rx="2" />
                <rect x="17" y="12" width="4" height="7" rx="2" />
                <path d="M17 19c-1 2-3 2-5 2" />
              </svg>

              Contact Admin
            </button>

            {/* FOOTER */}
            <footer className="employee-login-footer">
              © 2026 TechFlow ERP. All rights reserved.
            </footer>

          </div>
        </section>

        {/* RIGHT HERO PANEL */}
        <section className="employee-hero-section">

          <img
            src={employeeHero}
            alt="Empowering Your Work Journey"
            className="employee-hero-image"
          />

          {/* THEME TOGGLE */}
          <div className="employee-theme-toggle">

            <button
              type="button"
              className={theme === "light" ? "active" : ""}
              onClick={toggleTheme}
              aria-label={
                theme === "light" ? "Light mode" : "Switch theme"
              }
              title="Toggle theme"
            >
              ☼
            </button>

            <button
              type="button"
              className={theme === "dark" ? "active" : ""}
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Dark mode" : "Switch theme"
              }
              title="Toggle theme"
            >
              ☾
            </button>

          </div>
        </section>

      </div>
    </main>
  );
}

export default EmployeeLogin;
