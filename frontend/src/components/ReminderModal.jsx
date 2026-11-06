import React, { useState } from "react";
import { useReminder } from "../context/ReminderContext";
import {
  Bell,
  Check,
  Clock,
  X,
  AlertCircle,
  Volume2,
  VolumeX,
  ShieldAlert,
  RotateCcw,
  Pill,
  Sparkles
} from "lucide-react";

export default function ReminderModal({ onStatusUpdated }) {
  const {
    activeDose,
    multipleDueDoses,
    isModalOpen,
    isAlarmPlaying,
    isAudioBlocked,
    closeReminder,
    confirmDoseTaken,
    snoozeDose,
    markDoseMissed,
    stopAlarm,
    playAlarm,
    enableAlerts,
  } = useReminder();

  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (!isModalOpen || !activeDose) return null;

  const handleTaken = async () => {
    setActionError(null);
    setSubmitting(true);
    const ok = await confirmDoseTaken(activeDose.id);
    setSubmitting(false);
    if (ok) {
      if (onStatusUpdated) onStatusUpdated();
    } else {
      setActionError("Unable to confirm dose. Please try again.");
    }
  };

  const handleSnooze = async () => {
    setActionError(null);
    setSubmitting(true);
    const ok = await snoozeDose(activeDose.id, selectedMinutes);
    setSubmitting(false);
    if (ok) {
      if (onStatusUpdated) onStatusUpdated();
    } else {
      setActionError("Unable to snooze dose. Please try again.");
    }
  };

  const handleMissed = async () => {
    setActionError(null);
    setSubmitting(true);
    const ok = await markDoseMissed(activeDose.id);
    setSubmitting(false);
    if (ok) {
      if (onStatusUpdated) onStatusUpdated();
    } else {
      setActionError("Unable to record as missed. Please try again.");
    }
  };

  const toggleAlarmSound = () => {
    if (isAlarmPlaying) {
      stopAlarm();
    } else {
      playAlarm({ force: true });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
      aria-describedby="reminder-desc"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-teal-500/40 overflow-hidden transform transition-all ring-8 ring-teal-500/10">
        {/* Top Header with Loud Alarm Banner & Pulsing Indicator */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2.5 bg-teal-500 text-white rounded-xl shadow-md">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              {isAlarmPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-200">
                  🔔 Scheduled Reminder
                </span>
                {isAlarmPlaying && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                    🔊 Loud Alarm Active
                  </span>
                )}
              </div>
              <h2 id="reminder-title" className="text-xl font-extrabold tracking-tight">
                Medication Reminder
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Alarm Sound Mute/Unmute quick toggle */}
            <button
              type="button"
              onClick={toggleAlarmSound}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors ${
                isAlarmPlaying
                  ? "bg-rose-500/30 text-rose-100 hover:bg-rose-500/40"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
              title={isAlarmPlaying ? "Mute alarm sound" : "Unmute alarm sound"}
            >
              {isAlarmPlaying ? (
                <Volume2 className="w-4 h-4 text-rose-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Close Button (Decide Later) */}
            <button
              onClick={closeReminder}
              aria-label="Close reminder dialog"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Close (Decide Later)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Blocked Warning Banner */}
        {isAudioBlocked && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Alarm sound was blocked by your browser.</span>
            </div>
            <button
              type="button"
              onClick={enableAlerts}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              Enable Alarm Sounds
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Multiple Medications Due Banner (Section 11) */}
          {multipleDueDoses && multipleDueDoses.length > 1 && (
            <div className="mb-4 p-3.5 bg-teal-50 border border-teal-200 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900 mb-1.5">
                <span className="flex items-center space-x-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Multiple Medications Due ({activeDose.scheduled_time})</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-200 text-teal-900 text-[10px]">
                  {multipleDueDoses.length} scheduled
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Please confirm intake for each scheduled dose individually:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {multipleDueDoses.map((d) => (
                  <span
                    key={d.id}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      d.id === activeDose.id
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700"
                    }`}
                  >
                    • {d.medicine_name} {d.dosage}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Primary Medication Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 mb-5 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
                  Prescription
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {activeDose.medicine_name}
                </h3>
                <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
                  {activeDose.dosage}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-semibold block">Scheduled Time</span>
                <span className="text-base font-extrabold text-teal-800 flex items-center justify-end space-x-1 mt-0.5">
                  <Clock className="w-4 h-4 mr-1 inline text-teal-600" />
                  {activeDose.scheduled_time}
                </span>
              </div>
            </div>

            {activeDose.instructions && (
              <div className="mt-3.5 pt-3 border-t border-slate-200 text-xs text-slate-700">
                <strong className="text-slate-900">Instructions:</strong> {activeDose.instructions}
              </div>
            )}
          </div>

          {/* Question & Explicit Confirmation Reminder */}
          <div className="text-center mb-5" id="reminder-desc">
            <p className="text-lg font-bold text-slate-900">
              Did you take your medication?
            </p>
            <div className="mt-1.5 inline-flex items-center space-x-1 text-xs text-slate-500 bg-amber-50/80 px-3 py-1 rounded-full border border-amber-200/80">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Reminders delivered do not mean taken. Please confirm explicitly.</span>
            </div>
          </div>

          {/* Error Message if API fails */}
          {actionError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Snooze Options Drawer */}
          {showSnoozeOptions && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 animate-in fade-in">
              <p className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2">
                Snooze alarm for:
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[10, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedMinutes(mins)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                      selectedMinutes === mins
                        ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-600 ring-offset-1"
                        : "bg-white text-amber-900 border border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    {mins} minutes
                  </button>
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSnooze}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Snoozing..." : `Confirm Snooze (${selectedMinutes}m)`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSnoozeOptions(false)}
                  className="px-3 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Buttons (Section 6, 7, 8) */}
          <div className="grid grid-cols-3 gap-3">
            {/* TAKEN BUTTON */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleTaken}
              className="flex flex-col items-center justify-center p-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl shadow-md shadow-emerald-600/20 transition-all font-bold disabled:opacity-50"
            >
              <Check className="w-6 h-6 mb-1 stroke-[3]" />
              <span className="text-sm">✓ Taken</span>
            </button>

            {/* SNOOZE BUTTON */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
              className="flex flex-col items-center justify-center p-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl shadow-md shadow-amber-500/20 transition-all font-bold disabled:opacity-50"
            >
              <RotateCcw className="w-6 h-6 mb-1 stroke-[2.5]" />
              <span className="text-sm">↻ Snooze</span>
            </button>

            {/* MISSED BUTTON */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleMissed}
              className="flex flex-col items-center justify-center p-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl shadow-md shadow-rose-600/20 transition-all font-bold disabled:opacity-50"
            >
              <X className="w-6 h-6 mb-1 stroke-[3]" />
              <span className="text-sm">✕ Missed</span>
            </button>
          </div>
        </div>

        {/* Footer Reminder Note */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Patient Consent & Safety First</span>
          </span>
          <button
            onClick={closeReminder}
            className="text-slate-600 hover:text-slate-900 font-bold underline"
          >
            Decide Later (Keeps Pending)
          </button>
        </div>
      </div>
    </div>
  );
}
