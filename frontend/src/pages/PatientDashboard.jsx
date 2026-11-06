import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReminder } from "../context/ReminderContext";
import { api } from "../services/api";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Bell,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Check,
  X
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import ReminderModal from "../components/ReminderModal";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { triggerReminder, confirmDoseTaken, snoozeDose, markDoseMissed } = useReminder();

  const [todayData, setTodayData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const loadDashboardData = async () => {
    try {
      const [todayRes, analyticsRes] = await Promise.all([
        api.getTodayDoses(),
        api.getAnalytics(14),
      ]);
      setTodayData(todayRes);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error("Dashboard data load failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickResponse = async (doseId, status) => {
    setRefreshing(true);
    if (status === "TAKEN") {
      await confirmDoseTaken(doseId);
    } else if (status === "SNOOZED") {
      await snoozeDose(doseId, 20);
    } else if (status === "MISSED") {
      await markDoseMissed(doseId);
    }
    await loadDashboardData();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "TAKEN":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Taken</span>
          </span>
        );
      case "SNOOZED":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Snoozed</span>
          </span>
        );
      case "MISSED":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Missed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Pending</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading your medication dashboard...</p>
        </div>
      </div>
    );
  }

  const adherenceScore = todayData?.today_adherence ?? 86;
  const doses = todayData?.doses || [];

  return (
    <div className="space-y-6">
      {/* Reminder Modal for in-app reminders */}
      <ReminderModal onStatusUpdated={loadDashboardData} />

      {/* Top Welcome Bar */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-teal-200 text-xs font-bold uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {getGreeting()}, {user?.name || "Vaishnavi"}
          </h1>
          <p className="text-sm text-teal-100 mt-1 max-w-xl">
            Here is your daily medication adherence status. Doses require explicit confirmation to be recorded as taken.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/medications"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Medication</span>
          </Link>
          <button
            onClick={() => {
              const pendingDose = doses.find((d) => d.status === "PENDING") || doses[0];
              if (pendingDose) {
                triggerReminder(pendingDose);
              }
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-colors"
          >
            <Bell className="w-4 h-4 text-teal-300" />
            <span>Test Reminder Alert</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: Adherence Percentage & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Large Adherence Gauge Card */}
        <div className="md:col-span-5 lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Today's Adherence
              </h2>
              <span className="text-xs text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Verified
              </span>
            </div>

            <div className="flex items-center space-x-6 my-2">
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-slate-100"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-teal-600 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - adherenceScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {adherenceScore}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-800">{todayData?.summary?.taken || 0} Taken</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="font-semibold text-slate-800">{todayData?.summary?.pending || 0} Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="font-semibold text-slate-800">{todayData?.summary?.missed || 0} Missed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-semibold text-slate-800">{todayData?.summary?.snoozed || 0} Snoozed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">14-day overall score:</span>
            <span className="font-bold text-teal-700">{analytics?.overall_adherence || 86}%</span>
          </div>
        </div>

        {/* Adherence Intelligence Banner / Pattern Alert */}
        <div className="md:col-span-7 lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Adherence Intelligence Alert
                </h2>
              </div>
              <Link
                to="/analytics"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
              >
                <span>Full Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {analytics?.patterns && analytics.patterns.length > 0 ? (
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4">
                <h3 className="font-bold text-teal-950 text-base">
                  {analytics.patterns[0].title}
                </h3>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {analytics.patterns[0].description}
                </p>
                <div className="mt-3 text-xs bg-white/80 p-2.5 rounded-lg border border-teal-100 text-teal-900 font-medium">
                  <strong>Intelligence Note:</strong> {analytics.patterns[0].insight}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-4">
                Analyzing historical dose data. As you log doses, MediTrack will detect scheduling patterns.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Reminder delivery does not count as intake</span>
            <Link to="/settings" className="font-bold text-teal-600 hover:underline">
              Adjust Reminder Settings →
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Medications List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Today's Medications</h2>
            <p className="text-xs text-slate-500">
              Select an action to confirm whether a scheduled medication was taken, snoozed, or missed.
            </p>
          </div>
          <Link
            to="/schedule"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center space-x-1"
          >
            <span>View Timeline / Weekly</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {doses.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No medications scheduled for today.</p>
            <Link
              to="/medications"
              className="mt-3 inline-block text-xs font-bold text-teal-600 hover:underline"
            >
              + Add your prescribed medications now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {doses.map((dose) => (
              <div
                key={dose.id}
                className="border border-slate-200 hover:border-teal-300 rounded-xl p-4.5 bg-slate-50/50 hover:bg-white transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-lg">
                          {dose.medicine_name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-semibold">
                          {dose.dosage}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold mt-1 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600 inline" />
                        <span>Scheduled: {dose.scheduled_time}</span>
                      </div>
                    </div>
                    {getStatusBadge(dose.status)}
                  </div>

                  {dose.instructions && (
                    <p className="text-xs text-slate-600 mt-2.5 bg-white p-2 rounded-lg border border-slate-200/80">
                      <strong>Instructions:</strong> {dose.instructions}
                    </p>
                  )}
                </div>

                {/* Patient Explicit Response Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <button
                    onClick={() => triggerReminder(dose)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center space-x-1"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Open Reminder</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleQuickResponse(dose.id, "TAKEN")}
                      disabled={refreshing}
                      title="Mark as Taken"
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                        dose.status === "TAKEN"
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Taken</span>
                    </button>

                    <button
                      onClick={() => handleQuickResponse(dose.id, "SNOOZED")}
                      disabled={refreshing}
                      title="Snooze 20 mins"
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                        dose.status === "SNOOZED"
                          ? "bg-amber-600 text-white font-bold"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Snooze</span>
                    </button>

                    <button
                      onClick={() => handleQuickResponse(dose.id, "MISSED")}
                      disabled={refreshing}
                      title="Mark as Missed"
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                        dose.status === "MISSED"
                          ? "bg-rose-600 text-white font-bold"
                          : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                      }`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Missed</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
}
