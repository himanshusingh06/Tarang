import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function AdminProgramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [program, setProgram] = useState<any>(null);
  const [form, setForm] = useState<any>({
    name: "",
    frequency: "",
    brainwave_type: "",
    chakra: "",
    duration: 20,
    benefits: "",
    audio_file: "",
    recommended_time: "",
    tags: ""
  });
  const [audioUpload, setAudioUpload] = useState<File | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    apiFetch(`/api/v1/admin/programs/${id}`, {}, token)
      .then((data) => {
        setProgram(data);
        setForm({
          name: data.name || "",
          frequency: data.frequency || "",
          brainwave_type: data.brainwave_type || "",
          chakra: data.chakra || "",
          duration: data.duration || 20,
          benefits: data.benefits || "",
          audio_file: data.audio_file || "",
          recommended_time: data.recommended_time || "",
          tags: data.tags || ""
        });
      })
      .catch(() => setError("Unable to load program."));
  }, [id, token]);

  const uploadAudioFile = async () => {
    if (!token || !audioUpload) return;
    setError("");
    try {
      setUploadingAudio(true);
      const formData = new FormData();
      formData.append("file", audioUpload);
      const result = await apiFetch<{ filename: string }>(
        "/api/v1/audio/upload",
        { method: "POST", body: formData },
        token
      );
      setForm((prev: any) => ({ ...prev, audio_file: result.filename }));
      setAudioUpload(null);
    } catch {
      setError("Audio upload failed.");
    } finally {
      setUploadingAudio(false);
    }
  };

  const save = async () => {
    if (!token || !id) return;
    setError("");
    try {
      setSaving(true);
      const updated = await apiFetch(`/api/v1/admin/programs/${id}`, {
        method: "PUT",
        body: JSON.stringify(form)
      }, token);
      setProgram(updated);
    } catch {
      setError("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!token || user?.role !== "admin" || !id) return;
    setError("");
    try {
      await apiFetch(`/api/v1/admin/programs/${id}`, { method: "DELETE" }, token);
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
        {program && <Link to={`/player/${program.id}`} className="btn-outline">Open Player</Link>}
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {program && (
        <div className="card space-y-4">
          <h2 className="font-heading text-3xl text-sage">Program Detail</h2>
          <div className="grid gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Program name"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              placeholder="Frequency"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={form.brainwave_type}
              onChange={(e) => setForm({ ...form, brainwave_type: e.target.value })}
              placeholder="Brainwave type"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={form.chakra}
              onChange={(e) => setForm({ ...form, chakra: e.target.value })}
              placeholder="Chakra"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              placeholder="Duration (min)"
              type="number"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={form.audio_file}
              onChange={(e) => setForm({ ...form, audio_file: e.target.value })}
              placeholder="Audio file"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioUpload(e.target.files?.[0] || null)}
                className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
              />
              <button onClick={uploadAudioFile} className="btn-outline" disabled={!audioUpload || uploadingAudio}>
                {uploadingAudio ? "Uploading..." : "Upload Audio"}
              </button>
            </div>
            <input
              value={form.recommended_time}
              onChange={(e) => setForm({ ...form, recommended_time: e.target.value })}
              placeholder="Recommended time"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Tags"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <textarea
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              placeholder="Benefits"
              className="bg-white/80 border border-sage/20 rounded-3xl px-4 py-3 text-ink min-h-[110px]"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={save} className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {user?.role === "admin" && (
              <button onClick={remove} className="btn-outline">
                Delete Program
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
