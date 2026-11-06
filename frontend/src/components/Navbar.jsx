import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReminder } from "../context/ReminderContext";
import { Pill, Bell, LogOut, User as UserIcon, ShieldCheck } from "lucide-react";

export default function Navbar({ onSimulateReminder }) {
  const { user, role, logout } = useAuth();
  const { triggerTestReminderFlow } = useReminder();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSimulate = async () => {
    if (onSimulateReminder) {
      onSimulateReminder();
    } else {
      await triggerTestReminderFlow();
    }
  };

  const roleColors = {
    patient: "bg-teal-50 text-teal-700 border-teal-200",
    caregiver: "bg-blue-50 text-blue-700 border-blue-200",
    admin: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
              <Pill className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                Medi<span className="text-teal-600">Track</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Adherence Intelligence
              </span>
            </div>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Quick Demo Simulator button */}
            {role === "patient" && (
              <button
                type="button"
                onClick={handleSimulate}
                title="Test how reminders appear when dose time arrives"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:text-teal-800 transition-all shadow-sm"
              >
                <Bell className="w-3.5 h-3.5 text-teal-600" />
                <span>Simulate Dose Reminder</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Role Pill */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    roleColors[role] || roleColors.patient
                  }`}
                >
                  {role}
                </span>

                {/* User info */}
                <div className="hidden md:block text-right">
                  <div className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

