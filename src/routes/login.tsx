import { FormEvent, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in | Sukoon" },
      { name: "description", content: "Log in to keep your Sukoon playlist close." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    window.localStorage.setItem("sukoon_logged_in", "true");
    window.localStorage.setItem("sukoon_user_email", email);
    void navigate({ to: "/playlist" });
  };

  return (
    <div className="sk-container">
      <section className="sk-auth-section">
        <div className="sk-auth-copy">
          <span className="sk-eyebrow">Welcome back</span>
          <h1 className="sk-h1">
            Return to your <span className="sk-gradient-text">Sukoon.</span>
          </h1>
          <p className="sk-lead">
            Log in to keep your saved songs and favourite moods close wherever you return.
          </p>
        </div>

        <form className="sk-panel sk-auth-form" onSubmit={handleSubmit}>
          <div className="sk-auth-heading">
            <span className="sk-auth-icon" aria-hidden="true">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h2 className="sk-h2">Log in</h2>
              <p className="sk-muted">Your quiet corner is waiting.</p>
            </div>
          </div>

          <label className="sk-field">
            <span>Email address</span>
            <span className="sk-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input
                className="sk-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label className="sk-field">
            <span>Password</span>
            <span className="sk-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                className="sk-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </span>
          </label>

          {error ? (
            <p className="sk-auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="sk-btn sk-btn-primary sk-auth-submit">
            Log in <ArrowRight size={16} aria-hidden="true" />
          </button>
          <p className="sk-auth-note">
            New here? <Link to="/">Explore Sukoon first</Link>
          </p>
          <p className="sk-auth-demo">Demo mode: this stores a local browser session only.</p>
        </form>
      </section>
    </div>
  );
}