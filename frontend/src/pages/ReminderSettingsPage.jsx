import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  Settings,
  Bell,
  Clock,
  Moon,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function ReminderSettingsPage() {
  const [reminderBefore, setReminderBefore] = useState(10);
  const [reminderAfter, setReminderAfter] = useState(30);
  const [maxReminders, setMaxReminders] = useState(2);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await api.getReminderSettings();
        setReminderBefore(data.reminder_before_minutes ?? 10);
        setReminderAfter(data.reminder_after_minutes ?? 30);
        setMaxReminders(data.max_reminders ?? 2);
        setQuietHoursStart(data.quiet_hours_start ?? "22:00");
        setQuietHoursEnd(data.quiet_hours_end ?? "07:00");
        setSoundEnabled(data.sound_enabled ?? true);
      } catch (err) {
        console.error("Failed to load reminder settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSaving(true);

    try {
      await api.updateReminderSettings({
        reminder_before_minutes: parseInt(reminderBefore, 10),
        reminder_after_minutes: parseInt(reminderAfter, 10),
        max_reminders: parseInt(maxReminders, 10),
        quiet_hours_start: quietHoursStart,
        quiet_hours_end: quietHoursEnd,
        sound_enabled: soundEnabled,
      });
      setMessage("Reminder settings saved successfully! Your alert fatigue safeguards are active.");
    } catch (err) {
      setError(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading reminder configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reminder Settings</h1>
        <p className="text-sm text-slate-500">
          Configure notification timing and quiet hours to prevent alert fatigue and maintain healthy sleep routines.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Timing Controls */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <span>Notification Timing & Intervals</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Reminder Before */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label htmlFor="reminder-before" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Reminder Before Medication
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Deliver an alert prior to scheduled medication time.
              </p>
              <select
                id="reminder-before"
                value={reminderBefore}
                onChange={(e) => setReminderBefore(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="0">At exact scheduled time</option>
                <option value="5">5 minutes before</option>
                <option value="10">10 minutes before (Recommended)</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
              </select>
            </div>

            {/* Follow-up Reminder */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label htmlFor="reminder-after" className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Follow-up Reminder
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Interval if no confirmation response has been submitted.
              </p>
              <select
                id="reminder-after"
                value={reminderAfter}
                onChange={(e) => setReminderAfter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="15">15 minutes after</option>
                <option value="20">20 minutes after</option>
                <option value="30">30 minutes after (Recommended)</option>
                <option value="45">45 minutes after</option>
                <option value="60">60 minutes after</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fatigue Prevention */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Alert Fatigue Prevention</span>
          </h2>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label htmlFor="max-reminders" className="block text-xs font-bold text-amber-950 uppercase">
                  Maximum Number of Reminders Per Dose
                </label>
                <p className="text-xs text-amber-800 mt-1 max-w-md">
                  Limits repetitive alerts so patients do not develop alarm fatigue or frustration.
                </p>
              </div>

              <select
                id="max-reminders"
                value={maxReminders}
                onChange={(e) => setMaxReminders(e.target.value)}
                className="w-32 px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="1">1 reminder</option>
                <option value="2">2 reminders (Default)</option>
                <option value="3">3 reminders</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Moon className="w-4 h-4 text-indigo-600" />
            <span>Quiet Hours (Sleep Protection)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quiet-start" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quiet Hours Start
              </label>
              <input
                id="quiet-start"
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">e.g. 10:00 PM</span>
            </div>

            <div>
              <label htmlFor="quiet-end" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quiet Hours End
              </label>
              <input
                id="quiet-end"
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">e.g. 07:00 AM</span>
            </div>
          </div>
        </div>

        {/* Sound toggle */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Sound Notification Alerts</span>
              <span className="text-xs text-slate-500">Play pleasant chime when a dose reminder appears</span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {/* Save CTA */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Reminder Preferences"}
          </button>
        </div>
      </form>

      <DisclaimerBanner />
    </div>
  );
}
