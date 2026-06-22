import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";

export default function StudentLetterPage() {
  const { token } = useParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [reason, setReason] = useState(() => localStorage.getItem(`draft-reason-${token}`) || "");
  const [additionalNote, setAdditionalNote] = useState(() => localStorage.getItem(`draft-note-${token}`) || "");
  const [aiDraft, setAiDraft] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data } = await api.get(`/letter/form/${token}`);
        setNotification(data.notification);
        setAlreadySubmitted(data.alreadySubmitted);
      } catch (e) {
        setError(e.response?.data?.message || "Invalid or expired link.");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [token]);

  useEffect(() => {
    localStorage.setItem(`draft-reason-${token}`, reason);
    localStorage.setItem(`draft-note-${token}`, additionalNote);
  }, [additionalNote, reason, token]);

  const attendance = useMemo(() => parseFloat(notification?.attendancePercent || 0), [notification]);

  const generateAIDraft = async () => {
    if (!reason.trim()) return toast.error("Please enter your reason first.");
    setAiLoading(true);
    try {
      const { data } = await api.post(`/ai/draft/${token}`, { reason });
      setAiDraft(data.draft);
      toast.success("AI draft generated.");
    } catch (e) {
      toast.error("AI generation failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Reason is required.");
    setSubmitting(true);
    try {
      await api.post(`/letter/submit/${token}`, { reason, additionalNote, aiGeneratedDraft: aiDraft });
      localStorage.removeItem(`draft-reason-${token}`);
      localStorage.removeItem(`draft-note-${token}`);
      setSubmitted(true);
      toast.success("Excuse letter submitted successfully.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="student-page">
      <div className="student-shell single">
        <div className="glass-card student-form-card" style={{ textAlign: "center" }}>
          <span className="spinner dark" style={{ width: 42, height: 42, borderWidth: 3 }} />
          <p style={{ color: "var(--muted)" }}>Loading your secure form...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <StatusScreen title="Link Expired or Invalid" text={error} detail="Please contact your teacher or HOD for a new link." tone="danger" />
  );

  if (alreadySubmitted || submitted) return (
    <StatusScreen title="Submission Successful" text="Your excuse letter has been submitted to the HOD for review." detail="You will be notified after the department decision." tone="success" />
  );

  return (
    <div className="student-page">
      <main className="student-shell">
        <aside className="student-aside glass-card">
          <div className="eyebrow">AttendPortal AI</div>
          <h1 style={{ margin: "10px 0", fontSize: 36, lineHeight: 1 }}>Attendance alert</h1>
          <p className="page-subtitle">Submit a clear excuse letter and optionally use AI to produce a polished draft for HOD review.</p>

          <div className="donut" style={{ "--value": attendance, marginTop: 24 }}>
            <strong>{attendance}%</strong>
          </div>

          <div className="letter-list">
            <Info label="Name" value={notification.studentName} />
            <Info label="Roll No" value={notification.rollNo} />
            <Info label="Subject" value={notification.subject} />
            <Info label="Semester" value={notification.semester} />
          </div>

          <div className="timeline">
            <div className="timeline-step"><span className="timeline-dot">1</span><span>Explain the reason for low attendance.</span></div>
            <div className="timeline-step"><span className="timeline-dot">2</span><span>Generate an AI draft if you want a formal version.</span></div>
            <div className="timeline-step"><span className="timeline-dot">3</span><span>Submit once. The HOD receives it for review.</span></div>
          </div>
        </aside>

        <section className="student-form-card glass-card">
          <div className="eyebrow">Excuse Letter</div>
          <h2 style={{ margin: "10px 0 18px" }}>Prepare your submission</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Reason for Low Attendance</label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Explain your reason clearly. Include dates or context if relevant."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
              <div className="character-counter">{reason.length}/700 · Auto-saved draft</div>
            </div>

            <div className="ai-panel" style={{ marginBottom: 18 }}>
              <h3>AI Suggestions</h3>
              <p style={{ color: "var(--muted-2)", marginTop: 0 }}>
                Keep the reason factual, respectful, specific, and concise. Mention supporting documents only if available.
              </p>
              <button type="button" className="btn btn-outline" onClick={generateAIDraft} disabled={aiLoading}>
                {aiLoading ? <><span className="spinner dark" /> Generating draft</> : "Generate with AI"}
              </button>
            </div>

            {aiDraft && (
              <div className="ai-panel" style={{ marginBottom: 18 }}>
                <h3>AI-Generated Letter Draft</h3>
                <div className="ai-draft-box">{aiDraft}</div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Optional supporting context, document references, or follow-up details."
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
              />
              <div className="character-counter">{additionalNote.length}/400</div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? <><span className="spinner" /> Submitting</> : "Submit Excuse Letter to HOD"}
            </button>

            <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>
              By submitting, you confirm the information provided is accurate. This form can only be submitted once.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-box">
      <span style={{ color: "var(--muted)", display: "block", fontSize: 12 }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusScreen({ title, text, detail, tone }) {
  return (
    <div className="student-page">
      <div className="student-shell single">
        <div className="glass-card student-form-card" style={{ textAlign: "center" }}>
          <div className={`empty-icon ${tone === "danger" ? "badge-danger" : "badge-approved"}`}>{tone === "danger" ? "!" : "OK"}</div>
          <h1>{title}</h1>
          <p style={{ color: "var(--muted-2)" }}>{text}</p>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>{detail}</p>
        </div>
      </div>
    </div>
  );
}