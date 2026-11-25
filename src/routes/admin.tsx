import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Trash2, Users } from "lucide-react";
import {
  getCurrentLocalUser,
  listLocalUsers,
  logoutLocalUser,
  removeLocalUser,
  type LocalUser,
} from "@/lib/local-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Sukoon" },
      { name: "description", content: "Manage accounts in this browser's Sukoon demo." },
    ],
  }),
  component: AdminPage,
});

function formatLastActive(date: string | null): string {
  return date ? new Date(date).toLocaleString() : "Never";
}

function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const currentUser = getCurrentLocalUser();
      if (!currentUser || currentUser.role !== "admin") {
        void navigate({ to: "/login" });
        return;
      }

      setCurrentUserId(currentUser.id);
      setUsers(listLocalUsers());
      setIsReady(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load local accounts.");
      setIsReady(true);
    }
  }, [navigate]);

  const handleRemove = (user: LocalUser) => {
    if (!window.confirm(`Remove ${user.email} from this browser's Sukoon demo?`)) return;

    try {
      removeLocalUser(user.id);
      setUsers(listLocalUsers());
      setError("");
    } catch (removeError) {
      setError(
        removeError instanceof Error ? removeError.message : "Unable to remove this account.",
      );
    }
  };

  if (!isReady) {
    return (
      <div className="sk-container">
        <section className="sk-section">
          <p className="sk-muted">Checking admin access...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="sk-container">
      <section className="sk-section">
        <div className="sk-admin-heading">
          <div>
            <span className="sk-eyebrow">Admin dashboard</span>
            <h1 className="sk-h1">Local accounts.</h1>
            <p className="sk-lead">Review accounts and their most recent login in this browser.</p>
          </div>
          <span className="sk-admin-count">
            <Users size={18} aria-hidden="true" /> {users.length}{" "}
            {users.length === 1 ? "account" : "accounts"}
          </span>
        </div>

        <p className="sk-admin-warning" role="note">
          Demo only: this list is stored in this browser. It does not show real-time users or
          accounts on other devices, and admin roles are not protected by a server.
        </p>

        {error ? (
          <p className="sk-auth-error" role="alert">
            {error}
          </p>
        ) : null}

        {users.length ? (
          <div className="sk-admin-list">
            {users.map((user) => (
              <article className="sk-panel sk-admin-user" key={user.id}>
                <div className="sk-admin-user-details">
                  <span className="sk-admin-user-icon" aria-hidden="true">
                    {user.role === "admin" ? <ShieldCheck size={19} /> : <Users size={19} />}
                  </span>
                  <div>
                    <h2 className="sk-admin-email">{user.email}</h2>
                    <p className="sk-muted">
                      {user.role === "admin" ? "Admin" : "User"} · Last login:{" "}
                      {formatLastActive(user.lastLoginAt)}
                    </p>
                  </div>
                </div>
                {user.id === currentUserId ? (
                  <span className="sk-admin-current">You</span>
                ) : (
                  <button
                    type="button"
                    className="sk-btn sk-btn-ghost sk-admin-remove"
                    onClick={() => handleRemove(user)}
                    aria-label={`Remove ${user.email}`}
                  >
                    <Trash2 size={16} aria-hidden="true" /> Remove
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="sk-panel sk-admin-empty">
            <p>No accounts are registered in this browser yet.</p>
          </div>
        )}

        <button
          type="button"
          className="sk-btn sk-btn-ghost sk-admin-logout"
          onClick={() => {
            logoutLocalUser();
            void navigate({ to: "/login" });
          }}
        >
          Log out
        </button>
      </section>
    </div>
  );
}
