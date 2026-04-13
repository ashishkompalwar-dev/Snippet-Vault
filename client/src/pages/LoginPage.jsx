import React from "react";
import { Link } from "react-router-dom";

function LoginPage({
  user,
  authMode,
  setAuthMode,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authLoading,
  authMessage,
  submitAuth,
  logout,
}) {
  return (
    <section className="page">
      <div className="section-head">
        <h2>Login and signup</h2>
      </div>

      {user ? (
        <div className="panelish account-box">
          <p className="account-name">{user.name}</p>
          <p>{user.email}</p>
          <div className="section-actions">
            <Link to="/create" className="primary link-btn">
              Go to create
            </Link>
            <button className="ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submitAuth} className="panelish auth-form">
          <div className="tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={authMode === "signin" ? "tab active" : "tab"}
              onClick={() => setAuthMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={authMode === "signup" ? "tab active" : "tab"}
              onClick={() => setAuthMode("signup")}
            >
              Sign up
            </button>
          </div>

          {authMode === "signup" && (
            <>
              <label htmlFor="auth-name">Name</label>
              <input
                id="auth-name"
                value={authName}
                onChange={(event) => setAuthName(event.target.value)}
                placeholder="Your name"
              />
            </>
          )}

          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            value={authEmail}
            onChange={(event) => setAuthEmail(event.target.value)}
            placeholder="you@example.com"
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            value={authPassword}
            onChange={(event) => setAuthPassword(event.target.value)}
            placeholder="Enter password"
          />

          <button className="primary" type="submit" disabled={authLoading}>
            {authLoading ? "Please wait..." : authMode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      )}

      {authMessage && <p className="auth-message">{authMessage}</p>}
    </section>
  );
}

export default LoginPage;
