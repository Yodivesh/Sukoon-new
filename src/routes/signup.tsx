import { useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { registerLocalUser, type UserRole } from "@/lib/local-auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account | Sukoon" },
      { name: "description", content: "Create a local Sukoon demo account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await registerLocalUser(email, password, role);
      void navigate({ to: user.role === "admin" ? "/admin" : "/playlist" });
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : "Unable to create account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sk-container">
      <section className="sk-auth-section">
        <div className="sk-auth-copy">
          <span className="sk-eyebrow">Make it yours</span>
          <h1 className="sk-h1">
            Find your <span className="sk-gradient-text">Sukoon.</span>
          </h1>
          <p className="sk-lead">
            Create an account to keep your saved songs and favourite moods close.
          </p>
        </div>

        <form className="sk-panel sk-auth-form" onSubmit={handleSubmit}>
          <div className="sk-auth-heading">
            <span className="sk-auth-icon" aria-hidden="true">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="sk-h2">Sign up</h2>
              <p className="sk-muted">A little space that feels like yours.</p>
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
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </span>
          </label>

          <label className="sk-field">
            <span>Confirm password</span>
            <span className="sk-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                className="sk-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </span>
          </label>

          <label className="sk-field">
            <span>Create account as</span>
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
            {isSubmitting ? "Creating account..." : "Create account"}{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <p className="sk-auth-note">
            Already registered? <Link to="/login">Log in</Link>
          </p>
          <p className="sk-auth-demo">
            Demo mode only: anyone using this browser can create an admin account. User records are
            not shared across devices and this is not secure authentication.
          </p>
        </form>
      </section>
    </div>
  );
}
