-- ==============================================================================
-- MediTrack - Medication Adherence Intelligence Platform
-- PostgreSQL / Supabase Database Schema
-- ==============================================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if re-initializing (in reverse order of foreign keys)
DROP TABLE IF EXISTS dose_records CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS caregiver_access CASCADE;
DROP TABLE IF EXISTS reminder_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- Roles: 'patient', 'caregiver', 'admin'
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'caregiver', 'admin')),
    phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 2. MEDICATIONS TABLE
-- Prescribed medications added by or for the patient
-- ------------------------------------------------------------------------------
CREATE TABLE medications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(80) NOT NULL,
    instructions TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_medications_status ON medications(status);

-- ------------------------------------------------------------------------------
-- 3. SCHEDULES TABLE
-- Configured daily or weekly medication times
-- ------------------------------------------------------------------------------
CREATE TABLE schedules (
    id VARCHAR(36) PRIMARY KEY,
    medication_id VARCHAR(36) NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_time VARCHAR(8) NOT NULL, -- Format: HH:MM or HH:MM:SS (e.g., '08:00')
    frequency VARCHAR(30) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'as_needed')),
    days_of_week TEXT DEFAULT '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', -- JSON list or comma-separated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_medication ON schedules(medication_id);

-- ------------------------------------------------------------------------------
-- 4. DOSE RECORDS TABLE
-- Confirmed dosage intake logs: PENDING, TAKEN, MISSED, SNOOZED
-- Crucial distinction: Reminder delivery != Taken!
-- ------------------------------------------------------------------------------
CREATE TABLE dose_records (
    id VARCHAR(36) PRIMARY KEY,
    schedule_id VARCHAR(36) NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time VARCHAR(8) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'TAKEN', 'MISSED', 'SNOOZED')),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    snooze_until TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dose_records_schedule ON dose_records(schedule_id);
CREATE INDEX idx_dose_records_date ON dose_records(scheduled_date);
CREATE INDEX idx_dose_records_status ON dose_records(status);

-- ------------------------------------------------------------------------------
-- 5. CAREGIVER ACCESS TABLE
-- Explicit patient authorization for caregiver read-only monitoring
-- ------------------------------------------------------------------------------
CREATE TABLE caregiver_access (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caregiver_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(50) DEFAULT 'view_adherence' CHECK (permission IN ('view_adherence', 'view_full_history')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (patient_id, caregiver_id)
);

CREATE INDEX idx_caregiver_access_patient ON caregiver_access(patient_id);
CREATE INDEX idx_caregiver_access_caregiver ON caregiver_access(caregiver_id);

-- ------------------------------------------------------------------------------
-- 6. REMINDER SETTINGS TABLE
-- Per-user alert fatigue prevention controls
-- ------------------------------------------------------------------------------
CREATE TABLE reminder_settings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_before_minutes INTEGER DEFAULT 10,
    reminder_after_minutes INTEGER DEFAULT 30,
    max_reminders INTEGER DEFAULT 2,
    quiet_hours_start VARCHAR(8) DEFAULT '22:00',
    quiet_hours_end VARCHAR(8) DEFAULT '07:00',
    sound_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminder_settings_user ON reminder_settings(user_id);
