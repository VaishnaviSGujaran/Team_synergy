import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2,
  Clock,
  Bell,
  TrendingUp,
  ShieldCheck,
  Users,
  Activity,
  ArrowRight,
  AlertTriangle,
  Pill,
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function LandingPage() {
  const { quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async (role) => {
    try {
      await quickLogin(role);
      if (role === "caregiver") {
        navigate("/caregiver-dashboard");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Pill className="w-5 h-5 rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Medi<span className="text-teal-600">Track</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-teal-700 px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span>Medication Adherence Intelligence Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Stay on Track With Your Medication
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
                MediTrack helps chronic patients manage medication schedules, confirm doses, understand adherence patterns, and stay connected with authorized caregivers.
              </p>

              {/* Crucial Distinciton Notice */}
              <div className="bg-teal-50/80 border-l-4 border-teal-600 p-4 rounded-r-xl text-sm text-teal-950 flex items-start space-x-3 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Verified Intake Distinction:</strong> A reminder delivered does <em>not</em> mean medication was taken. MediTrack requires explicit patient response: Taken, Missed, or Snoozed.
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/register"
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl shadow-sm transition-all"
                >
                  Login to Account
                </Link>
              </div>

              {/* 1-Click Interactive Demo Selector for Hackathon Evaluators */}
              <div className="pt-4 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  ⚡ 1-Click Live Demonstration Access:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDemo("patient")}
                    className="px-3 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-lg text-xs font-bold transition-colors"
                  >
                    👤 Patient (Vaishnavi)
                  </button>
                  <button
                    onClick={() => handleDemo("caregiver")}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg text-xs font-bold transition-colors"
                  >
                    🩺 Caregiver (Rajesh)
                  </button>
                  <button
                    onClick={() => handleDemo("admin")}
                    className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-bold transition-colors"
                  >
                    🛡️ Admin (Dr. Mitchell)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Dashboard Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-6 relative">
                {/* Header Mockup */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Live Preview</span>
                    <h3 className="text-lg font-bold text-slate-800">Today's Schedule</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium">Today's Adherence</span>
                    <div className="text-2xl font-black text-teal-600">86%</div>
                  </div>
                </div>

                {/* Doses List Sample */}
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500 text-white rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Metformin 500 mg</div>
                        <div className="text-xs text-slate-500">8:00 AM • After breakfast</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                      ✓ Taken
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-500 text-white rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Aspirin 75 mg</div>
                        <div className="text-xs text-slate-500">1:00 PM • After lunch</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                      ⏰ Pending
                    </span>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-rose-500 text-white rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Atorvastatin 20 mg</div>
                        <div className="text-xs text-slate-500">8:00 PM • Bedtime</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full">
                      ✕ Missed
                    </span>
                  </div>
                </div>

                {/* Pattern Intelligence Callout */}
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                  <div className="flex items-center space-x-2 text-teal-800 font-bold text-xs uppercase mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Adherence Pattern Intelligence</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Evening medications are missed more frequently than morning medications. Morning: 94%, Evening: 71%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Flow Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">
              The MediTrack Verified Intake Lifecycle
            </h2>
            <p className="mt-3 text-slate-600">
              Unlike generic alarm apps, MediTrack ensures accuracy and prevents alert fatigue through confirmed dose tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            {[
              { step: "1", title: "Prescription", desc: "Add medication & instructions" },
              { step: "2", title: "Configured Reminder", desc: "Timely alerts with quiet hours" },
              { step: "3", title: "Patient Response", desc: "Taken, Missed, or Snoozed" },
              { step: "4", title: "Dose Record", desc: "Verified intake logged in DB" },
              { step: "5", title: "Pattern Analysis", desc: "Identifies missed routines" },
              { step: "6", title: "Caregiver View", desc: "Authorized adherence summary" },
            ].map((item) => (
              <div key={item.step} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm inline-flex items-center justify-center mb-2">
                  {item.step}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Core Pillars */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-4">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Fatigue-Free Reminders</h3>
              <p className="text-sm text-slate-600">
                Customizable quiet hours, follow-up intervals, and max reminder counts so notifications never become overwhelming.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Explicit Confirmation</h3>
              <p className="text-sm text-slate-600">
                Doses are never assumed taken. Patients explicitly choose Taken, Snooze (10m, 20m, 30m), or Missed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Adherence Intelligence</h3>
              <p className="text-sm text-slate-600">
                Automated detection of morning vs evening drops, weekend inconsistencies, and safe timing suggestions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Caregiver Oversight</h3>
              <p className="text-sm text-slate-600">
                Patients securely authorize family or caregivers to view read-only adherence summaries without altering prescriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice & Footer */}
      <footer className="bg-white border-t border-slate-200 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DisclaimerBanner />
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} MediTrack — Medication Adherence Intelligence Platform. Built for Chronic Care.</p>
            <div className="flex space-x-4 mt-3 sm:mt-0 font-medium">
              <span>Patient Privacy Protected</span>
              <span>•</span>
              <span>Read-Only Caregiver Roles</span>
              <span>•</span>
              <span>Medical Safety Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

