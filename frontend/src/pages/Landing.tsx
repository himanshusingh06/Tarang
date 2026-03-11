import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <section className="px-8 py-16 grid gap-12 lg:grid-cols-2 items-center fade-in">
      <div className="space-y-6">
        <p className="uppercase tracking-[0.3em] text-ocean">Sound that heals, focuses, restores</p>
        <h1 className="font-heading text-5xl lg:text-6xl text-ink">Tarang Wellness Platform</h1>
        <p className="text-ink/80 text-lg">
          A wellness system combining Ayurveda, neuroscience, binaural beats, and personalized
          schedules to create restorative sound journeys.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link to="/chat" className="btn-primary">
            Start AI Session
          </Link>
          <Link to="/library" className="btn-outline">
            Explore Library
          </Link>
        </div>
      </div>
      <div className="card space-y-4">
        <h2 className="font-heading text-3xl text-sage">Today's Highlight</h2>
        <p className="text-ink/70">Saptachakra Yatra - 60 min - Progressive Theta Journey</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/80 p-4 rounded-xl">
            <p className="uppercase tracking-widest text-ocean">Morning</p>
            <p>Kayakalp - Focus</p>
          </div>
          <div className="bg-white/80 p-4 rounded-xl">
            <p className="uppercase tracking-widest text-ocean">Evening</p>
            <p>Sanjeevani - Relax</p>
          </div>
          <div className="bg-white/80 p-4 rounded-xl">
            <p className="uppercase tracking-widest text-ocean">Night</p>
            <p>Dhyana Nidra - Sleep</p>
          </div>
          <div className="bg-white/80 p-4 rounded-xl">
            <p className="uppercase tracking-widest text-ocean">Wellness</p>
            <p>Dosha + Circadian Sync</p>
          </div>
        </div>
      </div>
    </section>
  );
}
