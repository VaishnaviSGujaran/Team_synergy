-- ==============================================================================
-- MediTrack - Realistic Demo Seed Data
-- Safe test records for local development and demonstration
-- ==============================================================================

-- 1. USERS
-- Password for all demo accounts is: Password123!
-- (Pre-computed bcrypt hash: $2b$12$e6yD26mE4n4/5uE4.oY4Q.H3U2qPZlhx2G2F9V1U4Z6rYpE9wO0ea)
INSERT INTO users (id, name, email, password_hash, role, phone, created_at)
VALUES
('usr_pat_vaishnavi', 'Vaishnavi Gujaran', 'patient@meditrack.com', '$2b$12$e6yD26mE4n4/5uE4.oY4Q.H3U2qPZlhx2G2F9V1U4Z6rYpE9wO0ea', 'patient', '+91 98765 43210', NOW() - INTERVAL '30 days'),
('usr_cg_rajesh', 'Rajesh Sharma', 'caregiver@meditrack.com', '$2b$12$e6yD26mE4n4/5uE4.oY4Q.H3U2qPZlhx2G2F9V1U4Z6rYpE9wO0ea', 'caregiver', '+91 98765 12345', NOW() - INTERVAL '30 days'),
('usr_adm_demo', 'Dr. Sarah Mitchell', 'admin@meditrack.com', '$2b$12$e6yD26mE4n4/5uE4.oY4Q.H3U2qPZlhx2G2F9V1U4Z6rYpE9wO0ea', 'admin', '+1 555 019 2831', NOW() - INTERVAL '60 days')
ON CONFLICT (id) DO NOTHING;

-- 2. MEDICATIONS FOR PATIENT (Vaishnavi)
INSERT INTO medications (id, user_id, medicine_name, dosage, instructions, start_date, end_date, status, created_at)
VALUES
('med_metformin', 'usr_pat_vaishnavi', 'Metformin', '500 mg', 'Take after breakfast with water', CURRENT_DATE - INTERVAL '30 days', NULL, 'active', NOW() - INTERVAL '30 days'),
('med_aspirin', 'usr_pat_vaishnavi', 'Aspirin', '75 mg', 'Take after lunch', CURRENT_DATE - INTERVAL '30 days', NULL, 'active', NOW() - INTERVAL '30 days'),
('med_atorvastatin', 'usr_pat_vaishnavi', 'Atorvastatin', '20 mg', 'Take at bedtime', CURRENT_DATE - INTERVAL '30 days', NULL, 'active', NOW() - INTERVAL '30 days'),
('med_lisinopril', 'usr_pat_vaishnavi', 'Lisinopril', '10 mg', 'Take in the morning for blood pressure', CURRENT_DATE - INTERVAL '20 days', NULL, 'active', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- 3. SCHEDULES
INSERT INTO schedules (id, medication_id, scheduled_time, frequency, days_of_week, created_at)
VALUES
('sch_metformin_am', 'med_metformin', '08:00', 'daily', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', NOW() - INTERVAL '30 days'),
('sch_aspirin_noon', 'med_aspirin', '13:00', 'daily', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', NOW() - INTERVAL '30 days'),
('sch_atorvastatin_pm', 'med_atorvastatin', '20:00', 'daily', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', NOW() - INTERVAL '30 days'),
('sch_lisinopril_am', 'med_lisinopril', '08:30', 'daily', '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- 4. REMINDER SETTINGS
INSERT INTO reminder_settings (id, user_id, reminder_before_minutes, reminder_after_minutes, max_reminders, quiet_hours_start, quiet_hours_end, sound_enabled)
VALUES
('set_pat_vaishnavi', 'usr_pat_vaishnavi', 10, 30, 2, '22:00', '07:00', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. CAREGIVER ACCESS
INSERT INTO caregiver_access (id, patient_id, caregiver_id, permission, status, created_at)
VALUES
('acc_vaishnavi_rajesh', 'usr_pat_vaishnavi', 'usr_cg_rajesh', 'view_adherence', 'active', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- 6. RECENT DOSE RECORDS (Last 14 days showing adherence patterns)
-- Pattern: Morning adherence ~94%, Afternoon ~82%, Evening ~71%
-- Today: Metformin (Taken), Lisinopril (Taken), Aspirin (Pending/Snoozed), Atorvastatin (Pending)
INSERT INTO dose_records (id, schedule_id, scheduled_date, scheduled_time, status, confirmed_at, notes)
VALUES
-- Today
('dose_today_1', 'sch_metformin_am', CURRENT_DATE, '08:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'Taken with breakfast'),
('dose_today_2', 'sch_lisinopril_am', CURRENT_DATE, '08:30', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '5 hours 45 minutes', 'Confirmed on time'),
('dose_today_3', 'sch_aspirin_noon', CURRENT_DATE, '13:00', 'PENDING', NULL, 'Waiting for lunch'),
('dose_today_4', 'sch_atorvastatin_pm', CURRENT_DATE, '20:00', 'PENDING', NULL, 'Scheduled tonight'),

-- Yesterday (Day -1)
('dose_d1_1', 'sch_metformin_am', CURRENT_DATE - INTERVAL '1 day', '08:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '1 day 5 hours', NULL),
('dose_d1_2', 'sch_lisinopril_am', CURRENT_DATE - INTERVAL '1 day', '08:30', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '1 day 4 hours', NULL),
('dose_d1_3', 'sch_aspirin_noon', CURRENT_DATE - INTERVAL '1 day', '13:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '1 day 1 hour', NULL),
('dose_d1_4', 'sch_atorvastatin_pm', CURRENT_DATE - INTERVAL '1 day', '20:00', 'MISSED', NULL, 'Fell asleep early'),

-- Day -2
('dose_d2_1', 'sch_metformin_am', CURRENT_DATE - INTERVAL '2 days', '08:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL),
('dose_d2_2', 'sch_lisinopril_am', CURRENT_DATE - INTERVAL '2 days', '08:30', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL),
('dose_d2_3', 'sch_aspirin_noon', CURRENT_DATE - INTERVAL '2 days', '13:00', 'SNOOZED', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Snoozed 20m then missed meeting'),
('dose_d2_4', 'sch_atorvastatin_pm', CURRENT_DATE - INTERVAL '2 days', '20:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL),

-- Day -3
('dose_d3_1', 'sch_metformin_am', CURRENT_DATE - INTERVAL '3 days', '08:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '3 days', NULL),
('dose_d3_2', 'sch_lisinopril_am', CURRENT_DATE - INTERVAL '3 days', '08:30', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '3 days', NULL),
('dose_d3_3', 'sch_aspirin_noon', CURRENT_DATE - INTERVAL '3 days', '13:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '3 days', NULL),
('dose_d3_4', 'sch_atorvastatin_pm', CURRENT_DATE - INTERVAL '3 days', '20:00', 'MISSED', NULL, 'Away from home'),

-- Day -4
('dose_d4_1', 'sch_metformin_am', CURRENT_DATE - INTERVAL '4 days', '08:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '4 days', NULL),
('dose_d4_2', 'sch_lisinopril_am', CURRENT_DATE - INTERVAL '4 days', '08:30', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '4 days', NULL),
('dose_d4_3', 'sch_aspirin_noon', CURRENT_DATE - INTERVAL '4 days', '13:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '4 days', NULL),
('dose_d4_4', 'sch_atorvastatin_pm', CURRENT_DATE - INTERVAL '4 days', '20:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '4 days', NULL),

-- Day -5
('dose_d5_1', 'sch_metformin_am', CURRENT_DATE - INTERVAL '5 days', '08:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '5 days', NULL),
('dose_d5_2', 'sch_lisinopril_am', CURRENT_DATE - INTERVAL '5 days', '08:30', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '5 days', NULL),
('dose_d5_3', 'sch_aspirin_noon', CURRENT_DATE - INTERVAL '5 days', '13:00', 'MISSED', NULL, 'Forgot during travel'),
('dose_d5_4', 'sch_atorvastatin_pm', CURRENT_DATE - INTERVAL '5 days', '20:00', 'MISSED', NULL, 'Dinner outside'),

-- Day -6
('dose_d6_1', 'sch_metformin_am', CURRENT_DATE - INTERVAL '6 days', '08:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '6 days', NULL),
('dose_d6_2', 'sch_lisinopril_am', CURRENT_DATE - INTERVAL '6 days', '08:30', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '6 days', NULL),
('dose_d6_3', 'sch_aspirin_noon', CURRENT_DATE - INTERVAL '6 days', '13:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '6 days', NULL),
('dose_d6_4', 'sch_atorvastatin_pm', CURRENT_DATE - INTERVAL '6 days', '20:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '6 days', NULL),

-- Day -7
('dose_d7_1', 'sch_metformin_am', CURRENT_DATE - INTERVAL '7 days', '08:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '7 days', NULL),
('dose_d7_2', 'sch_lisinopril_am', CURRENT_DATE - INTERVAL '7 days', '08:30', 'MISSED', NULL, 'Rushed morning'),
('dose_d7_3', 'sch_aspirin_noon', CURRENT_DATE - INTERVAL '7 days', '13:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '7 days', NULL),
('dose_d7_4', 'sch_atorvastatin_pm', CURRENT_DATE - INTERVAL '7 days', '20:00', 'TAKEN', CURRENT_TIMESTAMP - INTERVAL '7 days', NULL)
ON CONFLICT (id) DO NOTHING;
