
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeLogin.css";

const API_URL = "http://localhost:5000/api/auth/login";
const EMPLOYEE_HOME = "/employee/dashboard";

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

  // Theme state
  const [theme, setTheme] = useState(
    localStorage.getItem("employeeLoginTheme") || "dark"
  );

  useEffect(() => {
    localStorage.setItem("employeeLoginTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previous) =>
      previous === "dark" ? "light" : "dark"
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email address and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Invalid email address or password."
        );
      }

      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      // Remember email only, never password.
      if (rememberMe) {
        localStorage.setItem(
          "employeeEmail",
          formData.email.trim()
        );
      } else {
        localStorage.removeItem("employeeEmail");
      }

      navigate(EMPLOYEE_HOME);

    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setMessage(
      "Please contact your administrator to reset your password."
    );
  };

  const handleContactAdmin = () => {
    setMessage(
      "Please contact your HR department or system administrator for assistance."
    );
  };

  return (
    <div
      className="employee-login-page"
      data-theme={theme}
    >
      <div className="employee-background-glow glow-one"></div>
      <div className="employee-background-glow glow-two"></div>

      <main className="employee-login-wrapper">

        {/* LEFT SECTION */}

        <section className="employee-hero-section">

          <div className="employee-brand">
            <div className="brand-symbol">T</div>

            <div className="brand-name">
              <span>TechFlow</span>
              <strong>ERP</strong>
            </div>
          </div>

          <div className="employee-tagline">
            Work Smarter
            <span>•</span>
            Grow Together
            <span>•</span>
            Achieve More
          </div>

          <div className="employee-portal-badge">
            <span className="online-dot"></span>
            Employee Portal – Your Work, Our Priority
          </div>

          <div className="employee-hero-content">

            <div className="employee-hero-text">

              <h1>
                Welcome Back!
                <span>Employee.</span>
                Let's Achieve More.
              </h1>

              <p>
                Access your tasks, track your progress,
                and be a part of our growing team.
              </p>

              <div className="employee-benefits">

                <div className="benefit-item">
                  <div className="benefit-icon">✓</div>

                  <div>
                    <h4>View Your Tasks</h4>
                    <span>
                      Stay on top of your assignments.
                    </span>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">▥</div>

                  <div>
                    <h4>Track Your Progress</h4>
                    <span>
                      Monitor your goals and performance.
                    </span>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">♛</div>

                  <div>
                    <h4>Grow Your Career</h4>
                    <span>
                      Unlock new opportunities.
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* EMPLOYEE ILLUSTRATION */}

            <div className="employee-illustration">

              <div className="illustration-orbit"></div>

              <div className="floating-card task-floating-card">
                <h4>My Tasks</h4>
                <p>✓ Complete Report</p>
                <p>✓ Team Meeting</p>
                <p>✓ Project Update</p>
              </div>

              <div className="floating-card progress-floating-card">
                <h4>My Progress</h4>

                <div className="progress-circle">
                  <span>75%</span>
                </div>
              </div>

              <div className="floating-card team-floating-card">
                <h4>Team Activity</h4>

                <div className="team-avatars">
                  <span>👨🏻</span>
                  <span>👩🏻</span>
                  <span>👨🏽</span>
                  <b>+5</b>
                </div>
              </div>

              <div className="employee-plant">🌿</div>

              <div className="employee-character">

                <div className="character-head">
                  <div className="character-hair"></div>

                  <div className="character-eyes">
                    <span></span>
                    <span></span>
                  </div>

                  <div className="character-smile"></div>
                </div>

                <div className="character-body">
                  <span>T</span>
                </div>

              </div>

              <div className="employee-laptop">
                <div className="laptop-screen">
                  <span>T</span>
                </div>

                <div className="laptop-base"></div>
              </div>

              <div className="illustration-platform"></div>

            </div>

          </div>

          <div className="employee-hero-footer">
            <strong>TechFlow ERP</strong>
            <span>•</span>
            Employee Portal
            <div></div>
          </div>

        </section>

        {/* RIGHT SECTION */}

        <section className="employee-form-section">

          <div className="employee-login-card">

            {/* WORKING THEME BUTTON */}

            <button
              type="button"
              className="employee-theme-decoration"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
            >
              <span>
                {theme === "dark" ? "☀" : "☾"}
              </span>

              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            <div className="login-brand">
              <div className="brand-symbol">T</div>

              <div className="brand-name">
                <span>TechFlow</span>
                <strong>ERP</strong>
              </div>
            </div>

            <div className="login-divider-heading">
              <span></span>
              EMPLOYEE PORTAL
              <span></span>
            </div>

            <div className="login-heading">
              <h2>Welcome Back!</h2>

              <p>
                Sign in to your employee account to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}

              <div className="employee-input-group">

                <label htmlFor="employee-email">
                  Email Address
                </label>

                <div className="employee-input-wrapper">
                  <span className="input-icon">✉</span>

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
                  Password
                </label>

                <div className="employee-input-wrapper">
                  <span className="input-icon">♙</span>

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
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* LOGIN OPTIONS */}

              <div className="employee-login-options">

                <label className="remember-option">
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
                  className="forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>

              </div>

              {error && (
                <div className="employee-error" role="alert">
                  {error}
                </div>
              )}

              {message && (
                <div className="employee-message" role="status">
                  {message}
                </div>
              )}

              {/* SIGN IN */}

              <button
                type="submit"
                className="employee-signin-button"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In →"}
              </button>

            </form>

            <div className="employee-or-divider">
              <span></span>
              or
              <span></span>
            </div>

            <button
              type="button"
              className="contact-admin-button"
              onClick={handleContactAdmin}
            >
              <span>♧</span>
              Contact Admin
            </button>

            <div className="employee-login-footer">
              © 2026 TechFlow ERP. All rights reserved.
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default EmployeeLogin;
