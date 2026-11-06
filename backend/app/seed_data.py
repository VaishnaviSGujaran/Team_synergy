from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session
from .models import User, Medication, Schedule, DoseRecord, CaregiverAccess, ReminderSetting
from .auth import hash_password

def seed_initial_data(db: Session):
    """Seeds realistic demo data if database is empty."""
    if db.query(User).count() > 0:
        return

    print("Seeding initial MediTrack demo data...")

    # Default password for all demo accounts: Password123!
    default_pw_hash = hash_password("Password123!")

    # 1. Users
    patient_user = User(
        id="usr_pat_vaishnavi",
        name="Vaishnavi Gujaran",
        email="patient@meditrack.com",
        password_hash=default_pw_hash,
        role="patient",
        phone="+91 98765 43210"
    )
    caregiver_user = User(
        id="usr_cg_rajesh",
        name="Rajesh Sharma",
        email="caregiver@meditrack.com",
        password_hash=default_pw_hash,
        role="caregiver",
        phone="+91 98765 12345"
    )
    admin_user = User(
        id="usr_adm_demo",
        name="Dr. Sarah Mitchell",
        email="admin@meditrack.com",
        password_hash=default_pw_hash,
        role="admin",
        phone="+1 555 019 2831"
    )

    db.add_all([patient_user, caregiver_user, admin_user])
    db.flush()

    # 2. Reminder Settings for Patient
    reminder_setting = ReminderSetting(
        id="set_pat_vaishnavi",
        user_id=patient_user.id,
        reminder_before_minutes=10,
        reminder_after_minutes=30,
        max_reminders=2,
        quiet_hours_start="22:00",
        quiet_hours_end="07:00",
        sound_enabled=True
    )
    db.add(reminder_setting)

    # 3. Caregiver Access linking Vaishnavi and Rajesh
    caregiver_link = CaregiverAccess(
        id="acc_vaishnavi_rajesh",
        patient_id=patient_user.id,
        caregiver_id=caregiver_user.id,
        permission="view_adherence",
        status="active"
    )
    db.add(caregiver_link)

    # 4. Chronic Medications for Patient
    today = date.today()
    meds = [
        Medication(
            id="med_metformin",
            user_id=patient_user.id,
            medicine_name="Metformin",
            dosage="500 mg",
            instructions="Take after breakfast with a full glass of water",
            start_date=today - timedelta(days=30),
            status="active"
        ),
        Medication(
            id="med_aspirin",
            user_id=patient_user.id,
            medicine_name="Aspirin",
            dosage="75 mg",
            instructions="Take after lunch with water",
            start_date=today - timedelta(days=30),
            status="active"
        ),
        Medication(
            id="med_atorvastatin",
            user_id=patient_user.id,
            medicine_name="Atorvastatin",
            dosage="20 mg",
            instructions="Take at bedtime with water",
            start_date=today - timedelta(days=30),
            status="active"
        ),
        Medication(
            id="med_lisinopril",
            user_id=patient_user.id,
            medicine_name="Lisinopril",
            dosage="10 mg",
            instructions="Take in the morning for blood pressure",
            start_date=today - timedelta(days=20),
            status="active"
        )
    ]
    db.add_all(meds)
    db.flush()

    # 5. Schedules
    schedules = [
        Schedule(id="sch_metformin_am", medication_id="med_metformin", scheduled_time="08:00", frequency="daily"),
        Schedule(id="sch_lisinopril_am", medication_id="med_lisinopril", scheduled_time="08:30", frequency="daily"),
        Schedule(id="sch_aspirin_noon", medication_id="med_aspirin", scheduled_time="13:00", frequency="daily"),
        Schedule(id="sch_atorvastatin_pm", medication_id="med_atorvastatin", scheduled_time="20:00", frequency="daily")
    ]
    db.add_all(schedules)
    db.flush()

    # 6. Dose Records for the last 14 days
    # Realistically models: Morning ~94%, Afternoon ~82%, Evening ~71%
    dose_records = []
    
    # Today's records
    now_utc = datetime.now(timezone.utc)
    dose_records.extend([
        DoseRecord(
            id=f"dose_today_1",
            schedule_id="sch_metformin_am",
            scheduled_date=today,
            scheduled_time="08:00",
            status="TAKEN",
            confirmed_at=now_utc - timedelta(hours=3),
            notes="Confirmed after breakfast"
        ),
        DoseRecord(
            id=f"dose_today_2",
            schedule_id="sch_lisinopril_am",
            scheduled_date=today,
            scheduled_time="08:30",
            status="TAKEN",
            confirmed_at=now_utc - timedelta(hours=2, minutes=30),
            notes="Taken on time"
        ),
        DoseRecord(
            id=f"dose_today_3",
            schedule_id="sch_aspirin_noon",
            scheduled_date=today,
            scheduled_time="13:00",
            status="PENDING",
            notes="Awaiting afternoon dose confirmation"
        ),
        DoseRecord(
            id=f"dose_today_4",
            schedule_id="sch_atorvastatin_pm",
            scheduled_date=today,
            scheduled_time="20:00",
            status="PENDING",
            notes="Scheduled for tonight"
        )
    ])

    # Past 13 days
    for d in range(1, 14):
        past_date = today - timedelta(days=d)
        
        # Metformin (8:00 AM) - taken almost always (12/13)
        m_status = "MISSED" if d == 7 else "TAKEN"
        dose_records.append(DoseRecord(
            id=f"dose_past_met_{d}",
            schedule_id="sch_metformin_am",
            scheduled_date=past_date,
            scheduled_time="08:00",
            status=m_status,
            confirmed_at=now_utc - timedelta(days=d) if m_status == "TAKEN" else None
        ))

        # Lisinopril (8:30 AM) - taken almost always (12/13)
        l_status = "MISSED" if d == 11 else "TAKEN"
        dose_records.append(DoseRecord(
            id=f"dose_past_lis_{d}",
            schedule_id="sch_lisinopril_am",
            scheduled_date=past_date,
            scheduled_time="08:30",
            status=l_status,
            confirmed_at=now_utc - timedelta(days=d) if l_status == "TAKEN" else None
        ))

        # Aspirin (1:00 PM) - taken ~82%
        if d in (2, 8):
            asp_status = "SNOOZED"
        elif d in (5, 10):
            asp_status = "MISSED"
        else:
            asp_status = "TAKEN"
        dose_records.append(DoseRecord(
            id=f"dose_past_asp_{d}",
            schedule_id="sch_aspirin_noon",
            scheduled_date=past_date,
            scheduled_time="13:00",
            status=asp_status,
            confirmed_at=now_utc - timedelta(days=d) if asp_status == "TAKEN" else None
        ))

        # Atorvastatin (8:00 PM) - missed more often (~71% adherence)
        if d in (1, 3, 5, 9):
            ator_status = "MISSED"
        else:
            ator_status = "TAKEN"
        dose_records.append(DoseRecord(
            id=f"dose_past_ator_{d}",
            schedule_id="sch_atorvastatin_pm",
            scheduled_date=past_date,
            scheduled_time="20:00",
            status=ator_status,
            confirmed_at=now_utc - timedelta(days=d) if ator_status == "TAKEN" else None,
            notes="Evening fatigue noted" if ator_status == "MISSED" else None
        ))

    db.add_all(dose_records)
    db.commit()
    print("Seed complete: Vaishnavi (patient), Rajesh (caregiver), and Dr. Mitchell (admin) ready.")

