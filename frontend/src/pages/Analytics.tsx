import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function Analytics() {
  const { token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      apiFetch<any[]>("/api/v1/listening-history/", {}, token).then(setHistory).catch(() => {}),
      apiFetch<any[]>("/api/v1/ai-recommendations/", {}, token).then(setRecommendations).catch(() => {}),
      apiFetch<any[]>("/api/v1/programs/").then(setPrograms).catch(() => {})
    ]).finally(() => setLoading(false));
  }, [token]);

  const totalMinutes = history.reduce((sum, item) => sum + (item.duration || 0), 0);
  const totalSessions = history.length;
  const avgSession = totalSessions ? Math.round((totalMinutes / totalSessions) * 10) / 10 : 0;
  const programMap = new Map(programs.map((p) => [p.id, p.name]));
  const lastSession = history[0]?.listened_at;

  const minutesByProgram = history.reduce((acc: Record<string, number>, item) => {
    const name = programMap.get(item.program_id) || `Program ${item.program_id}`;
    acc[name] = (acc[name] || 0) + (item.duration || 0);
    return acc;
  }, {});

  const topPrograms = Object.entries(minutesByProgram)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const minutesByDay = history.reduce((acc: Record<string, number>, item) => {
    const day = new Date(item.listened_at).toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + (item.duration || 0);
    return acc;
  }, {});

  const dailySeries = Object.entries(minutesByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7);

  return (
    <section className="px-8 py-12 space-y-6 fade-in">
      <h2 className="font-heading text-4xl text-sage">Progress Analytics</h2>
      {!token && (
        <p className="text-ink/70">
          <Link to="/login" className="underline text-sage">Sign in</Link> to view analytics.
        </p>
      )}
      {loading && <div className="loader" />}
      {token && (
        <>
          <div className="card space-y-2">
            <p className="text-ink/80">Total sessions: {totalSessions}</p>
            <p className="text-ink/80">Total minutes: {totalMinutes}</p>
            <p className="text-ink/80">Average session: {avgSession} min</p>
            <p className="text-ink/80">Last session: {lastSession ? new Date(lastSession).toLocaleString() : "—"}</p>
            <p className="text-ink/80">Recent recommendations: {recommendations.length}</p>
          </div>
          {history.length === 0 && recommendations.length === 0 && (
            <p className="text-ink/70">No activity yet. Start a session to see analytics.</p>
          )}
          <div className="auto-grid">
            {recommendations.slice(0, 4).map((rec) => (
              <div key={rec.id} className="card">
                <p className="text-xs uppercase tracking-widest text-ocean">Recommendation</p>
                <p className="text-ink/80">{rec.recommendation}</p>
              </div>
            ))}
          </div>
          <div className="card space-y-2">
            <p className="text-xs uppercase tracking-widest text-ocean">Top Programs</p>
            {topPrograms.length === 0 && <p className="text-ink/70">No program data yet.</p>}
            {topPrograms.map(([name, minutes]) => (
              <div key={name} className="flex justify-between text-ink/70">
                <span>{name}</span>
                <span>{minutes} min</span>
              </div>
            ))}
          </div>
          <div className="card space-y-2">
            <p className="text-xs uppercase tracking-widest text-ocean">Last 7 Days</p>
            {dailySeries.length === 0 && <p className="text-ink/70">No daily data yet.</p>}
            {dailySeries.map(([day, minutes]) => (
              <div key={day} className="flex justify-between text-ink/70">
                <span>{day}</span>
                <span>{minutes} min</span>
              </div>
            ))}
          </div>
          <div className="card space-y-2">
            <p className="text-xs uppercase tracking-widest text-ocean">Recent Sessions</p>
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between text-ink/70">
                <span>{programMap.get(item.program_id) || item.program_type}</span>
                <span>{item.duration} min</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
