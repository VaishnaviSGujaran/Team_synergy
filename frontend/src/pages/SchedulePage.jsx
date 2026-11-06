import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useReminder } from "../context/ReminderContext";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Bell
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import ReminderModal from "../components/ReminderModal";

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState("today"); // 'today' or 'weekly'
  const [todayData, setTodayData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { triggerReminder, confirmDoseTaken, snoozeDose, markDoseMissed } = useReminder();

  const loadSchedule = async () => {
    try {
      const [todayRes, weeklyRes] = await Promise.all([
        api.getTodayDoses(),
        api.getWeeklyDoses(),
      ]);
      setTodayData(todayRes);
      setWeeklyData(weeklyRes);
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleAction = async (doseId, status) => {
    if (status === "TAKEN") await confirmDoseTaken(doseId);
    else if (status === "SNOOZED") await snoozeDose(doseId, 20);
    else if (status === "MISSED") await markDoseMissed(doseId);
    await loadSchedule();
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

  return (
    <div className="space-y-6">
      <ReminderModal onStatusUpdated={loadSchedule} />

      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medication Schedule</h1>
          <p className="text-sm text-slate-500">
            Chronological medication timeline. Confirm intake when you take your medicine.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setViewMode("today")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === "today"
                ? "bg-white text-teal-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Today's Timeline
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === "weekly"
                ? "bg-white text-teal-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Weekly Calendar View
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">Loading schedule...</p>
        </div>
      ) : viewMode === "today" ? (
        /* Today Timeline View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Today: {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Total {todayData?.doses?.length || 0} scheduled doses
            </span>
          </div>

          {todayData?.doses?.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No doses scheduled for today.</p>
          ) : (
            <div className="relative border-l-2 border-teal-200 ml-4 sm:ml-6 space-y-8 py-2">
              {todayData.doses.map((dose) => (
                <div key={dose.id} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-white border-4 border-teal-600 shadow-sm"></div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:bg-white hover:border-teal-300 transition-all shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-bold text-teal-800">
                            {dose.scheduled_time}
                          </span>
                          <span className="text-slate-300">•</span>
                          <h3 className="text-lg font-bold text-slate-900">
                            {dose.medicine_name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                            {dose.dosage}
                          </span>
                        </div>
                        {dose.instructions && (
                          <p className="text-xs text-slate-600 mt-1">
                            <strong>Instructions:</strong> {dose.instructions}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        {getStatusBadge(dose.status)}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => triggerReminder(dose)}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Interactive Reminder</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAction(dose.id, "TAKEN")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          ✓ Taken
                        </button>
                        <button
                          onClick={() => handleAction(dose.id, "SNOOZED")}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          ↻ Snooze (20m)
                        </button>
                        <button
                          onClick={() => handleAction(dose.id, "MISSED")}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          ✕ Missed
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Weekly View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">Weekly Adherence Calendar</h2>
            <p className="text-xs text-slate-500">
              Week of {weeklyData?.start_of_week} to {weeklyData?.end_of_week}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weeklyData?.days?.map((day) => (
              <div
                key={day.date}
                className={`rounded-2xl border p-3.5 flex flex-col justify-between ${
                  day.is_today
                    ? "border-teal-500 bg-teal-50/50 shadow-sm ring-2 ring-teal-500/20"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-slate-800">{day.day_name.slice(0, 3)}</span>
                    <span className="text-xs text-slate-400 font-medium">{day.date.slice(5)}</span>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    {day.doses.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No doses</span>
                    ) : (
                      day.doses.map((d) => (
                        <div
                          key={d.id}
                          className="p-1.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs"
                        >
                          <div className="font-bold text-slate-800 truncate">
                            {d.medicine_name}
                          </div>
                          <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500">
                            <span>{d.scheduled_time}</span>
                            <span
                              className={`font-bold ${
                                d.status === "TAKEN"
                                  ? "text-emerald-600"
                                  : d.status === "MISSED"
                                  ? "text-rose-600"
                                  : d.status === "SNOOZED"
                                  ? "text-amber-600"
                                  : "text-slate-500"
                              }`}
                            >
                              {d.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {day.is_today && (
                  <div className="mt-3 pt-2 border-t border-teal-200 text-center">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                      Today
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}

