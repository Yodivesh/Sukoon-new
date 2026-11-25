import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { getCurrentLocalUser, logoutLocalUser, type LocalUser } from "@/lib/local-auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/playlist", label: "Playlist" },
  { to: "/download", label: "Download" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
    setUser(getCurrentLocalUser());
  }, [pathname]);

  const authLink = user
    ? user.role === "admin"
      ? { to: "/admin", label: "Admin" }
      : null
    : { to: "/login", label: "Log in" };

  const handleLogout = () => {
    logoutLocalUser();
    setUser(null);
    setOpen(false);
  };

  return (
    <header className="sk-nav">
      <nav className="sk-container" aria-label="Main navigation">
        <div className="sk-nav-inner">
          <Link to="/" className="sk-logo" aria-label="Sukoon home">
            <span className="sk-logo-mark" aria-hidden="true">
              S
            </span>
            <span>
              <span className="sk-logo-text">SUKOON</span>
              <span className="sk-logo-sub">Your mood. Your music.</span>
            </span>
          </Link>

          <div className="sk-nav-links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`sk-nav-link ${pathname === link.to ? "is-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            {authLink ? (
              <Link
                to={authLink.to}
                className={`sk-nav-link ${pathname === authLink.to ? "is-active" : ""}`}
              >
                {authLink.label}
              </Link>
            ) : null}
            {user ? (
              <button type="button" className="sk-nav-link sk-nav-logout" onClick={handleLogout}>
                Log out
              </button>
            ) : (
              <Link to="/signup" className="sk-nav-link">
                Sign up
              </Link>
            )}
            <Link to="/" hash="find-my-vibe" className="sk-btn sk-btn-primary sk-btn-sm">
              <Sparkles size={16} aria-hidden="true" /> Find My Vibe
            </Link>
          </div>

          <button
            type="button"
            className="sk-btn sk-btn-ghost sk-btn-icon sk-nav-toggle"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        <div className={`sk-nav-mobile ${open ? "is-open" : ""}`}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sk-nav-link ${pathname === link.to ? "is-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {authLink ? (
            <Link to={authLink.to} className="sk-nav-link">
              {authLink.label}
            </Link>
          ) : null}
          {user ? (
            <button type="button" className="sk-nav-link sk-nav-logout" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <Link to="/signup" className="sk-nav-link">
              Sign up
            </Link>
          )}
          <Link to="/" hash="find-my-vibe" className="sk-btn sk-btn-primary sk-btn-sm">
            <Sparkles size={16} aria-hidden="true" /> Find My Vibe
          </Link>
        </div>
      </nav>
    </header>
  );
}
