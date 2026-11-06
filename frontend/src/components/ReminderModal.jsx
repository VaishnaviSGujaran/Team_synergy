import React, { useState } from "react";
import { useReminder } from "../context/ReminderContext";
import { Bell, Check, Clock, X, AlertCircle } from "lucide-react";

export default function ReminderModal({ onStatusUpdated }) {
  const { activeDose, isModalOpen, closeReminder, confirmDoseTaken, snoozeDose, markDoseMissed } = useReminder();
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [submitting, setSubmitting] = useState(false);

  if (!isModalOpen || !activeDose) return null;

  const handleTaken = async () => {
    setSubmitting(true);
    const ok = await confirmDoseTaken(activeDose.id);
    setSubmitting(false);
    if (ok && onStatusUpdated) onStatusUpdated();
  };

  const handleSnooze = async () => {
    setSubmitting(true);
    const ok = await snoozeDose(activeDose.id, selectedMinutes);
    setSubmitting(false);
    if (ok && onStatusUpdated) onStatusUpdated();
  };

  const handleMissed = async () => {
    setSubmitting(true);
    const ok = await markDoseMissed(activeDose.id);
    setSubmitting(false);
    if (ok && onStatusUpdated) onStatusUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-teal-100 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
      >
        {/* Header with teal gradient and alert banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-100">
                Scheduled Reminder
              </span>
              <h2 id="reminder-title" className="text-xl font-bold">
                Medication Reminder
              </h2>
            </div>
          </div>
          <button
            onClick={closeReminder}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Medication Details Card */}
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {activeDose.medicine_name}
                </h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                  {activeDose.dosage}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium block">Scheduled Time</span>
                <span className="text-base font-bold text-teal-700 flex items-center justify-end space-x-1">
                  <Clock className="w-4 h-4 mr-1 inline" />
                  {activeDose.scheduled_time}
                </span>
              </div>
            </div>

            {activeDose.instructions && (
              <p className="mt-3 text-sm text-slate-600 border-t border-slate-200 pt-2.5">
                <span className="font-semibold text-slate-700">Instructions:</span> {activeDose.instructions}
              </p>
            )}
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-slate-800">
              Did you take your medication?
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 inline mr-1 flex-shrink-0" />
              <span>Reminders delivered do not mean taken. Please confirm explicitly.</span>
            </p>
          </div>

          {/* Snooze Options Drawer */}
          {showSnoozeOptions ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 animate-in fade-in">
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2">
                Snooze duration:
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[10, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedMinutes(mins)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      selectedMinutes === mins
                        ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600 ring-offset-1"
                        : "bg-white text-amber-900 border border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSnooze}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Snoozing..." : `Confirm Snooze (${selectedMinutes}m)`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSnoozeOptions(false)}
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={handleTaken}
              className="flex flex-col items-center justify-center p-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl shadow-md transition-all font-semibold disabled:opacity-50"
            >
              <Check className="w-5 h-5 mb-1 stroke-[2.5]" />
              <span className="text-sm">✓ Taken</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
              className="flex flex-col items-center justify-center p-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl shadow-md transition-all font-semibold disabled:opacity-50"
            >
              <Clock className="w-5 h-5 mb-1 stroke-[2.5]" />
              <span className="text-sm">↻ Snooze</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleMissed}
              className="flex flex-col items-center justify-center p-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl shadow-md transition-all font-semibold disabled:opacity-50"
            >
              <X className="w-5 h-5 mb-1 stroke-[2.5]" />
              <span className="text-sm">✕ Missed</span>
            </button>
          </div>
        </div>

        {/* Footer Reminder Note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Patient Consent & Safety First</span>
          <button 
            onClick={closeReminder}
            className="text-slate-600 hover:text-slate-800 font-medium underline"
          >
            Decide Later
          </button>
        </div>
      </div>
    </div>
  );
}
