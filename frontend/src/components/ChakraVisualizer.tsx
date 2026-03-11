const chakras = [
  { name: "Mooladhara", color: "bg-ember" },
  { name: "Swadhisthana", color: "bg-saffron" },
  { name: "Manipura", color: "bg-amber-400" },
  { name: "Anahata", color: "bg-emerald-500" },
  { name: "Vishuddha", color: "bg-sky-500" },
  { name: "Ajna", color: "bg-indigo-500" },
  { name: "Sahasrara", color: "bg-purple-400" }
];

export default function ChakraVisualizer() {
  return (
    <div className="flex flex-wrap gap-4">
      {chakras.map((chakra) => (
        <div key={chakra.name} className="flex items-center gap-3">
          <span className={`w-4 h-4 rounded-full ${chakra.color}`} />
          <span className="text-sm text-ink/80">{chakra.name}</span>
        </div>
      ))}
    </div>
  );
}
