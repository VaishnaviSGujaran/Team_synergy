import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { api } from "../services/api";

const ReminderContext = createContext(null);

// Helper to determine if current time falls within quiet hours (e.g. 22:00 to 07:00)
export function isWithinQuietHours(startStr = "22:00", endStr = "07:00") {
  if (!startStr || !endStr) return false;
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [sH, sM] = startStr.split(":").map(Number);
    const [eH, eM] = endStr.split(":").map(Number);
    const startMinutes = sH * 60 + sM;
    const endMinutes = eH * 60 + eM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight (e.g. 22:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  } catch (err) {
    console.warn("Quiet hours parsing error:", err);
    return false;
  }
}

export function ReminderProvider({ children }) {
  const [activeDose, setActiveDose] = useState(null);
  const [multipleDueDoses, setMultipleDueDoses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Audio & Notification State
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem("meditrack_alerts_enabled") === "true";
  });
  const [notificationsPermission, setNotificationsPermission] = useState(() => {
    return typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported";
  });
  const [soundSettingEnabled, setSoundSettingEnabled] = useState(true);
  const [reminderSettings, setReminderSettings] = useState(null);

  // Singleton Audio References
  const audioRef = useRef(null);
  const webAudioCtxRef = useRef(null);
  const webAudioOscTimerRef = useRef(null);

  // Tracking triggered doses to prevent duplicate alarms
  const triggeredDosesRef = useRef(new Map()); // doseId -> lastTriggeredTimestamp
  const snoozeTimersRef = useRef(new Map()); // doseId -> timeoutId

  // Initialize or fetch reminder settings
  useEffect(() => {
    async function loadSettings() {
      const token = localStorage.getItem("meditrack_token");
      if (!token) return;
      try {
        const s = await api.getReminderSettings();
        setReminderSettings(s);
        if (typeof s.sound_enabled === "boolean") {
          setSoundSettingEnabled(s.sound_enabled);
        }
      } catch (err) {
        // Not logged in or settings not initialized yet
      }
    }
    loadSettings();
  }, []);

  // Web Audio Synthesizer Fallback Alarm (guarantees crystal-clear loud alarm everywhere)
  const startWebAudioFallback = () => {
    try {
      if (!webAudioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) webAudioCtxRef.current = new AudioCtx();
      }
      if (webAudioCtxRef.current && webAudioCtxRef.current.state === "suspended") {
        webAudioCtxRef.current.resume();
      }

      if (webAudioOscTimerRef.current) clearInterval(webAudioOscTimerRef.current);

      const playBeep = () => {
        if (!webAudioCtxRef.current) return;
        const ctx = webAudioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        // Medical alert dual-tone (880Hz A5 & 1046Hz C6)
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      };

      playBeep();
      webAudioOscTimerRef.current = setInterval(() => {
        playBeep();
        setTimeout(playBeep, 160);
      }, 1400);
    } catch (e) {
      console.warn("WebAudio alert error:", e);
    }
  };

  const stopWebAudioFallback = () => {
    if (webAudioOscTimerRef.current) {
      clearInterval(webAudioOscTimerRef.current);
      webAudioOscTimerRef.current = null;
    }
  };

  // Play loud continuous alarm (singleton)
  const playAlarm = (options = {}) => {
    const { force = false } = options;

    // Check Quiet Hours unless explicitly forced (e.g. Test Alarm)
    if (!force) {
      const qStart = reminderSettings?.quiet_hours_start || "22:00";
      const qEnd = reminderSettings?.quiet_hours_end || "07:00";
      if (isWithinQuietHours(qStart, qEnd)) {
        console.log("MediTrack: Scheduled time reached during quiet hours. Suppressing loud alarm.");
        return;
      }
      if (reminderSettings?.sound_enabled === false || !soundSettingEnabled) {
        console.log("MediTrack: Alarm sound is disabled in reminder settings.");
        return;
      }
    }

    // Prevent duplicate overlapping alarms
    if (isAlarmPlaying && audioRef.current && !audioRef.current.paused) {
      return;
    }

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/medication-alarm.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 1.0;
      }

      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAlarmPlaying(true);
            setIsAudioBlocked(false);
          })
          .catch((err) => {
            console.warn("Audio autoplay blocked by browser:", err);
            setIsAudioBlocked(true);
            // Try Web Audio fallback
            startWebAudioFallback();
            setIsAlarmPlaying(true);
          });
      }
    } catch (err) {
      console.warn("Alarm play exception:", err);
      startWebAudioFallback();
      setIsAlarmPlaying(true);
    }
  };

  // Stop alarm sound
  const stopAlarm = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      stopWebAudioFallback();
      setIsAlarmPlaying(false);
    } catch (err) {
      console.warn("Error stopping alarm:", err);
    }
  };

  // Browser Notification Trigger
  const sendBrowserNotification = (dose, allDue = []) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      let title = "MediTrack — 💊 Medication Reminder";
      let bodyText = "";

      if (allDue && allDue.length > 1) {
        const medList = allDue.map((d) => `• ${d.medicine_name} ${d.dosage}`).join("\n");
        bodyText = `Multiple medications due at ${dose.scheduled_time}:\n${medList}\n\nIt's time to take your medication. Please confirm your dose.`;
      } else {
        bodyText = `${dose.medicine_name} ${dose.dosage}\nScheduled time: ${dose.scheduled_time}\n\nIt's time to take your medication. Please confirm your dose.`;
      }

      const notif = new Notification(title, {
        body: bodyText,
        icon: "/favicon.svg",
        tag: `meditrack-dose-${dose.id || "alert"}`,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        triggerReminder(dose, allDue);
        notif.close();
      };
    } catch (err) {
      console.warn("Could not dispatch browser notification:", err);
    }
  };

  // Enable Medication Alerts (Requests notification permission & unlocks browser audio)
  const enableAlerts = async () => {
    let perm = "default";
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        perm = await Notification.requestPermission();
        setNotificationsPermission(perm);
      } catch (err) {
        console.warn("Notification request failed:", err);
      }
    }

    // Unlock HTML5 Audio & Web Audio context on user gesture
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/medication-alarm.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 1.0;
      }
      const p = audioRef.current.play();
      if (p !== undefined) {
        p.then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsAudioBlocked(false);
        }).catch(() => {});
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!webAudioCtxRef.current) webAudioCtxRef.current = new AudioCtx();
        if (webAudioCtxRef.current.state === "suspended") {
          webAudioCtxRef.current.resume();
        }
      }
    } catch (e) {
      console.warn("Audio unlock error:", e);
    }

    localStorage.setItem("meditrack_alerts_enabled", "true");
    setAlertsEnabled(true);
    setIsAudioBlocked(false);

    if (perm === "granted") {
      showToast("✓ Medication alerts and browser notifications enabled!", "success");
    } else if (perm === "denied") {
      showToast("Browser notifications are blocked. You can enable them from your browser settings.", "warning");
    } else {
      showToast("✓ Alarm audio alerts enabled!", "success");
    }
  };

  // Test Alarm (Plays alarm for 4 seconds, triggers test notification, then stops)
  const testAlarm = () => {
    enableAlerts();
    playAlarm({ force: true });
    sendBrowserNotification({
      id: "test-alert",
      medicine_name: "Test Medication",
      dosage: "100 mg",
      scheduled_time: "Now",
    });

    showToast("🔊 Testing medication alarm (will stop in 4 seconds)...", "info");

    setTimeout(() => {
      stopAlarm();
      showToast("Alarm test completed.", "success");
    }, 4000);
  };

  // Trigger Reminder Modal + Loud Alarm + Browser Notification
  const triggerReminder = (dose, allDue = []) => {
    setActiveDose(dose);
    setMultipleDueDoses(allDue && allDue.length > 1 ? allDue : []);
    setIsModalOpen(true);
    playAlarm();
    sendBrowserNotification(dose, allDue);
  };

  // Close Reminder / Decide Later
  // CRITICAL HEALTHCARE RULE: Closing without confirmation NEVER marks as TAKEN.
  const closeReminder = () => {
    stopAlarm();
    setIsModalOpen(false);
    setActiveDose(null);
    setMultipleDueDoses([]);
  };

  const showToast = (message, type = "info") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Confirm dose as TAKEN
  const confirmDoseTaken = async (doseId, notes = "") => {
    try {
      await api.respondDose(doseId, {
        status: "TAKEN",
        notes: notes || "Confirmed intake by patient",
      });
      stopAlarm();
      showToast("Medication intake confirmed. Adherence updated.", "success");

      // If multiple doses were due at this time, step to the next one
      if (multipleDueDoses.length > 1) {
        const remaining = multipleDueDoses.filter((d) => d.id !== doseId);
        setMultipleDueDoses(remaining);
        if (remaining.length > 0) {
          setActiveDose(remaining[0]);
          return true;
        }
      }

      closeReminder();
      return true;
    } catch (err) {
      showToast(err.message || "Unable to update dose status. Please try again.", "error");
      return false;
    }
  };

  // Snooze dose (10m, 20m, 30m)
  const snoozeDose = async (doseId, minutes = 15, notes = "") => {
    try {
      await api.respondDose(doseId, {
        status: "SNOOZED",
        snooze_minutes: minutes,
        notes: notes || `Snoozed for ${minutes} minutes`,
      });
      stopAlarm();
      showToast(`Reminder snoozed for ${minutes} minutes.`, "warning");

      // Clear existing snooze timer for this dose
      if (snoozeTimersRef.current.has(doseId)) {
        clearTimeout(snoozeTimersRef.current.get(doseId));
      }

      // Schedule client-side re-alert
      const timerId = setTimeout(async () => {
        try {
          const todayRes = await api.getTodayDoses();
          const targetDose = todayRes.doses?.find((d) => d.id === doseId) || activeDose;
          if (targetDose && targetDose.status !== "TAKEN" && targetDose.status !== "MISSED") {
            triggerReminder(targetDose);
          }
        } catch (e) {
          if (activeDose) triggerReminder(activeDose);
        }
      }, minutes * 60 * 1000);

      snoozeTimersRef.current.set(doseId, timerId);

      // Handle multi-dose queue
      if (multipleDueDoses.length > 1) {
        const remaining = multipleDueDoses.filter((d) => d.id !== doseId);
        setMultipleDueDoses(remaining);
        if (remaining.length > 0) {
          setActiveDose(remaining[0]);
          return true;
        }
      }

      closeReminder();
      return true;
    } catch (err) {
      showToast(err.message || "Failed to snooze dose. Please try again.", "error");
      return false;
    }
  };

  // Mark dose as MISSED
  const markDoseMissed = async (doseId, notes = "") => {
    try {
      await api.respondDose(doseId, {
        status: "MISSED",
        notes: notes || "Marked as missed by patient",
      });
      stopAlarm();
      showToast("Dose recorded as missed.", "error");

      if (multipleDueDoses.length > 1) {
        const remaining = multipleDueDoses.filter((d) => d.id !== doseId);
        setMultipleDueDoses(remaining);
        if (remaining.length > 0) {
          setActiveDose(remaining[0]);
          return true;
        }
      }

      closeReminder();
      return true;
    } catch (err) {
      showToast(err.message || "Failed to mark dose as missed. Please try again.", "error");
      return false;
    }
  };

  // Trigger Real Test Reminder (Generates or retrieves real patient database dose record)
  const triggerTestReminderFlow = async () => {
    try {
      enableAlerts();
      const realDose = await api.triggerTestReminder();
      triggerReminder(realDose);
      return realDose;
    } catch (err) {
      console.warn("Test reminder API fallback:", err);
      // Fallback to existing active dose if any
      const fallback = {
        id: "demo_simulated_dose",
        medicine_name: "Metformin",
        dosage: "500 mg",
        instructions: "Take after breakfast with water",
        scheduled_time: "08:00 AM",
        status: "PENDING",
      };
      triggerReminder(fallback);
      return fallback;
    }
  };

  // Background Tab & Scheduled Medication Checker (Runs every 15s)
  useEffect(() => {
    const checkScheduledDoses = async () => {
      const token = localStorage.getItem("meditrack_token");
      if (!token) return;

      try {
        const data = await api.getTodayDoses();
        const doses = data.doses || [];
        if (doses.length === 0) return;

        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, "0");
        const currentMins = String(now.getMinutes()).padStart(2, "0");
        const currentTimeStr = `${currentHours}:${currentMins}`;
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

        const dueDoses = [];

        for (const dose of doses) {
          // Check if dose has already been taken or marked missed
          if (dose.status === "TAKEN" || dose.status === "MISSED") continue;

          // Check snoozed doses whose snooze time has arrived
          if (dose.status === "SNOOZED" && dose.snooze_until) {
            const snoozeTime = new Date(dose.snooze_until);
            if (now >= snoozeTime) {
              const lastTriggered = triggeredDosesRef.current.get(dose.id);
              if (!lastTriggered || now.getTime() - lastTriggered > 60000) {
                dueDoses.push(dose);
                triggeredDosesRef.current.set(dose.id, now.getTime());
              }
            }
            continue;
          }

          // Check pending doses whose scheduled time has arrived today
          if (dose.status === "PENDING" && dose.scheduled_time) {
            const [dH, dM] = dose.scheduled_time.split(":").map(Number);
            const doseTotalMinutes = dH * 60 + dM;

            // Trigger if current time matches scheduled time, or past due within 60 minutes
            const diffMinutes = currentTotalMinutes - doseTotalMinutes;
            if (diffMinutes >= 0 && diffMinutes <= 60) {
              const lastTriggered = triggeredDosesRef.current.get(dose.id);
              // Trigger only once per dose session (or if not triggered in last 2 hours)
              if (!lastTriggered || now.getTime() - lastTriggered > 7200000) {
                dueDoses.push(dose);
                triggeredDosesRef.current.set(dose.id, now.getTime());
              }
            }
          }
        }

        // If medications are due, trigger alarm + notification + modal
        if (dueDoses.length > 0 && !isModalOpen) {
          console.log(`MediTrack: ${dueDoses.length} medication(s) due at ${currentTimeStr}.`);
          triggerReminder(dueDoses[0], dueDoses);
        }
      } catch (err) {
        // Suppress background poll errors
      }
    };

    // Run check on mount and interval
    checkScheduledDoses();
    const intervalId = setInterval(checkScheduledDoses, 15000);

    // Also check when tab regains focus / visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkScheduledDoses();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isModalOpen]);

  const value = {
    activeDose,
    multipleDueDoses,
    isModalOpen,
    toastMessage,
    isAlarmPlaying,
    isAudioBlocked,
    alertsEnabled,
    notificationsPermission,
    soundSettingEnabled,
    triggerReminder,
    triggerTestReminderFlow,
    closeReminder,
    confirmDoseTaken,
    snoozeDose,
    markDoseMissed,
    playAlarm,
    stopAlarm,
    testAlarm,
    enableAlerts,
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
