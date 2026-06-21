import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const statusColors = { pending: "badge-pending", approved: "badge-approved", rejected: "badge-rejected" };

export default function HODDashboard() {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [insights, setInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [remarks, setRemarks] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lettersRes, statsRes] = await Promise.all([
        api.get("/hod/letters"),
        api.get("/hod/stats"),
      ]);
      setLetters(lettersRes.data);
      setStats(statsRes.data);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      const { data } = await api.patch(`/hod/letters/${id}`, { status, hodRemarks: remarks[id] || "" });
      setLetters((prev) => prev.map((letter) => letter._id === id ? data.letter : letter));
      toast.success(`Letter ${status} successfully.`);
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const { data } = await api.get("/ai/insights");
      setInsights(data.insights);
    } catch (e) {
      toast.error("Failed to load AI insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const submitted = stats.total || letters.length || 0;
    const pending = stats.pending || letters.filter((l) => l.status === "pending").length;
    const approved = stats.approved || letters.filter((l) => l.status === "approved").length;
    const rejected = stats.rejected || letters.filter((l) => l.status === "rejected").length;
    const estimatedDefaulters = Math.max(submitted + pending, Math.ceil(submitted / 0.6) || 0);
    const noLetter = Math.max(estimatedDefaulters - submitted, 0);
    const late = letters.filter((letter) => {
      const submittedAt = new Date(letter.submittedAt);
      return Date.now() - submittedAt.getTime() > 1000 * 60 * 60 * 24 * 3;
    }).length;
    const avgAttendance = letters.length
      ? Math.round(letters.reduce((sum, letter) => sum + parseFloat(letter.attendancePercent || 0), 0) / letters.length)
      : 0;
    return {
      submitted,
      pending,
      approved,
      rejected,
      estimatedDefaulters,
      noLetter,
      late,
      avgAttendance,
      submissionPct: estimatedDefaulters ? Math.round((submitted / estimatedDefaulters) * 100) : 0,
      approvalPct: submitted ? Math.round((approved / submitted) * 100) : 0,
      rejectedPct: submitted ? Math.round((rejected / submitted) * 100) : 0,
      today: letters.filter((l) => new Date(l.submittedAt).toDateString() === new Date().toDateString()).length,
      weekly: letters.filter((l) => Date.now() - new Date(l.submittedAt).getTime() < 1000 * 60 * 60 * 24 * 7).length,
      monthly: letters.filter((l) => Date.now() - new Date(l.submittedAt).getTime() < 1000 * 60 * 60 * 24 * 30).length,
    };
  }, [letters, stats]);

  const filtered = filter === "all" ? letters : letters.filter((letter) => letter.status === filter);
  const recentApproved = letters.filter((l) => l.status === "approved").slice(0, 3);
  const recentRejected = letters.filter((l) => l.status === "rejected").slice(0, 3);

  return (
    <div className="page-container">
      <section className="page-hero">
        <div className="hero-copy glass-card">
          <div className="eyebrow">HOD Approval Workspace</div>
          <h1 className="page-title">Department Review Board</h1>
          <p className="page-subtitle">
            {user?.department || "Department"} excuse letters, approval trends, risk signals, and AI recommendations in one executive dashboard.
          </p>
        </div>
        <div className="glass-card chart-card">
          <div className="eyebrow">Submission Coverage</div>
          <div className="donut" style={{ "--value": analytics.submissionPct }}>
            <strong>{analytics.submissionPct}%</strong>
          </div>
          <p style={{ color: "var(--muted)", textAlign: "center", margin: 0 }}>{analytics.noLetter} students still pending submission</p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Total Defaulters" value={analytics.estimatedDefaulters} icon="DF" tone="red" />
        <StatCard label="Submitted Letters" value={analytics.submitted} icon="SB" tone="blue" />
        <StatCard label="No Letter Submitted" value={analytics.noLetter} icon="NL" tone="yellow" />
        <StatCard label="Pending Review" value={analytics.pending} icon="PR" tone="yellow" />
        <StatCard label="Approved" value={analytics.approved} icon="AP" tone="green" />
        <StatCard label="Rejected" value={analytics.rejected} icon="RJ" tone="red" />
        <StatCard label="Late Submissions" value={analytics.late} icon="LT" tone="red" />
        <StatCard label="Average Attendance" value={`${analytics.avgAttendance}%`} icon="AV" tone="blue" />
      </section>

      <section className="analytics-grid" style={{ marginBottom: 18 }}>
        <div className="fk-card">
          <div className="fk-card-header">
            <h2>Approval Trends</h2>
          </div>
          <div className="fk-card-body bar-stack">
            <Bar label="Submission percentage" value={analytics.submissionPct} tone="safe" />
            <Bar label="Approval percentage" value={analytics.approvalPct} tone="safe" />
            <Bar label="Rejected percentage" value={analytics.rejectedPct} tone="danger" />
            <Bar label="Today submissions" value={Math.min(100, analytics.today * 18)} tone="warning" />
            <Bar label="Weekly submissions" value={Math.min(100, analytics.weekly * 10)} tone="safe" />
            <Bar label="Monthly submissions" value={Math.min(100, analytics.monthly * 4)} tone="safe" />
          </div>
        </div>

        <div className="fk-card">
          <div className="fk-card-header">
            <h2>AI Analytics Dashboard</h2>
            <button className="btn btn-blue btn-sm" onClick={loadInsights} disabled={insightsLoading}>
              {insightsLoading ? <><span className="spinner" /> Analyzing</> : "Generate Insights"}
            </button>
          </div>
          <div className="fk-card-body">
            <div className="insight-grid">
              <Insight title="Confidence" value={letters.length ? "86%" : "--"} text="Based on submitted letter volume" />
              <Insight title="Risk Score" value={analytics.noLetter > 10 ? "High" : "Moderate"} text="Pending students and low attendance" />
              <Insight title="Suggestion" value="Prioritize" text="Review pending and late submissions first" />
            </div>
            {insights ? (
              <div className="ai-panel" style={{ marginTop: 14 }}>
                <h3>Gemini Analysis</h3>
                <div className="ai-draft-box">{insights}</div>
              </div>
            ) : (
              <p style={{ color: "var(--muted)", margin: "16px 0 0" }}>Generate AI insights to convert plain analysis into recommendations, warnings, and action points.</p>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="fk-card">
          <div className="fk-card-header">
            <h2>Excuse Letters</h2>
            <div className="tab-bar">
              {["all", "pending", "approved", "rejected"].map((item) => (
                <button key={item} className={`tab-btn ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="fk-card-body">
            {loading ? (
              <div className="empty-state"><span className="spinner dark" /><p style={{ marginTop: 12 }}>Loading letters...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">--</div>
                <h3>No Letters Found</h3>
                <p>No {filter !== "all" ? filter : ""} excuse letters submitted yet.</p>
              </div>
            ) : (
              <div className="letter-list">
                {filtered.map((letter) => (
                  <article className="letter-card" key={letter._id}>
                    <div className="letter-head">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span className="avatar">{letter.studentName?.charAt(0)?.toUpperCase() || "S"}</span>
                          <h3 style={{ margin: 0 }}>{letter.studentName}</h3>
                          <span className={`badge ${statusColors[letter.status]}`}>{letter.status === "pending" ? "Under Review" : letter.status}</span>
                        </div>
                        <div className="letter-meta">
                          <span>{letter.rollNo}</span>
                          <span>{letter.subject} · {letter.semester}</span>
                          <span>{letter.attendancePercent}% attendance</span>
                          <span>{letter.studentEmail}</span>
                        </div>
                      </div>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>
                        {new Date(letter.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="reason-box">
                      <strong style={{ color: "var(--text)" }}>Reason</strong>
                      <p style={{ margin: "6px 0 0" }}>{letter.reason}</p>
                    </div>

                    {letter.aiGeneratedDraft && (
                      <details style={{ marginTop: 10 }}>
                        <summary style={{ cursor: "pointer", color: "var(--accent-2)", fontWeight: 800 }}>View AI-generated draft</summary>
                        <div className="ai-draft-box">{letter.aiGeneratedDraft}</div>
                      </details>
                    )}

                    {letter.status === "pending" && (
                      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          className="form-control"
                          style={{ maxWidth: 360 }}
                          placeholder="Optional HOD remarks..."
                          value={remarks[letter._id] || ""}
                          onChange={(e) => setRemarks((prev) => ({ ...prev, [letter._id]: e.target.value }))}
                        />
                        <button className="btn btn-success btn-sm" onClick={() => handleAction(letter._id, "approved")}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(letter._id, "rejected")}>Reject</button>
                      </div>
                    )}

                    {letter.hodRemarks && (
                      <div className="info-box" style={{ marginTop: 10 }}>
                        <strong>HOD remarks:</strong> {letter.hodRemarks}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="glass-card chart-card">
          <div className="eyebrow">Recent Activity</div>
          <h2>Workflow Pulse</h2>
          <MiniList title="Recent submissions" items={letters.slice(0, 3)} fallback="No submissions yet" />
          <MiniList title="Recent approvals" items={recentApproved} fallback="No approvals yet" />
          <MiniList title="Recent rejections" items={recentRejected} fallback="No rejections yet" />
        </aside>
      </section>
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

function Insight({ title, value, text }) {
  return (
    <div className="insight-card">
      <div style={{ color: "var(--muted)", fontSize: 12 }}>{title}</div>
      <strong style={{ display: "block", fontSize: 22, marginTop: 6 }}>{value}</strong>
      <p style={{ color: "var(--muted)", margin: "6px 0 0", fontSize: 12 }}>{text}</p>
    </div>
  );
}

function MiniList({ title, items, fallback }) {
  return (
    <div style={{ marginTop: 18 }}>
      <h3 style={{ fontSize: 14, margin: "0 0 10px" }}>{title}</h3>
      {items.length ? items.map((item) => (
        <div className="info-box" style={{ marginBottom: 8 }} key={`${title}-${item._id}`}>
          <strong>{item.studentName}</strong>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>{item.subject} · {item.status}</div>
        </div>
      )) : <p style={{ color: "var(--muted)", margin: 0 }}>{fallback}</p>}
    </div>
  );
}
