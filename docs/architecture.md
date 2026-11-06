# MediTrack — Architecture & Technical Design Document

## 1. System Overview

**MediTrack** is an intelligent medication adherence platform designed specifically for chronic care patients (e.g., managing hypertension, diabetes, hyperlipidemia) and authorized caregivers.

The platform solves the critical flaw in standard medication reminder systems: **a reminder delivered is NOT proof of intake**. MediTrack implements a verified feedback loop where doses are strictly recorded as confirmed only upon explicit patient response.

---

## 2. Verified Intake Lifecycle

```text
Prescribed Medication Added
            ↓
  Schedule Created (Time, Frequency, Days)
            ↓
  Configured Reminder Triggered (Quiet Hours Respected)
            ↓
  Patient Response Dialog
    ├── [ ✓ Taken ]    → Status: TAKEN, confirmed_at: NOW
    ├── [ ↻ Snooze ]   → Status: SNOOZED, snooze_until: NOW + 10m/20m/30m
    └── [ ✕ Missed ]   → Status: MISSED, notes logged
            ↓
  Immutable Dose Record Stored in PostgreSQL / Supabase
            ↓
  Rule-Based Adherence Intelligence Engine
    ├── Calculates % Adherence: (Taken / Expected) × 100
    ├── Evaluates Weekly & Time-of-Day Trends (Morning vs Afternoon vs Evening)
    └── Detects Behavioral Patterns (e.g., Evening Misses, Weekend Dips)
            ↓
  Read-Only Caregiver Summary (Authorized Patients Only)
```

---

## 3. Core Database Models

### `users`
- `id` (VARCHAR / UUID, Primary Key)
- `name` (VARCHAR, Patient or Caregiver Full Name)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR, Bcrypt Hash)
- `role` (VARCHAR: `patient`, `caregiver`, `admin`)
- `phone` (VARCHAR)
- `created_at`, `updated_at`

### `medications`
- `id` (VARCHAR / UUID, Primary Key)
- `user_id` (Foreign Key -> `users.id`)
- `medicine_name` (VARCHAR, e.g., Metformin)
- `dosage` (VARCHAR, e.g., 500 mg)
- `instructions` (TEXT, e.g., Take after breakfast)
- `start_date` (DATE)
- `end_date` (DATE, nullable)
- `status` (`active`, `completed`, `discontinued`)

### `schedules`
- `id` (VARCHAR / UUID, Primary Key)
- `medication_id` (Foreign Key -> `medications.id`)
- `scheduled_time` (VARCHAR, `08:00`)
- `frequency` (`daily`, `weekly`, `as_needed`)
- `days_of_week` (JSON / TEXT)

### `dose_records`
- `id` (VARCHAR / UUID, Primary Key)
- `schedule_id` (Foreign Key -> `schedules.id`)
- `scheduled_date` (DATE)
- `scheduled_time` (VARCHAR)
- `status` (`PENDING`, `TAKEN`, `MISSED`, `SNOOZED`)
- `confirmed_at` (TIMESTAMP WITH TIME ZONE)
- `snooze_until` (TIMESTAMP WITH TIME ZONE)
- `notes` (TEXT)

### `caregiver_access`
- `id` (VARCHAR / UUID, Primary Key)
- `patient_id` (Foreign Key -> `users.id`)
- `caregiver_id` (Foreign Key -> `users.id`)
- `permission` (`view_adherence`, `view_full_history`)
- `status` (`active`, `pending`, `revoked`)

### `reminder_settings`
- `id` (VARCHAR / UUID, Primary Key)
- `user_id` (Foreign Key -> `users.id`)
- `reminder_before_minutes` (INTEGER, default 10)
- `reminder_after_minutes` (INTEGER, default 30)
- `max_reminders` (INTEGER, default 2)
- `quiet_hours_start` (VARCHAR, `22:00`)
- `quiet_hours_end` (VARCHAR, `07:00`)
- `sound_enabled` (BOOLEAN)

---

## 4. Role-Based Access Control (RBAC)

1. **Patient Role:**
   - Full control over their own medications, schedules, and caregiver authorizations.
   - Responds to dose reminders (Taken / Missed / Snooze).
   - Configure fatigue-prevention reminder settings.

2. **Caregiver Role:**
   - Strictly read-only visibility into authorized patients' adherence summaries.
   - **Guaranteed Constraint:** Caregivers CANNOT add, modify, or delete medications, dosages, or schedules.

3. **Admin Role:**
   - Demonstration panel to view total platform users, aggregated adherence metrics, and activity logs.

---

## 5. Adherence Intelligence Engine

Calculates adherence score:
$$\text{Adherence \%} = \frac{\text{Taken Doses}}{\text{Expected Doses}} \times 100$$

### Pattern Detection Rules:
- **Evening Miss Bias:** Compares morning (< 12:00 PM), afternoon (12:00 PM - 5:00 PM), and evening (≥ 5:00 PM) adherence. Flags when evening adherence is $\ge 15\%$ lower than morning adherence.
- **Weekend Variance:** Compares weekday (Mon–Fri) vs weekend (Sat–Sun) confirmed rates.
- **Alert Fatigue Indicator:** Monitors repeated snoozes leading to unconfirmed doses.

### Safety Protocols:
MediTrack suggestions are strictly limited to behavioral timing adjustments (e.g. "Consider moving reminder 30 minutes earlier to align with dinner"). The system **never** modifies dosages, never prescribes, and never provides clinical medical diagnosis.

