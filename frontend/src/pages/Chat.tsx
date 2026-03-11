import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([
    "Namaste. Tell me how you feel today and I will design a healing audio path."
  ]);
  const { token } = useAuth();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, `You: ${input}`]);
    if (!token) {
      setMessages((prev) => [...prev, "AI: Please sign in to receive recommendations."]);
      setInput("");
      return;
    }
    try {
      setSending(true);
      const data = await apiFetch<any>("/api/v1/ai-agent/recommend", {
        method: "POST",
        body: JSON.stringify({ input_text: input })
      }, token);
      setMessages((prev) => [...prev, `AI: ${data.recommendation}`]);
      setRecommendation(data);
    } catch {
      setMessages((prev) => [...prev, "AI: Unable to reach the wellness engine."]);
    } finally {
      setSending(false);
    }
    setInput("");
  };

  return (
    <section className="px-8 py-12 space-y-6 fade-in">
      <h2 className="font-heading text-4xl text-sage">Wellness Chat</h2>
      {!token && (
        <p className="text-ink/70">
          <Link to="/login" className="underline text-sage">Sign in</Link> to receive personalized recommendations.
        </p>
      )}
      <div className="card space-y-4 min-h-[300px]">
        {messages.map((message, index) => (
          <p key={index} className="text-ink/80">
            {message}
          </p>
        ))}
      </div>
      {recommendation && (
        <div className="card space-y-2">
          <p className="text-xs uppercase tracking-widest text-ocean">Recommended Program</p>
          <p className="font-heading text-2xl text-sage">{recommendation.program.name}</p>
          <p className="text-ink/70">{recommendation.program.frequency}</p>
          <div className="grid gap-2">
            {recommendation.schedule.map((item: any) => (
              <div key={item.period} className="flex justify-between text-ink/70">
                <span>{item.period}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
          placeholder="I feel stressed and unfocused"
        />
        <button onClick={send} className="btn-primary" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </section>
  );
}
