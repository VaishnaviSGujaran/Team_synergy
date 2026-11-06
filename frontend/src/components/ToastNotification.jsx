import React from "react";
import { useReminder } from "../context/ReminderContext";
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";

export default function ToastNotification() {
  const { toastMessage } = useReminder();
  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600" />,
    info: <Info className="w-5 h-5 text-teal-600" />,
  };

  const borderColors = {
    success: "border-emerald-300 bg-emerald-50 text-emerald-950",
    warning: "border-amber-300 bg-amber-50 text-amber-950",
    error: "border-rose-300 bg-rose-50 text-rose-950",
    info: "border-teal-300 bg-teal-50 text-teal-950",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce-short">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-lg ${borderColors[type] || borderColors.info}`}>
        <div className="flex-shrink-0">{icons[type] || icons.info}</div>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

