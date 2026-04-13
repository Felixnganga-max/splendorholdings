import { useState } from "react";

const API_BASE = "http://localhost:5000/api/v1";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      const { accessToken, user } = data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "admin" || user.role === "manager") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      const { accessToken, user } = data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "login") handleLogin();
    else handleRegister();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Jost', sans-serif;
          background: #0a0a0a;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 56px;
          background: #0e0e0e;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(180,148,90,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(180,148,90,0.07) 0%, transparent 60%);
          pointer-events: none;
        }

        .auth-left-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(180,148,90,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,148,90,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .auth-brand {
          position: relative;
          z-index: 1;
        }

        .auth-brand-mark {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 0;
        }

        .auth-brand-icon {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(180,148,90,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        .auth-brand-icon span {
          display: block;
          width: 14px;
          height: 14px;
          background: #b4945a;
          transform: rotate(0deg);
        }

        .auth-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 400;
          letter-spacing: 0.18em;
          color: #e8dcc8;
          text-transform: uppercase;
        }

        .auth-left-hero {
          position: relative;
          z-index: 1;
        }

        .auth-left-eyebrow {
          font-size: 10px;
          letter-spacing: 0.3em;
          color: #b4945a;
          text-transform: uppercase;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .auth-left-eyebrow::before {
          content: '';
          display: block;
          width: 32px;
          height: 1px;
          background: #b4945a;
        }

        .auth-left-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 54px;
          font-weight: 300;
          line-height: 1.1;
          color: #e8dcc8;
          margin-bottom: 28px;
        }

        .auth-left-headline em {
          font-style: italic;
          color: #b4945a;
        }

        .auth-left-sub {
          font-size: 13px;
          font-weight: 300;
          color: rgba(232,220,200,0.45);
          line-height: 1.8;
          max-width: 320px;
          letter-spacing: 0.02em;
        }

        .auth-left-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .auth-left-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auth-left-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: #e8dcc8;
        }

        .auth-left-stat-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(232,220,200,0.35);
          text-transform: uppercase;
        }

        .auth-left-divider {
          width: 1px;
          height: 36px;
          background: rgba(180,148,90,0.2);
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 52px 64px;
          background: #111111;
          position: relative;
        }

        .auth-right::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 1px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(180,148,90,0.3) 30%, rgba(180,148,90,0.3) 70%, transparent);
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 400px;
        }

        .auth-form-header {
          margin-bottom: 44px;
        }

        .auth-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 300;
          color: #e8dcc8;
          margin-bottom: 10px;
          letter-spacing: 0.02em;
        }

        .auth-form-sub {
          font-size: 12px;
          font-weight: 300;
          color: rgba(232,220,200,0.4);
          letter-spacing: 0.08em;
        }

        /* Tab switcher */
        .auth-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 40px;
          border-bottom: 1px solid rgba(180,148,90,0.15);
        }

        .auth-tab {
          flex: 1;
          padding: 12px 0;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(232,220,200,0.3);
          background: none;
          border: none;
          border-bottom: 1px solid transparent;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-bottom: -1px;
        }

        .auth-tab.active {
          color: #b4945a;
          border-bottom-color: #b4945a;
        }

        .auth-tab:hover:not(.active) {
          color: rgba(232,220,200,0.6);
        }

        /* Fields */
        .auth-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .auth-field {
          margin-bottom: 20px;
        }

        .auth-label {
          display: block;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(232,220,200,0.4);
          margin-bottom: 10px;
        }

        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(180,148,90,0.15);
          padding: 13px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #e8dcc8;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          border-radius: 0;
          -webkit-appearance: none;
        }

        .auth-input::placeholder {
          color: rgba(232,220,200,0.18);
        }

        .auth-input:focus {
          border-color: rgba(180,148,90,0.5);
          background: rgba(180,148,90,0.04);
        }

        /* Error */
        .auth-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(220,80,60,0.08);
          border-left: 2px solid rgba(220,80,60,0.5);
          margin-bottom: 24px;
          font-size: 12px;
          color: rgba(255,160,140,0.85);
          font-weight: 300;
          letter-spacing: 0.03em;
          animation: slideIn 0.2s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Submit button */
        .auth-submit {
          width: 100%;
          padding: 16px;
          background: #b4945a;
          border: none;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #0a0a0a;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }

        .auth-submit:hover:not(:disabled) {
          background: #c9a96e;
        }

        .auth-submit:active:not(:disabled) {
          transform: scale(0.995);
        }

        .auth-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-submit-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .auth-spinner {
          width: 14px;
          height: 14px;
          border: 1.5px solid rgba(10,10,10,0.3);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-switch {
          text-align: center;
          margin-top: 28px;
          font-size: 12px;
          font-weight: 300;
          color: rgba(232,220,200,0.3);
          letter-spacing: 0.05em;
        }

        .auth-switch button {
          background: none;
          border: none;
          color: #b4945a;
          cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          font-weight: 400;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s;
        }

        .auth-switch button:hover {
          color: #c9a96e;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .auth-root {
            grid-template-columns: 1fr;
          }
          .auth-left {
            display: none;
          }
          .auth-right {
            padding: 48px 32px;
          }
          .auth-right::before { display: none; }
        }

        @media (max-width: 480px) {
          .auth-right { padding: 40px 24px; }
          .auth-row { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>

      <div className="auth-root">
        {/* ── LEFT ── */}
        <div className="auth-left">
          <div className="auth-left-grid" />

          <div className="auth-brand">
            <div className="auth-brand-mark">
              <div className="auth-brand-icon">
                <span />
              </div>
              <span className="auth-brand-name">Splendor</span>
            </div>
          </div>

          <div className="auth-left-hero">
            <div className="auth-left-eyebrow">Premium Real Estate</div>
            <h1 className="auth-left-headline">
              Find Your
              <br />
              <em>Perfect</em>
              <br />
              Residence
            </h1>
            <p className="auth-left-sub">
              Curated properties across Kenya's most prestigious locations.
              Exceptional living, exclusively presented.
            </p>
          </div>

          <div className="auth-left-footer">
            <div className="auth-left-stat">
              <span className="auth-left-stat-num">340+</span>
              <span className="auth-left-stat-label">Active listings</span>
            </div>
            <div className="auth-left-divider" />
            <div className="auth-left-stat">
              <span className="auth-left-stat-num">12yr</span>
              <span className="auth-left-stat-label">Market presence</span>
            </div>
            <div className="auth-left-divider" />
            <div className="auth-left-stat">
              <span className="auth-left-stat-num">98%</span>
              <span className="auth-left-stat-label">Client satisfaction</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <h2 className="auth-form-title">
                {mode === "login" ? "Welcome back." : "Create account."}
              </h2>
              <p className="auth-form-sub">
                {mode === "login"
                  ? "Sign in to access your account"
                  : "Join Slendor to explore premium listings"}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {mode === "register" && (
                <div className="auth-row">
                  <div className="auth-field">
                    <label className="auth-label">First name</label>
                    <input
                      className="auth-input"
                      name="firstName"
                      type="text"
                      placeholder="James"
                      value={form.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Last name</label>
                    <input
                      className="auth-input"
                      name="lastName"
                      type="text"
                      placeholder="Kariuki"
                      value={form.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <input
                  className="auth-input"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  className="auth-input"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </div>

              {mode === "register" && (
                <div className="auth-field">
                  <label className="auth-label">Confirm password</label>
                  <input
                    className="auth-input"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
              )}

              {error && (
                <div className="auth-error">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      stroke="rgba(220,80,60,0.7)"
                      strokeWidth="1"
                    />
                    <path
                      d="M7 4v3.5M7 9.5v.5"
                      stroke="rgba(255,160,140,0.85)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <button className="auth-submit" type="submit" disabled={loading}>
                <span className="auth-submit-inner">
                  {loading && <span className="auth-spinner" />}
                  {loading
                    ? "Please wait…"
                    : mode === "login"
                      ? "Sign In"
                      : "Create Account"}
                </span>
              </button>
            </form>

            <p className="auth-switch">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
