import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: code, 3: new password
  const navigate = useNavigate();

  // ... keep your existing handleLogin function ...

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Login failed. Please try again.";
      setErrMsg(msg);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: resetEmail
      });
      setResetStep(2);
      setErrMsg("");
    } catch (error) {
      setErrMsg(error.response?.data?.message || "Failed to send reset code");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/verify-reset-code", {
        email: resetEmail,
        code: resetCode
      });
      setResetStep(3);
      setErrMsg("");
    } catch (error) {
      setErrMsg(error.response?.data?.message || "Invalid verification code");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        email: resetEmail,
        code: resetCode,
        newPassword
      });
      setShowForgotPassword(false);
      setResetStep(1);
      setErrMsg("Password reset successfully! You can now login.");
    } catch (error) {
      setErrMsg(error.response?.data?.message || "Failed to reset password");
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
          Welcome to <span className="text-blue-500">TaskFlow</span>
        </h2>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Sign in to manage your tasks and lists
        </p>

        {errMsg && (
          <div className={`bg-${errMsg.includes("success") ? "green" : "red"}-100 text-${errMsg.includes("success") ? "green" : "red"}-700 p-2 rounded mb-4 text-sm text-center`}>
            {errMsg}
          </div>
        )}

        {!showForgotPassword ? (
          <>
            <form onSubmit={handleLogin}>
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700 transition font-semibold"
          >
            Log In
          </button>
              
              <div className="mb-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-700 hover:underline">
                Register here
              </Link>
            </p>
          </>
        ) : (
          <div className="forgot-password-form">
            {resetStep === 1 && (
              <form onSubmit={handleForgotPassword}>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Reset Password</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow"
                    placeholder="Enter your email"
                    required
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
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700 transition font-semibold"
                  >
                    Send Code
                  </button>
                </div>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyCode}>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Enter Verification Code</h3>
                <p className="text-sm text-slate-600 mb-4">
                  We sent a 6-digit code to {resetEmail}
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow"
                    placeholder="Enter 6-digit code"
                    required
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
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700 transition font-semibold"
                  >
                    Verify Code
                  </button>
                </div>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Set New Password</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow"
                    placeholder="Enter new password"
                    required
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
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700 transition font-semibold"
                  >
                    Reset Password
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