import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./features/auth/AuthContext";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import AuthPage from "./features/auth/AuthPage";
import FileDashboard from "./features/files/FileDashboard";
import { Cloud, ShieldCheck, Zap, FolderOpen } from "lucide-react";
function HomePage() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="screen-center">
        <div className="spinner" />
      </div>
    );
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <main className="landing">
      <nav className="landing-nav">
        <a className="brand" href="/">
          <span className="brand-mark">
            <Cloud size={22} />
          </span>
          SwiftDrive
        </a>
        <div>
          <a className="nav-link" href="/login">
            Sign in
          </a>
          <a className="primary-button small" href="/register">
            Create account
          </a>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> YOUR PERSONAL CLOUD
          </span>
          <h1>
            All your files.
            <br />
            <em>One calm place.</em>
          </h1>
          <p>
            Keep your documents, photos and important files together in a
            simple, secure workspace you can access anywhere.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="/register">
              Get started free <span>→</span>
            </a>
            <a className="text-link" href="/login">
              I already have an account
            </a>
          </div>
          <div className="trust-line">
            <ShieldCheck size={16} /> Private accounts · Simple file management
          </div>
        </div>
        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="cloud-card">
            <div className="cloud-card-top">
              <span className="mini-dot" />
              <span className="mini-dot" />
              <span className="mini-dot" />
            </div>
            <div className="cloud-symbol">
              <Cloud size={54} />
            </div>
            <div className="art-line long" />
            <div className="art-line short" />
            <div className="art-file">
              <FolderOpen size={19} />
              <span>My files</span>
              <b>•••</b>
            </div>
            <div className="art-file">
              <span className="file-square">PDF</span>
              <span>Project brief.pdf</span>
              <b>↗</b>
            </div>
            <div className="art-file">
              <span className="file-square image-square">IMG</span>
              <span>Summer photo.png</span>
              <b>↗</b>
            </div>
          </div>
          <div className="floating-badge">
            <Zap size={16} /> Ready when you are
          </div>
        </div>
      </section>
      <section className="feature-strip">
        <div>
          <span className="feature-icon">
            <ShieldCheck size={20} />
          </span>
          <strong>Private by default</strong>
          <small>Your files belong to your account.</small>
        </div>
        <div>
          <span className="feature-icon">
            <Zap size={20} />
          </span>
          <strong>Simple uploads</strong>
          <small>Upload files up to 100 MB each.</small>
        </div>
        <div>
          <span className="feature-icon">
            <FolderOpen size={20} />
          </span>
          <strong>Everything organized</strong>
          <small>Find and manage your files easily.</small>
        </div>
      </section>
      <footer className="landing-footer">
        © {new Date().getFullYear()} SwiftDrive
      </footer>
    </main>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<FileDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
