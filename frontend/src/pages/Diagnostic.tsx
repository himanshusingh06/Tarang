import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface Question {
  id: number;
  text: string;
  options: string[];
}

export default function Diagnostic() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch<Question[]>("/api/v1/diagnostics/questions")
      .then(setQuestions)
      .catch(() => setError("Unable to load diagnostic questions."))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!token) {
      setError("Please sign in to submit your diagnostic.");
      return;
    }
    setError("");
    setSubmitting(true);
    const payload = {
      answers: questions.map((q) => ({
        question_id: q.id,
        value: answers[q.id] ?? "0"
      }))
    };
    try {
      const data = await apiFetch("/api/v1/diagnostics/submit", {
        method: "POST",
        body: JSON.stringify(payload)
      }, token);
      setResult(data);
    } catch {
      setError("Unable to submit diagnostic.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="px-8 py-12 space-y-6 fade-in">
      <h2 className="font-heading text-4xl text-sage">20 Question Ayurvedic Diagnostic</h2>
      <div className="glass rounded-3xl p-6 space-y-4">
        <p className="text-ink/80">Answer the diagnostic to determine your dosha profile.</p>
        {!token && (
          <p className="text-ink/70">
            <Link to="/login" className="underline text-sage">Sign in</Link> to save results.
          </p>
        )}
        {loading && <div className="loader" />}
        {questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <p className="text-ink">{q.id}. {q.text}</p>
            <div className="flex flex-wrap gap-3">
              {q.options.map((option, idx) => (
                <label key={option} className="flex items-center gap-2 text-ink/70">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={String(idx)}
                    checked={answers[q.id] === String(idx)}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button onClick={submit} className="btn-primary" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Diagnostic"}
        </button>
        {result && (
          <div className="mt-4 text-ink/80">
            Dosha result: {result.primary_dosha} (Vata {result.vata}, Pitta {result.pitta}, Kapha {result.kapha})
          </div>
        )}
      </div>
    </section>
  );
}
