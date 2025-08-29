
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: code, 3: new password
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ... keep your existing handleLogin function ...

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    try {
      const res = await API.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.response?.data?.message || "Login failed. Please try again.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);
    try {
      const response = await API.post(
        "/api/auth/forgot-password",
        { email: resetEmail },
        { timeout: 10000 }
      );
      setErrMsg(response.data.message || "Password reset initiated. Check your email.");
      setResetStep(2);
    } catch (error) {
      let errorMessage = "Failed to send reset code";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      setErrMsg(errorMessage);
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

      

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/api/auth/verify-reset-code", {
        email: resetEmail,
        code: resetCode
      });
      setResetStep(3);
      setErrMsg("");
    } catch (error) {
      console.error("Verify code error:", error);
      setErrMsg(error.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/api/auth/reset-password", {
        email: resetEmail,
        code: resetCode,
        newPassword
      });
      setShowForgotPassword(false);
      setResetStep(1);
      setErrMsg("Password reset successfully! You can now login.");
    } catch (error) {
      console.error("Reset password error:", error);
      setErrMsg(error.response?.data?.message || "Failed to reset password");
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
          Welcome to <span className="text-[#5faeb6]">TaskFlow</span>
        </h2>
        <p className="text-center text-[#3f6184]/80 mb-6 text-sm">
          Sign in to manage your tasks and lists
        </p>

        {errMsg && (
          <div className={`p-3 rounded mb-4 text-sm text-center ${
            errMsg.includes("successfully") || errMsg.includes("sent") ?
              "bg-green-100 text-green-700" :
              "bg-red-100 text-red-700"
          }`}>
            {errMsg}
          </div>
        )}

        {!showForgotPassword ? (
          <>
            <form onSubmit={handleLogin} autoComplete="on">
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5faeb6] bg-white shadow"
                  placeholder="Enter your email"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5faeb6] bg-white shadow pr-10"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? (
                      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M1.458 10C2.732 5.943 6.522 3 10 3c3.478 0 7.268 2.943 8.542 7-1.274 4.057-5.064 7-8.542 7-3.478 0-7.268-2.943-8.542-7z" stroke="#64748b" strokeWidth="1.5"/><circle cx="10" cy="10" r="3" stroke="#64748b" strokeWidth="1.5"/></svg>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M3 3l14 14M17.5 10c-.4 1.2-1.1 2.4-2.1 3.4C13.2 15.2 11.7 16 10 16c-1.7 0-3.2-.8-5.4-2.6C3.6 12.4 2.9 11.2 2.5 10c.4-1.2 1.1-2.4 2.1-3.4C6.8 4.8 8.3 4 10 4c1.7 0 3.2.8 5.4 2.6 1 .9 1.7 2.1 2.1 3.4z" stroke="#64748b" strokeWidth="1.5"/><path d="M7.5 7.5a3 3 0 004 4" stroke="#64748b" strokeWidth="1.5"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5faeb6] text-[#f6f7f9] py-2 rounded-xl shadow hover:bg-[#3f6184] transition font-semibold disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>

              <div className="mb-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#5faeb6] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#3f6184] hover:underline">
                Register here
              </Link>
            </p>
          </>
        ) : (
          <div className="forgot-password-form">
            {resetStep === 1 && (
              <form onSubmit={handleForgotPassword} autoComplete="on">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Reset Password</h3>
                <div className="mb-4">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow"
                    placeholder="Enter your email"
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 bg-gray-200 text-slate-800 py-2 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#5faeb6] text-[#f6f7f9] py-2 rounded-xl shadow hover:bg-[#3f6184] transition font-semibold disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Code"}
                  </button>
                </div>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyCode} autoComplete="on">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Enter Verification Code</h3>
                <p className="text-sm text-slate-600 mb-4">
                  We sent a 6-digit code to {resetEmail}
                </p>
                <div className="mb-4">
                  <label htmlFor="reset-code" className="block text-sm font-medium text-slate-700">
                    Verification Code
                  </label>
                  <input
                    id="reset-code"
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow"
                    placeholder="Enter 6-digit code"
                    required
                    autoComplete="one-time-code"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="flex-1 bg-gray-200 text-slate-800 py-2 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#5faeb6] text-[#f6f7f9] py-2 rounded-xl shadow hover:bg-[#3f6184] transition font-semibold disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleResetPassword} autoComplete="on">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Set New Password</h3>
                <div className="mb-4">
                  <label htmlFor="reset-new-password" className="block text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <input
                    id="reset-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow"
                    placeholder="Enter new password"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(2)}
                    className="flex-1 bg-gray-200 text-slate-800 py-2 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#5faeb6] text-[#f6f7f9] py-2 rounded-xl shadow hover:bg-[#3f6184] transition font-semibold disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}