import { useState, useRef, useEffect } from "react";

interface Props {
  title: string;
  frequency: string;
  duration: number;
  src: string;
  programId?: number;
  onPlay?: (programId: number, duration: number) => void;
}

export default function AudioPlayer({ title, frequency, duration, src, programId, onPlay }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTime = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    audio.addEventListener("timeupdate", handleTime);
    return () => audio.removeEventListener("timeupdate", handleTime);
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
      if (programId && onPlay) {
        onPlay(programId, duration);
      }
    }
    setPlaying(!playing);
  };

  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-heading text-xl text-sage">{title}</h4>
          <p className="text-ink/70">
            {frequency} - {duration} min
          </p>
        </div>
        <div className="text-xs uppercase tracking-widest text-ocean">Headphones On</div>
      </div>
      <div className="w-full h-2 bg-sage/10 rounded-full">
        <div className="h-2 bg-saffron rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between items-center">
        <button onClick={toggle} className="btn-primary">
          {playing ? "Pause" : "Play"}
        </button>
        <div className="text-sm text-ink/60">Session progress</div>
      </div>
      <audio ref={audioRef} src={src} />
    </div>
  );
}
