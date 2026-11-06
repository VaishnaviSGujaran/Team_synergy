import React, { createContext, useContext, useState } from "react";
import { api } from "../services/api";

const ReminderContext = createContext(null);

export function ReminderProvider({ children }) {
  const [activeDose, setActiveDose] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerReminder = (dose) => {
    setActiveDose(dose);
    setIsModalOpen(true);
  };

  const closeReminder = () => {
    setIsModalOpen(false);
    setActiveDose(null);
  };

  const showToast = (message, type = "info") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const confirmDoseTaken = async (doseId, notes = "") => {
    try {
      await api.respondDose(doseId, {
        status: "TAKEN",
        notes: notes || "Confirmed intake by patient",
      });
      showToast("Dose successfully confirmed as TAKEN! Adherence updated.", "success");
      closeReminder();
      return true;
    } catch (err) {
      showToast(err.message || "Failed to update dose status", "error");
      return false;
    }
  };

  const snoozeDose = async (doseId, minutes = 15, notes = "") => {
    try {
      await api.respondDose(doseId, {
        status: "SNOOZED",
        snooze_minutes: minutes,
        notes: notes || `Snoozed for ${minutes} minutes`,
      });
      showToast(`Reminder snoozed for ${minutes} minutes.`, "warning");
      closeReminder();
      return true;
    } catch (err) {
      showToast(err.message || "Failed to snooze dose", "error");
      return false;
    }
  };

  const markDoseMissed = async (doseId, notes = "") => {
    try {
      await api.respondDose(doseId, {
        status: "MISSED",
        notes: notes || "Marked as missed by patient",
      });
      showToast("Dose recorded as MISSED. Noted in adherence history.", "error");
      closeReminder();
      return true;
    } catch (err) {
      showToast(err.message || "Failed to mark dose as missed", "error");
      return false;
    }
  };

  const value = {
    activeDose,
    isModalOpen,
    toastMessage,
    triggerReminder,
    closeReminder,
    confirmDoseTaken,
    snoozeDose,
    markDoseMissed,
    showToast,
  };

  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
}

export function useReminder() {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminder must be used within a ReminderProvider");
  }
  return context;
}
