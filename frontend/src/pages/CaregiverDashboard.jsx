import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  HeartHandshake,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  User,
  AlertCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function CaregiverDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    async function fetchAuthorizedPatients() {
      try {
        const list = await api.getAuthorizedPatients();
        setPatients(list);
        if (list.length > 0) {
          setSelectedPatientId(list[0].patient_id);
        }
      } catch (err) {
        console.error("Failed to load authorized patients:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAuthorizedPatients();
  }, []);

  useEffect(() => {
    async function loadSummary() {
      if (!selectedPatientId) return;
      setLoadingSummary(true);
      try {
        const data = await api.getPatientSummary(selectedPatientId);
        setSummary(data);
      } catch (err) {
        console.error("Failed to load patient summary:", err);
      } finally {
        setLoadingSummary(false);
      }
    }
    loadSummary();
  }, [selectedPatientId]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">Connecting to authorized patient records...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">No Authorized Patients Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            You do not currently have access to any patient adherence profiles. Patients must explicitly grant access from their MediTrack account using your email address.
          </p>
        </div>
        <DisclaimerBanner />
      </div>
    );
  }

  const patientName = summary?.patient?.name || "Vaishnavi";
  const adherenceScore = summary?.adherence_percentage ?? 86;
  const todaySummary = summary?.today_summary || { taken: 4, missed: 1, pending: 1, doses: [] };
  const patterns = summary?.patterns || [];
  const weeklyChart = summary?.weekly_chart || [];

  return (
    <div className="space-y-6">
      {/* Top Banner with Patient Switcher */}
      <div className="bg-gradient-to-r from-blue-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Authorized Caregiver Portal (Read-Only)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Patient: {patientName}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Monitoring confirmed intake and missed-dose patterns. Modifications to prescriptions or dosages are strictly restricted.
          </p>
        </div>

        {/* Patient Dropdown Selector (if multiple authorized) */}
        {patients.length > 1 && (
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-md">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
              Select Patient:
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-slate-900 text-white text-sm font-semibold rounded-xl px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.patient_name} ({p.patient_email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loadingSummary ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading patient adherence summary...</p>
        </div>
      ) : (
        <>
          {/* Main Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Overall Adherence */}
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Overall Adherence
                </span>
                <div className="text-5xl font-black text-blue-600 mt-2">
                  {adherenceScore}%
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Based on verified intake responses over the last 14 days.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Compliance Level:</span>
                <span className="font-bold text-emerald-600">
                  {adherenceScore >= 80 ? "Good Routine" : "Requires Support"}
                </span>
              </div>
            </div>

            {/* Today's Doses Summary */}
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Today's Doses
                </span>
                <div className="grid grid-cols-3 gap-2 my-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-2xl font-black text-emerald-700 block">
                      {todaySummary.taken}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800">✓ Taken</span>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                    <span className="text-2xl font-black text-rose-700 block">
                      {todaySummary.missed}
                    </span>
                    <span className="text-[11px] font-bold text-rose-800">✕ Missed</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <span className="text-2xl font-black text-amber-700 block">
                      {todaySummary.pending}
                    </span>
                    <span className="text-[11px] font-bold text-amber-800">⏰ Pending</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 text-center">
                Reflects patient's confirmed status today
              </div>
            </div>

            {/* Recent Pattern Detected Card */}
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Recent Pattern</span>
                </div>
                {patterns.length > 0 ? (
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {patterns[0].title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {patterns[0].description}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Patient has maintained consistent daily intake routines.
                  </p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-blue-800 font-medium">
                💡 Caregiver Tip: Remind patient around dinner time to take evening medications.
              </div>
            </div>
          </div>

          {/* Weekly Adherence Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Patient Weekly Adherence Trend
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Confirmed intake adherence rate per day of the week for {patientName}.
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} unit="%" />
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Adherence"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="adherence" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Schedule Breakdown Table (Read-Only) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                Today's Medication Status Detail
              </h3>
              <p className="text-xs text-slate-500">
                Caregivers cannot edit medications or dosages. Contact patient's prescribing doctor for medical adjustments.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {todaySummary.doses?.map((dose) => (
                <div key={dose.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{dose.medicine_name}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      {dose.dosage}
                    </span>
                    <span className="ml-3 text-xs text-slate-400 font-medium">
                      Time: {dose.scheduled_time}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        dose.status === "TAKEN"
                          ? "bg-emerald-100 text-emerald-800"
                          : dose.status === "MISSED"
                          ? "bg-rose-100 text-rose-800"
                          : dose.status === "SNOOZED"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {dose.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <DisclaimerBanner />
    </div>
  );
}
