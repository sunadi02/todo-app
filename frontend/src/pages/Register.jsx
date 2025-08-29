import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";


const Eye = ({ open, ...props }) =>
  open ? (
    <svg {...props} viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M1.458 10C2.732 5.943 6.522 3 10 3c3.478 0 7.268 2.943 8.542 7-1.274 4.057-5.064 7-8.542 7-3.478 0-7.268-2.943-8.542-7z" stroke="#64748b" strokeWidth="1.5"/><circle cx="10" cy="10" r="3" stroke="#64748b" strokeWidth="1.5"/></svg>
  ) : (
    <svg {...props} viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M3 3l14 14M17.5 10c-.4 1.2-1.1 2.4-2.1 3.4C13.2 15.2 11.7 16 10 16c-1.7 0-3.2-.8-5.4-2.6C3.6 12.4 2.9 11.2 2.5 10c.4-1.2 1.1-2.4 2.1-3.4C6.8 4.8 8.3 4 10 4c1.7 0 3.2.8 5.4 2.6 1 .9 1.7 2.1 2.1 3.4z" stroke="#64748b" strokeWidth="1.5"/><path d="M7.5 7.5a3 3 0 004 4" stroke="#64748b" strokeWidth="1.5"/></svg>
  );


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      console.error("Register error:", error);
      const msg = error.response?.data?.message || "Registration failed. Try again.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4">
      <div className="bg-white/95 p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" fill="#5faeb6" />
            <path d="M30 52l14 14 26-26" stroke="#3f6184" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-center text-[#323a45] mb-2">
          Create your <span className="text-[#5faeb6]">TaskFlow</span> account
        </h2>
        <p className="text-center text-[#3f6184]/80 mb-6 text-sm">
          Sign up to start organizing your tasks and lists
        </p>

        {errMsg && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm text-center">
            {errMsg}
          </div>
        )}

        <form onSubmit={handleRegister} autoComplete="on">
          <div className="mb-4">
            <label htmlFor="register-name" className="block text-sm font-medium text-[#3f6184]">
              Name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5faeb6] bg-slate-50 shadow text-[#323a45] placeholder-[#778899]"
              placeholder="Enter your name"
              required
              autoComplete="name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="register-email" className="block text-sm font-medium text-[#3f6184]">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5faeb6] bg-slate-50 shadow text-[#323a45] placeholder-[#778899]"
              placeholder="Enter your email"
              required
              autoComplete="username"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="register-password" className="block text-sm font-medium text-[#3f6184]">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5faeb6] bg-slate-50 shadow pr-10 text-[#323a45] placeholder-[#778899]"
                placeholder="Enter your password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3f6184]"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                <Eye open={showPwd} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#5faeb6] text-[#f6f7f9] py-2 rounded-xl shadow hover:bg-[#3f6184] transition font-semibold disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#3f6184]">
          Already have an account?{" "}
          <Link to="/" className="text-[#3f6184] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}