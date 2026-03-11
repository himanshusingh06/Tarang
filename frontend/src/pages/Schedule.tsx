import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function Schedule() {
  const { token } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const date = new Date().toISOString().slice(0, 10);
    setLoading(true);
    apiFetch<any>("/api/v1/scheduler/daily", {
      method: "POST",
      body: JSON.stringify({ date })
    }, token)
      .then((data) => setItems(data.items || []))
      .catch(() => setError("Unable to build schedule."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section className="px-8 py-12 space-y-6 fade-in">
      <h2 className="font-heading text-4xl text-sage">Daily Schedule</h2>
      {!token && (
        <p className="text-ink/70">
          <Link to="/login" className="underline text-sage">Sign in</Link> to view your personalized schedule.
        </p>
      )}
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {loading && <div className="loader" />}
      <div className="grid gap-4">
        {token && items.length === 0 && !error && (
          <p className="text-ink/70">No schedule available yet.</p>
        )}
        {items.map((item) => (
          <div key={item.period} className="card flex justify-between items-center">
            <div>
              <p className="uppercase tracking-widest text-ocean">{item.period}</p>
              <p className="text-lg text-ink">{item.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-ink/70">{item.program_type}</span>
              {item.program_type === "audio_program" && (
                <Link to={`/player/${item.program_id}`} className="btn-outline">
                  Open Player
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
