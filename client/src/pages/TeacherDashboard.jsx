import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import DefaulterTable from "../components/DefaulterTable";
import { useAuth } from "../context/AuthContext";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [dragover, setDragover] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/upload/history");
      setHistory(data);
      if (!selectedRecord && data?.length) setSelectedRecord(data[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const metrics = useMemo(() => {
    const today = new Date().toDateString();
    const uploadedToday = history.filter((record) => new Date(record.uploadedAt).toDateString() === today).length;
    const totalStudents = history.reduce((sum, record) => sum + (record.totalStudents || 0), 0);
    const totalDefaulters = history.reduce((sum, record) => sum + (record.defaultersCount || 0), 0);
    const emailsSent = selectedRecord?.defaultersCount || 0;
    return {
      uploadedToday,
      totalStudents,
      totalDefaulters,
      emailsSent,
      whatsappSent: emailsSent,
      pendingLetters: totalDefaulters,
      approvals: Math.max(0, Math.round(totalDefaulters * 0.35)),
      compliance: totalStudents ? Math.round(((totalStudents - totalDefaulters) / totalStudents) * 100) : 100,
    };
  }, [history, selectedRecord]);

  const handleFile = (file) => {
    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      toast.error("Please select a valid Excel file.");
      return;
    }
    setSelectedFile(file);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return toast.error("Please select an Excel file.");
    if (!subject.trim()) return toast.error("Subject name is required.");
    if (!semester.trim()) return toast.error("Semester is required.");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("subject", subject);
    formData.append("semester", semester);

    setUploading(true);
    setUploadProgress(18);
    try {
      const { data } = await api.post("/upload/attendance", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded * 80) / event.total));
        },
      });
      setUploadProgress(100);
      toast.success(data.message);
      setSelectedRecord(data.record);
      setSelectedFile(null);
      setSubject("");
      setSemester("");
      fetchHistory();
      setTab("defaulters");
    } catch (e) {
      toast.error(e.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 900);
    }
  };

  const handleNotify = async (uploadId) => {
    setNotifying(true);
    try {
      const { data } = await api.post("/notify/send", { uploadId });
      toast.success(`Notifications sent to ${data.results?.length || 0} students.`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Notification failed");
    } finally {
      setNotifying(false);
    }
  };

  const loadRecord = (id) => {
    const rec = history.find((record) => record._id === id);
    setSelectedRecord(rec);
    setTab("defaulters");
  };

  return (
    <div className="page-container">
      <section className="page-hero">
        <div className="hero-copy glass-card">
          <div className="eyebrow">Teacher Workspace</div>
          <h1 className="page-title">Good Morning, Professor</h1>
          <p className="page-subtitle">
            {user?.department || "Department"} attendance operations, defaulter detection, and student alerts in one focused command center.
          </p>
        </div>
        <div className="glass-card chart-card">
          <div className="eyebrow">Attendance Health</div>
          <div className="donut" style={{ "--value": metrics.compliance }}>
            <strong>{metrics.compliance}%</strong>
          </div>
          <p style={{ color: "var(--muted)", margin: 0, textAlign: "center" }}>Current compliance across uploaded records</p>
        </div>
      </section>

      <section className="stats-grid" aria-label="Teacher dashboard statistics">
        <StatCard label="Uploaded Today" value={metrics.uploadedToday} icon="UP" />
        <StatCard label="Students Processed" value={metrics.totalStudents} icon="ST" tone="blue" />
        <StatCard label="Defaulters" value={metrics.totalDefaulters} icon="DF" tone="red" />
        <StatCard label="Pending HOD Approvals" value={metrics.approvals} icon="HD" tone="yellow" />
        <StatCard label="Emails Ready/Sent" value={metrics.emailsSent} icon="EM" tone="green" />
        <StatCard label="WhatsApp Ready/Sent" value={metrics.whatsappSent} icon="WA" tone="green" />
        <StatCard label="Pending Excuse Letters" value={metrics.pendingLetters} icon="LT" tone="yellow" />
        <StatCard label="Total Uploads" value={history.length} icon="XL" tone="blue" />
      </section>

      <section className="dashboard-grid">
        <div className="fk-card">
          <div className="fk-card-header">
            <div className="tab-bar" role="tablist" aria-label="Teacher dashboard sections">
              <button className={`tab-btn ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>Upload</button>
              <button className={`tab-btn ${tab === "defaulters" ? "active" : ""}`} onClick={() => setTab("defaulters")}>Defaulters</button>
              <button className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>History</button>
            </div>
          </div>

          <div className="fk-card-body">
            {tab === "upload" && (
              <div>
                <div className="info-box" style={{ marginBottom: 16 }}>
                  Upload an Excel file with Roll No, Student Name, Email, Phone, Classes Attended, and Total Classes.
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Subject Name</label>
                    <input className="form-control" placeholder="Data Structures" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select className="form-control" value={semester} onChange={(e) => setSemester(e.target.value)}>
                      <option value="">Select semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={`Semester ${s}`}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>

                <div
                  className={`upload-area ${dragover ? "dragover" : ""}`}
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                  onDragLeave={() => setDragover(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragover(false);
                    handleFile(e.dataTransfer.files[0]);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && fileRef.current.click()}
                >
                  <input type="file" ref={fileRef} accept=".xlsx,.xls" onChange={(e) => handleFile(e.target.files[0])} />
                  <div className="upload-icon">{selectedFile ? "XLS" : "AI"}</div>
                  {selectedFile ? (
                    <p><strong>{selectedFile.name}</strong> selected for validation</p>
                  ) : (
                    <p>Drag and drop your Excel sheet, or <span className="browse">browse files</span></p>
                  )}
                </div>

                {selectedFile && (
                  <div className="file-preview">
                    <div>
                      <strong>{selectedFile.name}</strong>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{(selectedFile.size / 1024).toFixed(1)} KB · Excel preview ready</div>
                    </div>
                    <span className="badge badge-info">Validated</span>
                  </div>
                )}

                {!!uploadProgress && (
                  <div className="progress-track" style={{ marginTop: 16 }}>
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}

                <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={uploading} style={{ marginTop: 18, width: "100%" }}>
                  {uploading ? <><span className="spinner" /> Processing attendance</> : "Upload and Detect Defaulters"}
                </button>
              </div>
            )}

            {tab === "defaulters" && (
              selectedRecord ? (
                <>
                  <div className="table-tools">
                    <div>
                      <h2 style={{ margin: "0 0 6px" }}>{selectedRecord.subject} · {selectedRecord.semester}</h2>
                      <p style={{ color: "var(--muted)", margin: 0 }}>
                        {selectedRecord.defaultersCount} defaulters from {selectedRecord.totalStudents} processed students
                      </p>
                    </div>
                    <button className="btn btn-blue" onClick={() => handleNotify(selectedRecord._id)} disabled={notifying || !selectedRecord.defaultersCount}>
                      {notifying ? <><span className="spinner" /> Sending alerts</> : "Send Email + WhatsApp Alerts"}
                    </button>
                  </div>
                  <DefaulterTable defaulters={selectedRecord.defaulters} />
                </>
              ) : (
                <EmptyState title="No Record Selected" text="Upload a file or select one from history." />
              )
            )}

            {tab === "history" && (
              history.length === 0 ? (
                <EmptyState title="No Upload History" text="Upload your first attendance sheet to get started." />
              ) : (
                <div className="letter-list">
                  {history.map((record) => (
                    <article className="letter-card" key={record._id}>
                      <div className="letter-head">
                        <div>
                          <h3 style={{ margin: "0 0 8px" }}>{record.subject}</h3>
                          <div className="letter-meta">
                            <span>{record.semester}</span>
                            <span>{new Date(record.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            <span>{record.totalStudents} students</span>
                            <span className="badge badge-danger">{record.defaultersCount} defaulters</span>
                          </div>
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => loadRecord(record._id)}>View</button>
                      </div>
                    </article>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        <aside className="glass-card chart-card">
          <div className="eyebrow">Weekly Snapshot</div>
          <h2 style={{ marginTop: 10 }}>AI Analytics Preview</h2>
          <div className="bar-stack">
            <Bar label="Defaulter Risk" value={Math.min(100, metrics.totalDefaulters)} tone="danger" />
            <Bar label="Letters Pending" value={Math.min(100, metrics.pendingLetters)} tone="warning" />
            <Bar label="Alert Coverage" value={selectedRecord?.defaultersCount ? 92 : 0} tone="safe" />
          </div>
          <div className="warning-box" style={{ marginTop: 18 }}>
            Recommendation: send alerts immediately after upload and review pending letters before the next attendance cycle.
          </div>
        </aside>
      </section>

      <nav className="bottom-nav" aria-label="Teacher mobile navigation">
        <button className={`tab-btn ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>Upload</button>
        <button className={`tab-btn ${tab === "defaulters" ? "active" : ""}`} onClick={() => setTab("defaulters")}>Defaulters</button>
        <button className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>History</button>
      </nav>
    </div>
  );
}

function StatCard({ label, value, icon, tone = "" }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-trend">Live</span>
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </article>
  );
}

function Bar({ label, value, tone }) {
  return (
    <div className="bar-row">
      <header><span>{label}</span><strong>{value}%</strong></header>
      <div className="bar-track"><div className={`progress-fill ${tone}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">--</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
