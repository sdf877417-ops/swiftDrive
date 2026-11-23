import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Cloud, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try { if (isRegister) await register(name.trim(), email.trim(), password); else await login(email.trim(), password); navigate("/dashboard", { replace: true }); }
    catch (err: unknown) { const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message; setError(message || "Unable to complete your request. Check your connection and try again."); }
    finally { setBusy(false); }
  }
  return <main className="auth-layout"><section className="auth-aside"><Link to="/" className="brand brand-light"><span className="brand-mark"><Cloud size={22}/></span>SwiftDrive</Link><div className="aside-copy"><span className="eyebrow">YOUR SPACE. YOUR FILES.</span><h1>Everything you need.<br/><em>All in one place.</em></h1><p>A simpler, calmer home for the files that matter.</p></div><div className="aside-foot">Private by design · Built for your workflow</div></section><section className="auth-main"><div className="auth-card"><div className="mobile-brand"><span className="brand-mark"><Cloud size={21}/></span>SwiftDrive</div><span className="eyebrow">{isRegister ? "GET STARTED" : "WELCOME BACK"}</span><h2>{isRegister ? "Create your account" : "Sign in to SwiftDrive"}</h2><p className="muted">{isRegister ? "Set up your personal cloud workspace." : "Your files are right where you left them."}</p><form onSubmit={submit} className="auth-form">{isRegister && <label>Full name<div className="input-wrap"><UserRound size={18}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" minLength={2} maxLength={60} required/></div></label>}<label>Email address<div className="input-wrap"><Mail size={18}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div></label><label>Password<div className="input-wrap"><LockKeyhole size={18}/><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={isRegister?"new-password":"current-password"} minLength={8} maxLength={72} required/><button className="icon-button" type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>{error && <div className="error-banner" role="alert">{error}</div>}<button className="primary-button full" disabled={busy}>{busy?"Please wait…":isRegister?"Create account":"Sign in"}</button></form><p className="auth-switch">{isRegister?"Already have an account?":"New to SwiftDrive?"} <Link to={isRegister?"/login":"/register"}>{isRegister?"Sign in":"Create an account"}</Link></p><p className="secure-note"><LockKeyhole size={14}/> Your password is encrypted before storage.</p></div></section></main>;
}
