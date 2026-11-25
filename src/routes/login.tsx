import { FormEvent, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { loginLocalUser, type UserRole } from "@/lib/local-auth";

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
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await loginLocalUser(email, password, role);
      void navigate({ to: user.role === "admin" ? "/admin" : "/playlist" });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Unable to log in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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

          <label className="sk-field">
            <span>Log in as</span>
            <select
              className="sk-input sk-select"
              value={role}
              onChange={(event) => setRole(event.target.value === "admin" ? "admin" : "user")}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {error ? (
            <p className="sk-auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="sk-btn sk-btn-primary sk-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log in"} <ArrowRight size={16} aria-hidden="true" />
          </button>
          <p className="sk-auth-note">
            New here? <Link to="/signup">Create an account</Link>
          </p>
          <p className="sk-auth-demo">
            Demo mode: accounts and roles are stored only in this browser and are not secure
            authentication.
          </p>
        </form>
      </section>
    </div>
  );
}
