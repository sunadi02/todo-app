import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// You can use any icon library, here is a simple SVG for eye/eye-off
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
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Registration failed. Try again.";
      setErrMsg(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100 px-4">
      <div className="bg-white/90 p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" fill="#64748b" />
            <path d="M30 52l14 14 26-26" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
          Create your <span className="text-blue-500">TaskFlow</span> account
        </h2>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Sign up to start organizing your tasks and lists
        </p>

        {errMsg && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm text-center">
            {errMsg}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                <Eye open={showPwd} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700 transition font-semibold"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/" className="text-blue-700 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}