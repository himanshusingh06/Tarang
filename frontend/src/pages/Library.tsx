import { CSSProperties, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import albumArt from "../assets/album-art.svg";
import { pickAccent } from "../lib/colors";

export default function Library() {
  const { token } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchIds, setSearchIds] = useState<number[] | null>(null);
  const [chakraFilter, setChakraFilter] = useState("");
  const [brainwaveFilter, setBrainwaveFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch<any[]>("/api/v1/programs/")
      .then(setPrograms)
      .catch(() => setError("Unable to load programs."))
      .finally(() => setLoading(false));
  }, []);

  const runSearch = async () => {
    if (!query.trim() && !chakraFilter && !brainwaveFilter) {
      setSearchIds(null);
      return;
    }
    try {
      const filters: Record<string, string> = {};
      if (chakraFilter) filters.chakra = chakraFilter;
      if (brainwaveFilter) filters.brainwave_type = brainwaveFilter;
      const searchQuery = query.trim() || chakraFilter || brainwaveFilter || "wellness";
      const results = await apiFetch<any[]>("/api/v1/search/", {
        method: "POST",
        body: JSON.stringify({ query: searchQuery, filters })
      });
      setSearchIds(results.map((r) => r.id));
    } catch {
      setError("Search failed.");
    }
  };

  const logPlay = async (programId: number, duration: number) => {
    if (!token) return;
    try {
      await apiFetch(
        "/api/v1/listening-history/",
        {
          method: "POST",
          body: JSON.stringify({ program_id: programId, program_type: "audio_program", duration })
        },
        token
      );
    } catch {
      // silent
    }
  };

  return (
    <section className="px-8 py-12 space-y-6 fade-in">
      <h2 className="font-heading text-4xl text-sage">Healing Audio Library</h2>
      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[220px] bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
          placeholder="Search by stress, chakra, frequency, or brainwave"
        />
        <select
          value={chakraFilter}
          onChange={(e) => setChakraFilter(e.target.value)}
          className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
        >
          <option value="">Chakra</option>
          {[...new Set(programs.map((p) => p.chakra).filter(Boolean))].map((chakra) => (
            <option key={chakra} value={chakra}>{chakra}</option>
          ))}
        </select>
        <select
          value={brainwaveFilter}
          onChange={(e) => setBrainwaveFilter(e.target.value)}
          className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
        >
          <option value="">Brainwave</option>
          {[...new Set(programs.map((p) => p.brainwave_type).filter(Boolean))].map((bw) => (
            <option key={bw} value={bw}>{bw}</option>
          ))}
        </select>
        <button onClick={runSearch} className="btn-primary">
          Search
        </button>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {loading && <div className="loader" />}
      <div className="auto-grid">
        {programs.length === 0 && !error && (
          <p className="text-ink/70">No programs available.</p>
        )}
        {programs
          .filter((program) => !searchIds || searchIds.includes(program.id))
          .map((program) => {
            const accent = pickAccent(program.name || String(program.id));
            const imageSrc = program.image_url || albumArt;
            return (
              <div
                key={program.id}
                className="card card-ambient"
                style={
                  {
                    "--card-soft": accent.soft,
                    "--card-glow": accent.glow,
                    "--card-border": accent.border,
                    backgroundImage: `linear-gradient(135deg, ${accent.soft} 0%, rgba(255, 255, 255, 0.92) 60%), url(${imageSrc})`,
                    backgroundBlendMode: "soft-light",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  } as CSSProperties
                }
              >
                <div className="flex gap-4">
                  <img src={imageSrc} alt="Program art" className="w-24 h-24 rounded-2xl object-cover" />
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-ocean">{program.brainwave_type}</p>
                    <h3 className="font-heading text-2xl text-sage">{program.name}</h3>
                    <p className="text-ink/70">{program.frequency}</p>
                    <p className="text-ink/60">{program.duration} min</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link to={`/player/${program.id}`} className="btn-primary">
                    Open Player
                  </Link>
                  <button onClick={() => logPlay(program.id, program.duration)} className="btn-outline">
                    Log Session
                  </button>
                </div>
              </div>
            );
          })}
        {searchIds && searchIds.length === 0 && (
          <p className="text-ink/70">No matching programs found.</p>
        )}
      </div>
    </section>
  );
}
