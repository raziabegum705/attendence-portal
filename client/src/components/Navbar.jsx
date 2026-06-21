import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function CapIcon() {
  return (
    <svg className="cap-logo" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M4 24 32 10l28 14-28 14L4 24Z" />
      <path d="M16 31v11c0 6 7 10 16 10s16-4 16-10V31" />
      <path d="M52 28v15" />
      <path d="M52 43c-3 3-3 6 0 9 3-3 3-6 0-9Z" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="fk-navbar" aria-label="Primary navigation">
      <Link to="/" className="logo" aria-label="AttendPortal home">
        <span className="logo-mark"><CapIcon /></span>
        <span>
          <span className="logo-text">AttendPortal AI</span>
          <span className="logo-sub">Attendance intelligence suite</span>
        </span>
      </Link>

      <div className="nav-actions">
        {user && (
          <>
            <div className="nav-user" aria-label={`Signed in as ${user.name}`}>
              <span className="avatar" style={{ width: 34, height: 34, borderRadius: 12 }}>
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
              <span>{user.name}</span>
              <span className="nav-role-badge">{user.role}</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
