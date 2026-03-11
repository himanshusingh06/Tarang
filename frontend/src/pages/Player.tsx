import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { API_BASE } from "../lib/config";
import albumArt from "../assets/album-art.svg";
import { useAuth } from "../hooks/useAuth";
import { pickAccent } from "../lib/colors";

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const BAR_COUNT = 24;

export default function Player() {
  const { id } = useParams();
  const { token } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [audioError, setAudioError] = useState("");
  const [bars, setBars] = useState<number[]>(Array.from({ length: BAR_COUNT }, () => 0.2));
  const [energy, setEnergy] = useState(0.6);
  const [isSeeking, setIsSeeking] = useState(false);
  const [ambientHue, setAmbientHue] = useState<number | null>(null);

  const accent = useMemo(
    () => pickAccent(program?.name || "ambient"),
    [program?.name]
  );

  const progressPercent = duration ? Math.min(100, (progress / duration) * 100) : 0;
  const volumePercent = Math.min(100, Math.max(0, volume * 100));
  const getDuration = (audio: HTMLAudioElement) => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      return audio.duration;
    }
    if (audio.seekable && audio.seekable.length > 0) {
      return audio.seekable.end(audio.seekable.length - 1);
    }
    return 0;
  };

  const stopVisualizer = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startVisualizer = useCallback(() => {
    if (!analyserRef.current || !dataRef.current) return;
    const analyser = analyserRef.current;
    const data = dataRef.current;
    const step = Math.max(1, Math.floor(data.length / BAR_COUNT));

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const nextBars = Array.from({ length: BAR_COUNT }, (_, idx) => {
        const value = data[idx * step] / 255;
        return Math.max(0.08, value);
      });
      const avg = nextBars.reduce((sum, v) => sum + v, 0) / BAR_COUNT;
      const weightedIndex = nextBars.reduce((sum, v, idx) => sum + v * idx, 0) / Math.max(1, avg * BAR_COUNT);
      const hue = Math.round(40 + (weightedIndex / Math.max(1, BAR_COUNT - 1)) * 220);
      setBars(nextBars);
      setEnergy(0.35 + avg * 0.75);
      setAmbientHue(hue);
      rafRef.current = requestAnimationFrame(tick);
    };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch(`/api/v1/programs/${id}`)
      .then(setProgram)
      .catch(() => setError("Program not found."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (!isSeeking) {
        setProgress(audio.currentTime);
      }
      setDuration(getDuration(audio));
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      stopVisualizer();
    };
    const onError = () => setAudioError("Audio file could not be loaded. Check backend/audio.");
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onTime);
    audio.addEventListener("durationchange", onTime);
    audio.addEventListener("loadeddata", onTime);
    audio.addEventListener("canplay", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onTime);
      audio.removeEventListener("durationchange", onTime);
      audio.removeEventListener("loadeddata", onTime);
      audio.removeEventListener("canplay", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [program?.id, isSeeking, stopVisualizer]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    return () => {
      stopVisualizer();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      sourceRef.current = null;
    };
  }, [stopVisualizer]);

  const ensureAudioAnalyser = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const source = sourceRef.current ?? context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(context.destination);
      audioContextRef.current = context;
      sourceRef.current = source;
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      stopVisualizer();
    } else {
      try {
        await ensureAudioAnalyser();
        await audio.play();
        startVisualizer();
      } catch {
        setAudioError("Unable to start audio playback. Check browser audio permissions.");
        return;
      }
      if (token && program) {
        apiFetch(
          "/api/v1/listening-history/",
          {
            method: "POST",
            body: JSON.stringify({
              program_id: program.id,
              program_type: "audio_program",
              duration: program.duration || 0
            })
          },
          token
        ).catch(() => {});
      }
    }
  };

  const seekTo = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = getDuration(audio);
    const next = max > 0 ? Math.max(0, Math.min(value, max)) : Math.max(0, value);
    audio.currentTime = next;
    setProgress(next);
    if (!audio.paused) {
      startVisualizer();
    }
  };

  const jump = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = getDuration(audio);
    const next = max > 0
      ? Math.max(0, Math.min(audio.currentTime + delta, max))
      : Math.max(0, audio.currentTime + delta);
    audio.currentTime = next;
    setProgress(next);
    if (!audio.paused) {
      startVisualizer();
    }
  };

  const updateVolume = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value;
    setVolume(value);
  };

  return (
    <section className="px-8 py-12 space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <Link to="/library" className="btn-outline">Back to Library</Link>
      </div>
      {loading && <div className="loader" />}
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {program && (
        <div
          className="card player-shell grid gap-6 lg:grid-cols-[300px_1fr] items-center"
          style={
            {
              "--ambient": accent.glow,
              "--ambient-soft": accent.soft,
              "--ambient-strong": accent.primary,
              "--ambient-dynamic": ambientHue !== null
                ? `hsla(${ambientHue}, 70%, 70%, 0.45)`
                : accent.glow,
              "--ambient-strong-dynamic": ambientHue !== null
                ? `hsl(${ambientHue}, 70%, 60%)`
                : accent.primary,
              "--ambient-alpha": energy
            } as CSSProperties
          }
        >
          <img src={program.image_url || albumArt} alt="Album art" className="rounded-2xl w-full h-auto" />
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-ocean">Now Playing</p>
              <h2 className="font-heading text-3xl text-sage">{program.name}</h2>
              <p className="text-ink/70">{program.frequency} - {program.brainwave_type}</p>
            </div>
            <div className="space-y-3">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onMouseDown={() => setIsSeeking(true)}
                onTouchStart={() => setIsSeeking(true)}
                onChange={(e) => setProgress(Number(e.target.value))}
                onMouseUp={(e) => {
                  setIsSeeking(false);
                  seekTo(Number((e.target as HTMLInputElement).value));
                }}
                onTouchEnd={(e) => {
                  setIsSeeking(false);
                  seekTo(Number((e.target as HTMLInputElement).value));
                }}
                className="audio-range w-full"
                style={
                  {
                    "--range-accent": accent.primary,
                    background: `linear-gradient(90deg, ${accent.primary} ${progressPercent}%, rgba(44, 42, 38, 0.12) ${progressPercent}%)`
                  } as CSSProperties
                }
              />
              <div className="flex justify-between text-ink/60 text-sm">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              {audioError && <p className="text-sm text-rose-700">{audioError}</p>}
            </div>
            <div className="equalizer">
              {bars.map((value, index) => (
                <div
                  key={index}
                  className="equalizer-bar"
                  style={{ height: `${Math.round(18 + value * 60)}px` }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <button onClick={() => jump(-10)} className="btn-outline">-10s</button>
              <button onClick={togglePlay} className="btn-primary">
                {playing ? "Pause" : "Play"}
              </button>
              <button onClick={() => jump(10)} className="btn-outline">+10s</button>
              <div className="flex items-center gap-2">
                <span className="text-ink/60 text-sm">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => updateVolume(Number(e.target.value))}
                className="audio-range audio-range--volume"
                  style={
                    {
                      "--range-accent": accent.primary,
                      background: `linear-gradient(90deg, ${accent.primary} ${volumePercent}%, rgba(44, 42, 38, 0.12) ${volumePercent}%)`
                    } as CSSProperties
                  }
                />
              </div>
            </div>
          </div>
          <audio
            ref={audioRef}
            src={`${API_BASE}/api/v1/audio/${program.id}`}
            preload="auto"
            crossOrigin="anonymous"
          />
        </div>
      )}
    </section>
  );
}
