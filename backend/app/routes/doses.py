from datetime import date, datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Medication, Schedule, DoseRecord
from ..schemas import DoseResponseRequest
from ..auth import get_current_user

router = APIRouter(prefix="/api/doses", tags=["Doses"])

def ensure_today_doses(db: Session, user_id: str):
    """Checks if active schedules have dose records for today; creates PENDING records if missing."""
    today = date.today()
    schedules = (
        db.query(Schedule)
        .join(Medication, Schedule.medication_id == Medication.id)
        .filter(Medication.user_id == user_id, Medication.status == "active")
        .all()
    )
    for sch in schedules:
        existing = (
            db.query(DoseRecord)
            .filter(DoseRecord.schedule_id == sch.id, DoseRecord.scheduled_date == today)
            .first()
        )
        if not existing:
            new_dose = DoseRecord(
                schedule_id=sch.id,
                scheduled_date=today,
                scheduled_time=sch.scheduled_time,
                status="PENDING",
                notes="Scheduled for today"
            )
            db.add(new_dose)
    db.commit()

def get_or_create_test_dose(db: Session, user: User) -> DoseRecord:
    """Finds or creates a real database dose record for testing reminders."""
    today = date.today()
    ensure_today_doses(db, user.id)

    # 1. Look for any existing PENDING or SNOOZED dose for this user today
    existing_pending = (
        db.query(DoseRecord)
        .join(Schedule, DoseRecord.schedule_id == Schedule.id)
        .join(Medication, Schedule.medication_id == Medication.id)
        .filter(
            Medication.user_id == user.id,
            DoseRecord.scheduled_date == today,
            DoseRecord.status.in_(["PENDING", "SNOOZED"])
        )
        .first()
    )
    if existing_pending:
        return existing_pending

    # 2. Check if user has an active medication
    med = db.query(Medication).filter(Medication.user_id == user.id, Medication.status == "active").first()
    if not med:
        med = Medication(
            user_id=user.id,
            medicine_name="Metformin",
            dosage="500 mg",
            instructions="Take after breakfast with water",
            start_date=today,
            status="active"
        )
        db.add(med)
        db.flush()

    # 3. Check or create schedule
    sch = db.query(Schedule).filter(Schedule.medication_id == med.id).first()
    if not sch:
        now_time = datetime.now().strftime("%H:%M")
        sch = Schedule(
            medication_id=med.id,
            scheduled_time=now_time,
            frequency="daily"
        )
        db.add(sch)
        db.flush()

    # 4. Create fresh today dose
    new_dose = DoseRecord(
        schedule_id=sch.id,
        scheduled_date=today,
        scheduled_time=sch.scheduled_time,
        status="PENDING",
        notes="Created for medication reminder testing"
    )
    db.add(new_dose)
    db.commit()
    db.refresh(new_dose)
    return new_dose

@router.get("/today")
def get_today_doses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_today_doses(db, current_user.id)
    today = date.today()

    records = (
        db.query(DoseRecord, Schedule, Medication)
        .join(Schedule, DoseRecord.schedule_id == Schedule.id)
        .join(Medication, Schedule.medication_id == Medication.id)
        .filter(Medication.user_id == current_user.id, DoseRecord.scheduled_date == today)
        .order_by(DoseRecord.scheduled_time.asc())
        .all()
    )

    result = []
    taken_count = 0
    pending_count = 0
    missed_count = 0
    snoozed_count = 0

    for dose, sch, med in records:
        if dose.status == "TAKEN":
            taken_count += 1
        elif dose.status == "MISSED":
            missed_count += 1
        elif dose.status == "SNOOZED":
            snoozed_count += 1
        else:
            pending_count += 1

        result.append({
            "id": dose.id,
            "schedule_id": sch.id,
            "medication_id": med.id,
            "medicine_name": med.medicine_name,
            "dosage": med.dosage,
            "instructions": med.instructions,
            "scheduled_time": dose.scheduled_time,
            "status": dose.status,
            "confirmed_at": dose.confirmed_at.isoformat() if dose.confirmed_at else None,
            "snooze_until": dose.snooze_until.isoformat() if dose.snooze_until else None,
            "notes": dose.notes
        })

    total_doses = len(result)
    today_adherence = round((taken_count / total_doses * 100), 1) if total_doses > 0 else 0

    return {
        "date": today.isoformat(),
        "today_adherence": today_adherence,
        "summary": {
            "total": total_doses,
            "taken": taken_count,
            "pending": pending_count,
            "missed": missed_count,
            "snoozed": snoozed_count
        },
        "doses": result
    }

@router.get("/weekly")
def get_weekly_doses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    # Start of week (Monday)
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    records = (
        db.query(DoseRecord, Schedule, Medication)
        .join(Schedule, DoseRecord.schedule_id == Schedule.id)
        .join(Medication, Schedule.medication_id == Medication.id)
        .filter(
            Medication.user_id == current_user.id,
            DoseRecord.scheduled_date >= start_of_week,
            DoseRecord.scheduled_date <= end_of_week
        )
        .order_by(DoseRecord.scheduled_date.asc(), DoseRecord.scheduled_time.asc())
        .all()
    )

    days_data = {}
    current = start_of_week
    while current <= end_of_week:
        days_data[current.isoformat()] = {
            "date": current.isoformat(),
            "day_name": current.strftime("%A"),
            "is_today": current == today,
            "doses": []
        }
        current += timedelta(days=1)

    for dose, sch, med in records:
        d_key = dose.scheduled_date.isoformat()
        if d_key in days_data:
            days_data[d_key]["doses"].append({
                "id": dose.id,
                "medicine_name": med.medicine_name,
                "dosage": med.dosage,
                "scheduled_time": dose.scheduled_time,
                "status": dose.status,
                "confirmed_at": dose.confirmed_at.isoformat() if dose.confirmed_at else None
            })

    return {
        "start_of_week": start_of_week.isoformat(),
        "end_of_week": end_of_week.isoformat(),
        "days": list(days_data.values())
    }

@router.post("/test-reminder")
def trigger_test_reminder(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates or retrieves a real pending dose for the current user to test the reminder flow."""
    dose = get_or_create_test_dose(db, current_user)
    sch = db.query(Schedule).filter(Schedule.id == dose.schedule_id).first()
    med = db.query(Medication).filter(Medication.id == sch.medication_id).first() if sch else None

    return {
        "id": dose.id,
        "schedule_id": dose.schedule_id,
        "medication_id": med.id if med else None,
        "medicine_name": med.medicine_name if med else "Metformin",
        "dosage": med.dosage if med else "500 mg",
        "instructions": med.instructions if med else "Take after breakfast with water",
        "scheduled_time": dose.scheduled_time,
        "status": dose.status,
        "notes": dose.notes
    }

@router.post("/respond/{dose_id}")
def respond_dose(
    dose_id: str,
    resp: DoseResponseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CRITICAL HEALTHCARE RULE:
    Reminder delivered != taken.
    The patient explicitly confirms TAKEN, MISSED, or SNOOZED.
    """
    dose = None

    # Handle test/simulation dose IDs gracefully by binding to user's real dose
    if dose_id in ("demo_simulated_dose", "test_reminder", "test") or dose_id.startswith("demo_"):
        dose = get_or_create_test_dose(db, current_user)
    else:
        query = (
            db.query(DoseRecord)
            .join(Schedule, DoseRecord.schedule_id == Schedule.id)
            .join(Medication, Schedule.medication_id == Medication.id)
            .filter(DoseRecord.id == dose_id)
        )
        if current_user.role != "admin":
            query = query.filter(Medication.user_id == current_user.id)
        dose = query.first()

        # Fallback to user's latest today's dose if ID was orphaned or from a previous session
        if not dose:
            dose = (
                db.query(DoseRecord)
                .join(Schedule, DoseRecord.schedule_id == Schedule.id)
                .join(Medication, Schedule.medication_id == Medication.id)
                .filter(Medication.user_id == current_user.id, DoseRecord.scheduled_date == date.today())
                .order_by(DoseRecord.scheduled_time.asc())
                .first()
            )

    if not dose:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dose record not found or not owned by you.")

    now = datetime.now(timezone.utc)
    dose.status = resp.status

    if resp.status == "TAKEN":
        dose.confirmed_at = now
        dose.snooze_until = None
    elif resp.status == "SNOOZED":
        minutes = resp.snooze_minutes if resp.snooze_minutes in (10, 20, 30) else 15
        dose.snooze_until = now + timedelta(minutes=minutes)
    elif resp.status == "MISSED":
        dose.confirmed_at = None
        dose.snooze_until = None

    if resp.notes:
        dose.notes = resp.notes

    db.commit()
    db.refresh(dose)

    return {
        "message": f"Dose marked as {resp.status}",
        "dose_id": dose.id,
        "status": dose.status,
        "confirmed_at": dose.confirmed_at.isoformat() if dose.confirmed_at else None,
        "snooze_until": dose.snooze_until.isoformat() if dose.snooze_until else None
    }

@router.get("/history")
def get_dose_history(
    date_filter: Optional[str] = Query(None, description="YYYY-MM-DD"),
    medicine_filter: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        db.query(DoseRecord, Schedule, Medication)
        .join(Schedule, DoseRecord.schedule_id == Schedule.id)
        .join(Medication, Schedule.medication_id == Medication.id)
        .filter(Medication.user_id == current_user.id)
    )

    if date_filter:
        try:
            filter_dt = date.fromisoformat(date_filter)
            query = query.filter(DoseRecord.scheduled_date == filter_dt)
        except ValueError:
            pass

    if medicine_filter and medicine_filter != "all":
        query = query.filter(Medication.id == medicine_filter)

    if status_filter and status_filter != "all":
        query = query.filter(DoseRecord.status == status_filter.upper())

    records = query.order_by(DoseRecord.scheduled_date.desc(), DoseRecord.scheduled_time.desc()).limit(limit).all()

    items = []
    for dose, sch, med in records:
        items.append({
            "id": dose.id,
            "scheduled_date": dose.scheduled_date.isoformat(),
            "scheduled_time": dose.scheduled_time,
            "medicine_name": med.medicine_name,
            "dosage": med.dosage,
            "status": dose.status,
            "confirmed_at": dose.confirmed_at.isoformat() if dose.confirmed_at else None,
            "notes": dose.notes
        })

    return items

