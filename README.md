# MediTrack — Medication Adherence Intelligence Platform

> **A modern, accessible, full-stack healthcare web application for chronic care patients and authorized caregivers.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat&logo=postgresql&logoColor=white)](https://supabase.com)

---

## 1. Problem Statement

Chronic patients (such as those managing hypertension, diabetes, or cardiovascular conditions) face significant challenges:
- Forgetting daily doses across complex, multi-medication routines.
- Misinterpreting reminder alerts as intake proof.
- Alert fatigue caused by intrusive or repeated notifications.
- Caregivers lacking reliable, verified visibility into actual adherence.

### The Fundamental MediTrack Rule

> **A medication reminder delivered does NOT mean the medication was taken.**

MediTrack enforces a strict verified intake workflow:
$$\text{Scheduled Medication} \longrightarrow \text{Reminder} \longrightarrow \text{Patient Response} \longrightarrow \text{Taken / Missed / Snoozed} \longrightarrow \text{Dose Record} \longrightarrow \text{Adherence Intelligence}$$

---

## 2. Key Features

- **Role-Aware Authentication:** Isolated portals for Patients, Caregivers, and Administrators.
- **Prescription Management:** Add, edit, and organize doctor-prescribed medications with dosages and intake instructions.
- **Medication Scheduling:** Daily and weekly chronological timelines.
- **Interactive Reminders & Snooze Function:** 
  - Explicit confirmation: **[ ✓ Taken ]**, **[ ↻ Snooze ]** (10m, 20m, 30m), **[ ✕ Missed ]**.
  - Audio chimes and high-contrast accessible dialogs.
- **Alert Fatigue Safeguards:** Configurable quiet hours (e.g. 10:00 PM – 7:00 AM), max reminder caps, and adjustable intervals.
- **Dose History Audit:** Searchable log filtered by date, medication, and status.
- **Adherence Analytics:**
  - Standardized adherence calculation:
    $$\text{Adherence \%} = \frac{\text{Taken Doses}}{\text{Expected Doses}} \times 100$$
  - Weekly adherence chart (Monday through Sunday).
  - Status distribution breakdown (Taken vs Missed vs Snoozed vs Pending).
  - Time-of-day comparison (Morning vs Afternoon vs Evening).
- **Adherence Intelligence & Pattern Detection:**
  - Rule-based engine identifies behavioral routines (e.g., *“Evening medications missed more frequently than morning doses: Morning 94% vs Evening 71%”*).
  - Safe recommendations: Suggests reminder timing adjustments without modifying clinical treatments.
- **Caregiver Authorization Portal:**
  - Patients explicitly grant and revoke read-only monitoring access.
  - Caregivers cannot modify medications, dosages, or schedules.
- **System Administration:** Demonstration dashboard for user oversight and audit logs.

---

## 3. Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Recharts, Lucide Icons.
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, PyJWT, BCrypt.
- **Database:** PostgreSQL / Supabase schema (`database/schema.sql`) with instant zero-dependency SQLite local fallback for rapid development.
- **Analytics:** Python rule-based pattern intelligence engine.

---

## 4. Project Repository Structure

```text
Team_synergy/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, ReminderModal, DisclaimerBanner
│   │   ├── context/          # AuthContext, ReminderContext
│   │   ├── pages/            # Landing, Dashboard, Medications, Schedule, Analytics, etc.
│   │   ├── services/         # api.js client
│   │   ├── App.jsx           # Routes & RBAC wrappers
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── routes/           # auth, medications, doses, analytics, caregivers, settings, admin
│   │   ├── services/         # adherence_intelligence.py
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── database.py       # Database connection
│   │   ├── seed_data.py      # Safe demo seed records
│   │   └── main.py           # FastAPI entrypoint
│   ├── requirements.txt
│   └── run.py
│
├── database/
│   ├── schema.sql            # PostgreSQL / Supabase DDL
│   └── seed.sql              # Realistic safe test data
│
├── docs/
│   └── architecture.md       # Technical design document
│
├── .gitignore
└── README.md
```

---

## 5. Quickstart & Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### Step 1: Clone Repository
```bash
git clone https://github.com/VaishnaviSGujaran/Team_synergy.git
cd Team_synergy
```

### Step 2: Backend Setup
```bash
# Navigate to backend
cd backend

# (Optional) Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server (starts on http://localhost:8000)
python run.py
```
*Note: On first startup, the backend will automatically initialize the database and seed realistic demo records!*

### Step 3: Frontend Setup
Open a second terminal:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server (starts on http://localhost:5173)
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 6. Pre-Configured Demo Accounts

For rapid hackathon evaluation, click any **1-Click Demo** button on the landing page or login with:

| Role | Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@meditrack.com` | `Password123!` | Full medication management, schedule, reminders, caregiver access |
| **Caregiver** | `caregiver@meditrack.com` | `Password123!` | Read-only adherence summaries for authorized patient Vaishnavi |
| **Admin** | `admin@meditrack.com` | `Password123!` | Demonstration system statistics, registered users, activity logs |

---

## 7. Environment Variables

Store private production credentials in a `.env` file (never commit `.env` files to git):

```env
# Database (PostgreSQL / Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
```

---

## 8. Medical Safety Disclaimer

> **MediTrack is a medication management and adherence support platform. It does not provide medical diagnosis, prescribe medications, change treatment plans, or replace professional medical advice. Medication information should be based on prescriptions provided by qualified healthcare professionals.**
