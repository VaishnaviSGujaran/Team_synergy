from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Medication, DoseRecord, CaregiverAccess
from ..auth import require_role

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])

@router.get("/overview")
def get_admin_overview(
    admin_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    patients_count = db.query(User).filter(User.role == "patient").count()
    caregivers_count = db.query(User).filter(User.role == "caregiver").count()
    medications_count = db.query(Medication).count()
    doses_count = db.query(DoseRecord).count()
    taken_doses = db.query(DoseRecord).filter(DoseRecord.status == "TAKEN").count()

    overall_system_adherence = round((taken_doses / doses_count * 100), 1) if doses_count > 0 else 0

    return {
        "stats": {
            "total_users": total_users,
            "patients": patients_count,
            "caregivers": caregivers_count,
            "medications": medications_count,
            "doses_recorded": doses_count,
            "system_adherence_rate": overall_system_adherence
        }
    }

@router.get("/users")
def get_all_users(
    admin_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "phone": u.phone,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]

@router.get("/activity")
def get_system_activity(
    admin_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    # Retrieve recent dose confirmations
    recent_doses = (
        db.query(DoseRecord)
        .order_by(DoseRecord.created_at.desc())
        .limit(10)
        .all()
    )

    activities = []
    for d in recent_doses:
        activities.append({
            "type": "DOSE_STATUS_UPDATE",
            "description": f"Dose record #{d.id[:8]} updated to status {d.status}",
            "timestamp": d.created_at.isoformat() if d.created_at else None,
            "status": d.status
        })

    return activities

