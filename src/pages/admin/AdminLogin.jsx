import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [setupUri, setSetupUri] = useState("");
  const [stage, setStage] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const secret = useMemo(() => {
    try { return setupUri ? new URL(setupUri).searchParams.get("secret") : ""; }
    catch { return ""; }
  }, [setupUri]);

  async function submitPassword(event) {
    event.preventDefault();
    setError(""); setLoading(true);
    try {
      const response = await api.post("/users/admin-login", { email, password });
      setMfaToken(response.data.mfa_token);
      setSetupUri(response.data.provisioning_uri || "");
      setStage("mfa");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to sign in. Please try again.");
    } finally { setLoading(false); }
  }

  async function submitMfa(event) {
    event.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/users/admin-mfa/verify", { mfa_token: mfaToken, code });
      sessionStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("role", "Administrator");
      localStorage.setItem("email", email);
      navigate("/admin");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "The authentication code was not accepted.");
    } finally { setLoading(false); }
  }

  return <div className="grid min-h-screen place-items-center bg-slate-50 p-5"><div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl"><div className="bg-green-700 p-8 text-white"><p className="text-xs font-bold tracking-[0.2em] text-green-100">RESTRICTED ACCESS</p><h1 className="mt-3 text-3xl font-bold">Administrator sign in</h1><p className="mt-2 text-sm leading-6 text-green-50">A password and authenticator code are required to access platform controls.</p></div><div className="p-8">
    {stage === "password" ? <form onSubmit={submitPassword} className="space-y-5"><label className="block text-sm font-semibold text-slate-700">Administrator email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required className="input mt-2" placeholder="name@example.com" /></label><label className="block text-sm font-semibold text-slate-700">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="input mt-2" placeholder="Your password" /></label><button disabled={loading} className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50">{loading ? "Checking credentials…" : "Continue securely"}</button></form> : <form onSubmit={submitMfa} className="space-y-5"><div><h2 className="text-xl font-bold text-slate-900">{setupUri ? "Set up your authenticator" : "Verify your identity"}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{setupUri ? "Add the account below to Google Authenticator, Authy, Microsoft Authenticator, or another TOTP app. Then enter its six-digit code." : "Open your authenticator app and enter the current six-digit code."}</p></div>{secret && <div className="rounded-xl border border-green-200 bg-green-50 p-4"><p className="text-xs font-bold tracking-wider text-green-800">SETUP KEY</p><p className="mt-2 break-all font-mono text-sm font-semibold text-slate-800">{secret}</p><p className="mt-2 text-xs leading-5 text-slate-600">Keep this key private. It is shown only while you enrol your authenticator.</p></div>}<label className="block text-sm font-semibold text-slate-700">Authenticator code<input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} autoComplete="one-time-code" required className="input mt-2 text-center text-xl tracking-[0.45em]" placeholder="000000" /></label><button disabled={loading || code.length !== 6} className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50">{loading ? "Verifying…" : "Verify and sign in"}</button><button type="button" onClick={() => { setStage("password"); setCode(""); setError(""); }} className="w-full text-sm font-semibold text-green-700">Use a different account</button></form>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  </div></div></div>;
}

export default AdminLogin;
