import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiFetch("/api/v1/profile/", {}, token)
      .then(setProfile)
      .catch(() => setError("Unable to load profile."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section className="px-8 py-12 space-y-6 fade-in">
      <h2 className="font-heading text-4xl text-sage">User Profile</h2>
      {!token && (
        <p className="text-ink/70">
          <Link to="/login" className="underline text-sage">Sign in</Link> to view your profile.
        </p>
      )}
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {loading && <div className="loader" />}
      {profile && (
        <div className="card space-y-2">
          <p className="text-ink/80">Name: {user?.full_name || "Member"}</p>
          <p className="text-ink/80">Email: {user?.email}</p>
          <p className="text-ink/80">Role: {user?.role || "user"}</p>
          <p className="text-ink/80">Dosha: {profile.dosha?.primary_dosha || "Not set"}</p>
          {profile.dosha && (
            <p className="text-ink/70">
              Vata {profile.dosha.vata}, Pitta {profile.dosha.pitta}, Kapha {profile.dosha.kapha}
            </p>
          )}
          <p className="text-ink/80">Total sessions: {profile.stats.total_sessions}</p>
          <p className="text-ink/80">Total minutes: {profile.stats.total_minutes}</p>
          <p className="text-ink/80">Streak: {profile.stats.streak_days} days</p>
        </div>
      )}
    </section>
  );
}
