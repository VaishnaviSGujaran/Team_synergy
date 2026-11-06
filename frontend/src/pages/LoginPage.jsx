import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Pill, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === "caregiver") {
        navigate("/caregiver-dashboard");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError("");
    setLoading(true);
    try {
      const user = await quickLogin(role);
      if (user.role === "caregiver") {
        navigate("/caregiver-dashboard");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Demo sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/30">
            <Pill className="w-6 h-6 rotate-45" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Medi<span className="text-teal-600">Track</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Access your medication schedules, reminders, and adherence analytics.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 sm:rounded-2xl sm:px-10">
          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">
              ⚡ Quick Demo 1-Click Fill:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("patient")}
                className="py-1.5 px-2 bg-white hover:bg-teal-100 border border-teal-300 text-teal-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("caregiver")}
                className="py-1.5 px-2 bg-white hover:bg-blue-100 border border-blue-300 text-blue-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Caregiver
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="py-1.5 px-2 bg-white hover:bg-purple-100 border border-purple-300 text-purple-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. patient@meditrack.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("For demo accounts, use password: Password123!")}
                  className="text-xs font-medium text-teal-600 hover:text-teal-700"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50"
              >
                <span>{loading ? "Signing in..." : "Login to MediTrack"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
              Create an Account
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <DisclaimerBanner compact={true} />
        </div>
      </div>
    </div>
  );
}
