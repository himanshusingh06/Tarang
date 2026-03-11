import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/chat");
    } catch (err: any) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <section className="px-8 py-12 max-w-xl mx-auto space-y-6 fade-in">
      <h2 className="font-heading text-4xl text-sage">Welcome Back</h2>
      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="text-sm text-ink/70">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
          />
        </div>
        <div>
          <label className="text-sm text-ink/70">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
          />
        </div>
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button type="submit" className="btn-primary w-full">
          Sign In
        </button>
        <p className="text-sm text-ink/70">
          New here? <Link to="/register" className="underline text-sage">Create an account</Link>.
        </p>
      </form>
    </section>
  );
}
