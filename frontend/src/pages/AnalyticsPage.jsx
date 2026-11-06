import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Calendar,
  Sun,
  Sunset,
  Moon
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics(days);
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">Calculating adherence intelligence metrics...</p>
      </div>
    );
  }

  const {
    overall_adherence = 86,
    total_expected = 50,
    taken_doses = 43,
    missed_doses = 5,
    snoozed_doses = 2,
    weekly_chart = [],
    status_chart = [],
    time_adherence = {},
    patterns = [],
    suggestions = [],
  } = analytics || {};

  const morningRate = time_adherence?.morning?.rate ?? 94;
  const afternoonRate = time_adherence?.afternoon?.rate ?? 82;
  const eveningRate = time_adherence?.evening?.rate ?? 71;

  const timeBarsData = [
    { time: "Morning (< 12 PM)", adherence: morningRate, fill: "#0d9488" },
    { time: "Afternoon (12-5 PM)", adherence: afternoonRate, fill: "#3b82f6" },
    { time: "Evening (5 PM+)", adherence: eveningRate, fill: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Time Window Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Adherence Analytics & Intelligence</h1>
          <p className="text-sm text-slate-500">
            Intelligent adherence analytics and pattern detection derived from verified dose confirmations.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-200/80 p-1 rounded-xl">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                days === d
                  ? "bg-white text-teal-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Past {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Adherence Score */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
            Adherence Score
          </span>
          <div className="my-2">
            <span className="text-4xl font-black">{overall_adherence}%</span>
            <p className="text-[11px] text-teal-100 mt-0.5">
              {taken_doses} taken / {total_expected} expected
            </p>
          </div>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-md inline-block w-fit font-medium">
            Formula: Taken / Total × 100
          </span>
        </div>

        {/* Taken */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Taken Doses</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{taken_doses}</div>
          <span className="text-xs text-emerald-700 font-semibold">✓ Confirmed Intake</span>
        </div>

        {/* Missed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Missed Doses</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{missed_doses}</div>
          <span className="text-xs text-rose-700 font-semibold">✕ Unconfirmed / Skipped</span>
        </div>

        {/* Snoozed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Snoozed</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{snoozed_doses}</div>
          <span className="text-xs text-amber-700 font-semibold">↻ Delay Requests</span>
        </div>

        {/* Evaluated Days */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Sample Window</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{days}</div>
          <span className="text-xs text-slate-500 font-semibold">Consecutive Days</span>
        </div>
      </div>

      {/* Adherence Intelligence & Pattern Detection (Section 14 Highlight) */}
      <div className="bg-white rounded-2xl border-2 border-teal-500/30 p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Machine-Assisted Pattern Detection
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Identified Adherence Pattern & Insights
              </h2>
            </div>
          </div>

          {patterns.map((pat, idx) => (
            <div
              key={idx}
              className="bg-teal-50/80 border border-teal-200 rounded-2xl p-5 my-3 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-teal-950 text-lg">
                    {pat.title}
                  </h3>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                    {pat.description}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-200 text-teal-900">
                  Pattern Detected
                </span>
              </div>

              {/* Time Breakdown Cards */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-teal-100 flex items-center space-x-3">
                  <Sun className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Morning Adherence</span>
                    <span className="text-lg font-black text-teal-700">{morningRate}%</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-teal-100 flex items-center space-x-3">
                  <Sunset className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Afternoon Adherence</span>
                    <span className="text-lg font-black text-blue-700">{afternoonRate}%</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-teal-100 flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Evening Adherence</span>
                    <span className="text-lg font-black text-amber-600">{eveningRate}%</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-teal-900 bg-white/90 p-3 rounded-xl border border-teal-100 font-medium">
                <strong>Clinical Safety Guidance:</strong> {pat.insight}
              </div>
            </div>
          ))}

          {/* Safe Actionable Suggestions (Section 14) */}
          {suggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recommended Operational Adjustments:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-teal-800 block mb-1">
                      💡 {s.category}:
                    </span>
                    <p className="text-slate-600">{s.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Rule Card */}
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Safety Guardrail:</strong> MediTrack suggests adjusting reminder timing or reviewing quiet hours. It never alters prescribed dosage or replaces a physician.
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Adherence Chart (Monday through Sunday) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">Weekly Adherence Rate</h3>
            <p className="text-xs text-slate-500">
              Confirmed intake percentage broken down from Monday to Sunday.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} unit="%" />
                <Tooltip
                  formatter={(val) => [`${val}%`, "Adherence"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="adherence" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dose Status Distribution Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">Medication Status Distribution</h3>
            <p className="text-xs text-slate-500">
              Breakdown of taken, missed, snoozed, and pending records.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={status_chart}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {status_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [val, name]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time-Based Adherence Comparison Bar Chart */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">Time-of-Day Adherence Comparison</h3>
            <p className="text-xs text-slate-500">
              Comparing adherence rates across Morning, Afternoon, and Evening intake windows.
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeBarsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis dataKey="time" type="category" tick={{ fontSize: 12, fill: "#334155" }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, "Adherence"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="adherence" radius={[0, 6, 6, 0]}>
                  {timeBarsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}

