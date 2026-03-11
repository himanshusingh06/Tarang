import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

type TabKey = "customers" | "staff" | "programs";

export default function Admin() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("customers");
  const [users, setUsers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [savingProgram, setSavingProgram] = useState(false);
  const [error, setError] = useState("");
  const [audioUpload, setAudioUpload] = useState<File | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffName, setStaffName] = useState("");

  const [programForm, setProgramForm] = useState<any>({
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
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoadingUsers(true);
    apiFetch<any[]>("/api/v1/admin/users?role=user", {}, token)
      .then(setUsers)
      .catch(() => setError("Unable to load users."))
      .finally(() => setLoadingUsers(false));
  }, [token]);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    setLoadingStaff(true);
    apiFetch<any[]>("/api/v1/admin/users?role=staff", {}, token)
      .then(setStaff)
      .catch(() => setError("Unable to load staff."))
      .finally(() => setLoadingStaff(false));
  }, [token, user]);

  useEffect(() => {
    if (!token) return;
    setLoadingPrograms(true);
    apiFetch<any[]>("/api/v1/admin/programs", {}, token)
      .then(setPrograms)
      .catch(() => setError("Unable to load programs."))
      .finally(() => setLoadingPrograms(false));
  }, [token]);

  const createStaff = async () => {
    if (!token) return;
    setError("");
    try {
      setCreatingStaff(true);
      await apiFetch(
        "/api/v1/admin/staff",
        {
          method: "POST",
          body: JSON.stringify({
            email: staffEmail,
            password: staffPassword,
            full_name: staffName
          })
        },
        token
      );
      const refreshed = await apiFetch<any[]>("/api/v1/admin/users?role=staff", {}, token);
      setStaff(refreshed);
      setStaffEmail("");
      setStaffPassword("");
      setStaffName("");
    } catch {
      setError("Unable to create staff.");
    } finally {
      setCreatingStaff(false);
    }
  };

  const createProgram = async () => {
    if (!token) return;
    setError("");
    try {
      setSavingProgram(true);
      if (editingId) {
        const updated = await apiFetch(
          `/api/v1/admin/programs/${editingId}`,
          { method: "PUT", body: JSON.stringify(programForm) },
          token
        );
        setPrograms((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
      } else {
        const created = await apiFetch(
          "/api/v1/admin/programs",
          { method: "POST", body: JSON.stringify(programForm) },
          token
        );
        setPrograms((prev) => [created, ...prev]);
      }
      setProgramForm({
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
      setAudioUpload(null);
    } catch {
      setError("Unable to create program.");
    } finally {
      setSavingProgram(false);
    }
  };

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
      setProgramForm((prev: any) => ({ ...prev, audio_file: result.filename }));
      setAudioUpload(null);
    } catch {
      setError("Audio upload failed.");
    } finally {
      setUploadingAudio(false);
    }
  };

  const deleteProgram = async (id: number) => {
    if (!token) return;
    setError("");
    try {
      await apiFetch(`/api/v1/admin/programs/${id}`, { method: "DELETE" }, token);
      setPrograms((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Delete failed.");
    }
  };

  if (!user || !token) {
    return (
      <section className="px-8 py-12">
        <div className="card">
          <p className="text-ink/70">Sign in as admin or staff to access this area.</p>
        </div>
      </section>
    );
  }

  if (user.role !== "admin" && user.role !== "staff") {
    return (
      <section className="px-8 py-12">
        <div className="card">
          <p className="text-ink/70">You do not have access to admin tools.</p>
        </div>
      </section>
    );
  }

  const tabs: TabKey[] = user.role === "admin"
    ? ["customers", "staff", "programs"]
    : ["customers", "programs"];

  return (
    <section className="px-8 py-12 space-y-6 fade-in">
      <h2 className="font-heading text-4xl text-sage">Admin Console</h2>
      <div className="card flex flex-wrap gap-3">
        {tabs.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={key === activeTab ? "btn-primary" : "btn-outline"}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}

      {activeTab === "customers" && (
        <div className="card space-y-4">
          <p className="text-xs uppercase tracking-widest text-ocean">Customers</p>
          {loadingUsers && <div className="loader" />}
          {!loadingUsers && users.length === 0 && <p className="text-ink/70">No customers found.</p>}
          {users.map((u) => (
            <div key={u.id} className="flex justify-between text-ink/70">
              <span>{u.email}</span>
              <div className="flex items-center gap-3">
                <span>{u.full_name || "Member"}</span>
                <Link to={`/admin/users/${u.id}`} className="btn-outline">Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "staff" && (
        <div className="card space-y-4">
          <p className="text-xs uppercase tracking-widest text-ocean">Staff Management</p>
          {user.role !== "admin" && (
            <p className="text-ink/70">Only admins can create staff accounts.</p>
          )}
          {user.role === "admin" && (
            <div className="grid gap-3">
              <input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Full name"
                className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
              />
              <input
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="Email"
                className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
              />
              <input
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                placeholder="Temporary password"
                type="password"
                className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
              />
              <button onClick={createStaff} className="btn-primary" disabled={creatingStaff}>
                {creatingStaff ? "Creating..." : "Create Staff"}
              </button>
            </div>
          )}
          {loadingStaff && <div className="loader" />}
          {staff.map((s) => (
            <div key={s.id} className="flex justify-between text-ink/70">
              <span>{s.email}</span>
              <div className="flex items-center gap-3">
                <span>{s.full_name || "Staff"}</span>
                <Link to={`/admin/users/${s.id}`} className="btn-outline">Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "programs" && (
        <div className="card space-y-4">
          <p className="text-xs uppercase tracking-widest text-ocean">Audio Programs</p>
          {loadingPrograms && <div className="loader" />}
          <div className="grid gap-3">
            <input
              value={programForm.name}
              onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
              placeholder="Program name"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={programForm.frequency}
              onChange={(e) => setProgramForm({ ...programForm, frequency: e.target.value })}
              placeholder="Frequency"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={programForm.brainwave_type}
              onChange={(e) => setProgramForm({ ...programForm, brainwave_type: e.target.value })}
              placeholder="Brainwave type"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={programForm.chakra}
              onChange={(e) => setProgramForm({ ...programForm, chakra: e.target.value })}
              placeholder="Chakra"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={programForm.duration}
              onChange={(e) => setProgramForm({ ...programForm, duration: Number(e.target.value) })}
              placeholder="Duration (min)"
              type="number"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={programForm.audio_file}
              onChange={(e) => setProgramForm({ ...programForm, audio_file: e.target.value })}
              placeholder="Audio file (auto-filled after upload)"
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
              value={programForm.recommended_time}
              onChange={(e) => setProgramForm({ ...programForm, recommended_time: e.target.value })}
              placeholder="Recommended time (Morning/Evening/Night)"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <input
              value={programForm.tags}
              onChange={(e) => setProgramForm({ ...programForm, tags: e.target.value })}
              placeholder="Tags (comma separated)"
              className="bg-white/80 border border-sage/20 rounded-full px-4 py-2 text-ink"
            />
            <textarea
              value={programForm.benefits}
              onChange={(e) => setProgramForm({ ...programForm, benefits: e.target.value })}
              placeholder="Benefits"
              className="bg-white/80 border border-sage/20 rounded-3xl px-4 py-3 text-ink min-h-[110px]"
            />
            <div className="flex flex-wrap gap-3">
              <button onClick={createProgram} className="btn-primary" disabled={savingProgram}>
                {savingProgram ? "Saving..." : editingId ? "Save Program" : "Add Program"}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setProgramForm({
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
                    setAudioUpload(null);
                  }}
                  className="btn-outline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-3">
            {programs.map((p) => (
              <div key={p.id} className="flex justify-between text-ink/70">
                <span>{p.name}</span>
                <div className="flex gap-2">
                  <Link to={`/admin/programs/${p.id}`} className="btn-outline">Details</Link>
                  <button
                    onClick={() => {
                      setEditingId(p.id);
                      setProgramForm({
                        name: p.name,
                        frequency: p.frequency,
                        brainwave_type: p.brainwave_type,
                        chakra: p.chakra || "",
                        duration: p.duration,
                        benefits: p.benefits || "",
                        audio_file: p.audio_file || "",
                        recommended_time: p.recommended_time || "",
                        tags: p.tags || ""
                      });
                    }}
                    className="btn-outline"
                  >
                    Edit
                  </button>
                  {user.role === "admin" && (
                    <button onClick={() => deleteProgram(p.id)} className="btn-outline">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
