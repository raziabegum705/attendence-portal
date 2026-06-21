import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import HODDashboard from "./pages/HODDashboard";
import StudentLetterPage from "./pages/StudentLetterPage";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className={user ? "app-shell" : ""}>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {user?.role === "hod" ? <HODDashboard /> : <TeacherDashboard />}
            </ProtectedRoute>
          }
        />
        <Route path="/teacher" element={<ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/hod" element={<ProtectedRoute requiredRole="hod"><HODDashboard /></ProtectedRoute>} />
        <Route path="/letter/:token" element={<StudentLetterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Inter', sans-serif",
              background: "rgba(12,17,32,0.92)",
              color: "#f7f8ff",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "16px",
              backdropFilter: "blur(18px)",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
