import { useEffect, useState } from "react";
import ChakraVisualizer from "../components/ChakraVisualizer";
import { apiFetch } from "../lib/api";

export default function ChakraJourney() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch<any[]>("/api/v1/chakras/")
      .then(setPrograms)
      .catch(() => setError("Unable to load chakra programs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="px-8 py-12 space-y-8 fade-in">
      <h2 className="font-heading text-4xl text-sage">Chakra Journey</h2>
      <div className="card space-y-4">
        <p className="text-ink/80">Saptachakra Yatra is a 60 minute guided progression through all chakras.</p>
        <ChakraVisualizer />
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {loading && <div className="loader" />}
      <div className="auto-grid">
        {programs.length === 0 && !error && (
          <p className="text-ink/70">No chakra programs available.</p>
        )}
        {programs.map((program) => (
          <div key={program.id} className="card">
            <p className="text-xs uppercase tracking-widest text-ocean">{program.chakra}</p>
            <h3 className="font-heading text-2xl text-sage">{program.name}</h3>
            <p className="text-ink/70">{program.frequency} - {program.brainwave_type}</p>
            <p className="text-ink/70">{program.duration} min</p>
          </div>
        ))}
      </div>
    </section>
  );
}
