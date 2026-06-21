import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function EyeIcon({ hidden = false }) {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="3" />
      {hidden && <path d="M4 4l16 16" />}
    </svg>
  );
}

function CapIcon() {
  return (
    <svg className="cap-hero-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M4 24 32 10l28 14-28 14L4 24Z" />
      <path d="M16 31v11c0 6 7 10 16 10s16-4 16-10V31" />
      <path d="M52 28v15" />
      <path d="M52 43c-3 3-3 6 0 9 3-3 3-6 0-9Z" />
    </svg>
  );
}

const friendlyAuthError = (err, fallback) => {
  const message = err.response?.data?.message || err.message || "";
  if (/ssl|openssl|tls|alert|network/i.test(message)) {
    return "Unable to reach the server securely. Please check that the backend is running and configured correctly.";
  }
  return message || fallback;
};

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", role: "teacher", department: "" });

  const strength = useMemo(() => {
    const password = regForm.password;
    let score = 0;
    if (password.length >= 8) score += 30;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    if (password.length >= 12) score += 10;
    return Math.min(score, 100);
  }, [regForm.password]);

  const strengthLabel = strength > 75 ? "Strong" : strength > 45 ? "Medium" : regForm.password ? "Weak" : "Start typing";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(loginForm.email, loginForm.password);
      if (remember) localStorage.setItem("rememberEmail", loginForm.email);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(friendlyAuthError(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(regForm);
      toast.success(`Account created. Welcome, ${user.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(friendlyAuthError(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-container">
        <section className="login-left glass-card" aria-label="Platform overview">
          <div className="brand-cap">
            <CapIcon />
            <span>AttendPortal AI</span>
          </div>
          <div className="eyebrow">AI Attendance Command Center</div>
          <h1 className="page-title">Student Attendance Alert Portal</h1>
          <p className="page-subtitle">
            Upload attendance sheets, detect risk instantly, notify students, and route excuse letters through a polished HOD workflow.
          </p>

          <div className="login-visual" aria-hidden="true">
            <div className="orbital" />
            <div className="floating-card one"><strong>70 defaulters</strong>Detected from Excel</div>
            <div className="floating-card two"><strong>42 submitted</strong>Letters under review</div>
            <div className="floating-card three"><strong>AI ready</strong>Drafts and insights</div>
          </div>

          <ul className="feature-list">
            <li>Excel upload with automatic defaulter detection</li>
            <li>Email and WhatsApp alert workflow</li>
            <li>AI excuse letter drafting for students</li>
            <li>HOD approvals with analytics and trends</li>
          </ul>
        </section>

        <section className="login-right glass-card">
          <div className="eyebrow">Secure role-based access</div>
          <h2 style={{ margin: "10px 0 18px", fontSize: 30 }}>Welcome back</h2>

          <div className="tab-bar" role="tablist" aria-label="Authentication mode">
            <button className={`tab-btn ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")} type="button">Login</button>
            <button className={`tab-btn ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")} type="button">Register</button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} style={{ marginTop: 22 }}>
              <div className="form-group input-wrap floating-label">
                <input
                  className="form-control"
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
                <label>Email address</label>
              </div>

              <div className="form-group input-wrap floating-label">
                <input
                  className="form-control"
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  style={{ paddingRight: 56 }}
                />
                <label>Password</label>
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowLoginPassword((value) => !value)}
                >
                  <EyeIcon hidden={showLoginPassword} />
                </button>
              </div>

              <div className="login-actions">
                <label>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <button className="tab-btn" type="button" onClick={() => toast("Ask your administrator to reset your password.")}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
                {loading ? <><span className="spinner" /> Signing in</> : "Sign in"}
              </button>

              <div className="info-box" style={{ marginTop: 16 }}>
                Demo flow: register as a teacher to upload attendance, or as HOD to review letters.
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ marginTop: 22 }}>
              <div className="form-group input-wrap floating-label">
                <input className="form-control" type="text" required value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
                <label>Full name</label>
              </div>
              <div className="form-group input-wrap floating-label">
                <input className="form-control" type="email" required value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                <label>College email</label>
              </div>
              <div className="form-group input-wrap floating-label">
                <input
                  className="form-control"
                  type={showRegisterPassword ? "text" : "password"}
                  required
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  style={{ paddingRight: 56 }}
                />
                <label>Create password</label>
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowRegisterPassword((value) => !value)}
                >
                  <EyeIcon hidden={showRegisterPassword} />
                </button>
                <div className="strength-track">
                  <div className="strength-fill" style={{ width: `${strength}%` }} />
                </div>
                <div className="strength-text">Password strength: {strengthLabel}</div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-control" value={regForm.role} onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}>
                    <option value="teacher">Teacher</option>
                    <option value="hod">HOD</option>
                  </select>
                </div>
                <div className="form-group input-wrap floating-label">
                  <input className="form-control" type="text" required value={regForm.department} onChange={(e) => setRegForm({ ...regForm, department: e.target.value })} />
                  <label>Department</label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
                {loading ? <><span className="spinner" /> Creating account</> : "Create account"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
