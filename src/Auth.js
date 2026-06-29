import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleAuth(e) {
    e.preventDefault();
    setMessage("");

    if (isSignUp && password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      setMessage(error ? error.message : "Account created. Check your email if confirmation is required.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error ? error.message : "Logged in!");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/stacked.png" alt="Degeneracy Tracker logo" className="app-logo" />

        <h1>Stacked</h1>
        <p className="auth-subtitle">
          Track profits and losses from your poker sessions with your friends.
        </p>

        <form onSubmit={handleAuth} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            minLength="8"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-primary-btn">
            {isSignUp ? "Create Account" : "Log In"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <button
          className="auth-switch"
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>

        <div className="install-card">
          <h3>Add this app to your phone</h3>
          <p><strong>iPhone:</strong> Open this site in Safari, tap Share, then tap <strong>Add to Home Screen</strong>.</p>
          <p><strong>Android:</strong> Open this site in Chrome, tap the menu, then tap <strong>Install app</strong>.</p>
          <p className="install-note">After installing, it opens like a normal app.</p>
        </div>
      </div>
    </div>
  );
}