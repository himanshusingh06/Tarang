import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({ email: "", full_name: "", role: "", is_active: true });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    apiFetch(`/api/v1/admin/users/${id}`, {}, token)
      .then((data) => {
        setProfile(data);
        setForm({
          email: data.email,
          full_name: data.full_name || "",
          role: data.role,
          is_active: data.is_active
        });
      })
      .catch(() => setError("Unable to load user."))
      .finally(() => setLoading(false));
  }, [id, token]);

  const save = async () => {
    if (!token || !id) return;
    setError("");
    try {
      setSaving(true);
      const payload: any = {
        email: form.email,
        full_name: form.full_name
      };
      if (user?.role === "admin") {
        payload.role = form.role;
        payload.is_active = form.is_active;
      }
      const updated = await apiFetch(`/api/v1/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }, token);
      setProfile(updated);
    } catch {
      setError("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!token || !id || user?.role !== "admin") return;
    setError("");
    try {
      await apiFetch(`/api/v1/admin/users/${id}`, { method: "DELETE" }, token);
      navigate("/admin");
    } catch {
      setError("Delete failed.");
    }
  };

  if (!token) {
    return (
      <section className="px-8 py-12">
        <div className="card">
          <p className="text-ink/70">Sign in to access this page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-8 py-12 space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="btn-outline">Back to Admin</Link>
      </div>
      {loading && <div className="loader" />}
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {profile && (
        <div className="card space-y-4">
          <h2 className="font-heading text-3xl text-sage">User Detail</h2>
          <div className="grid gap-3">
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Full name"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Role"
              disabled={user?.role !== "admin"}
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink disabled:opacity-60"
            />
            <label className="flex items-center gap-2 text-ink/70">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                disabled={user?.role !== "admin"}
              />
              Active account
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={save} className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {user?.role === "admin" && (
              <button onClick={remove} className="btn-outline">
                Delete User
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
