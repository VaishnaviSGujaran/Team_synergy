from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, CaregiverAccess, Medication, Schedule, DoseRecord
from ..schemas import CaregiverInviteRequest
from ..auth import get_current_user, require_role
from ..services.adherence_intelligence import calculate_adherence_analytics, SAFETY_DISCLAIMER

router = APIRouter(prefix="/api/caregivers", tags=["Caregiver Management"])

# --- PATIENT ENDPOINTS ---
@router.get("")
def list_patient_caregivers(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """List all caregivers authorized by the logged-in patient."""
    access_records = (
        db.query(CaregiverAccess)
        .filter(CaregiverAccess.patient_id == current_user.id)
        .all()
    )

    results = []
    for acc in access_records:
        cg = db.query(User).filter(User.id == acc.caregiver_id).first()
        results.append({
            "id": acc.id,
            "caregiver_id": acc.caregiver_id,
            "caregiver_name": cg.name if cg else "Authorized Caregiver",
            "caregiver_email": cg.email if cg else "unknown",
            "permission": acc.permission,
            "status": acc.status,
            "created_at": acc.created_at.isoformat() if acc.created_at else None
        })
    return results

@router.post("/invite")
def invite_caregiver(
    req: CaregiverInviteRequest,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Patient authorizes a caregiver by email."""
    cg_email = req.caregiver_email.lower().strip()
    
    if cg_email == current_user.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot add yourself as a caregiver.")

    cg_user = db.query(User).filter(User.email == cg_email).first()
    if not cg_user:
        # For demonstration purposes, if caregiver user does not yet exist, create an account invitation
        from ..auth import hash_password
        cg_user = User(
            name=f"Caregiver ({cg_email.split('@')[0]})",
            email=cg_email,
            password_hash=hash_password("Password123!"),
            role="caregiver"
        )
        db.add(cg_user)
        db.flush()

    existing = (
        db.query(CaregiverAccess)
        .filter(CaregiverAccess.patient_id == current_user.id, CaregiverAccess.caregiver_id == cg_user.id)
        .first()
    )

    if existing:
        existing.status = "active"
        existing.permission = req.permission
        db.commit()
        return {"message": "Caregiver authorization updated to active.", "id": existing.id}

    new_access = CaregiverAccess(
        patient_id=current_user.id,
        caregiver_id=cg_user.id,
        permission=req.permission,
        status="active"
    )
    db.add(new_access)
    db.commit()
    db.refresh(new_access)

    return {
        "message": f"Successfully authorized {cg_email} as caregiver.",
        "id": new_access.id,
        "status": "active"
    }

@router.delete("/{access_id}")
def revoke_caregiver(
    access_id: str,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    """Patient revokes caregiver access."""
    acc = db.query(CaregiverAccess).filter(CaregiverAccess.id == access_id, CaregiverAccess.patient_id == current_user.id).first()
    if not acc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Authorization record not found.")

    acc.status = "revoked"
    db.commit()
    return {"message": "Caregiver authorization revoked."}


# --- CAREGIVER ENDPOINTS ---
@router.get("/patients")
def list_authorized_patients(
    current_user: User = Depends(require_role(["caregiver"])),
    db: Session = Depends(get_db)
):
    """Caregiver views the list of patients who have authorized them."""
    access_records = (
        db.query(CaregiverAccess)
        .filter(CaregiverAccess.caregiver_id == current_user.id, CaregiverAccess.status == "active")
        .all()
    )

    patients = []
    for acc in access_records:
        pat = db.query(User).filter(User.id == acc.patient_id).first()
        if pat:
            patients.append({
                "access_id": acc.id,
                "patient_id": pat.id,
                "patient_name": pat.name,
                "patient_email": pat.email,
                "permission": acc.permission,
                "authorized_since": acc.created_at.isoformat() if acc.created_at else None
            })
    return patients

@router.get("/patients/{patient_id}/summary")
def get_patient_adherence_summary(
    patient_id: str,
    current_user: User = Depends(require_role(["caregiver"])),
    db: Session = Depends(get_db)
):
    """
    Caregiver views authorized patient's adherence summary, today's doses, and patterns.
    STRICT SECURITY: Checks active authorization.
    STRICT READ-ONLY: Caregivers cannot edit medications or dosages.
    """
    authorization = (
        db.query(CaregiverAccess)
        .filter(
            CaregiverAccess.caregiver_id == current_user.id,
            CaregiverAccess.patient_id == patient_id,
            CaregiverAccess.status == "active"
        )
        .first()
    )

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this patient's adherence data."
        )

    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    # 1. Analytics & Patterns
    analytics = calculate_adherence_analytics(db, patient_id, days=14)

    # 2. Today's Doses Summary
    today = date.today()
    today_records = (
        db.query(DoseRecord, Schedule, Medication)
        .join(Schedule, DoseRecord.schedule_id == Schedule.id)
        .join(Medication, Schedule.medication_id == Medication.id)
        .filter(Medication.user_id == patient_id, DoseRecord.scheduled_date == today)
        .order_by(DoseRecord.scheduled_time.asc())
        .all()
    )

    today_summary = {
        "taken": 0,
        "missed": 0,
        "pending": 0,
        "snoozed": 0,
        "doses": []
    }

    for dose, sch, med in today_records:
        if dose.status == "TAKEN":
            today_summary["taken"] += 1
        elif dose.status == "MISSED":
            today_summary["missed"] += 1
        elif dose.status == "SNOOZED":
            today_summary["snoozed"] += 1
        else:
            today_summary["pending"] += 1

        today_summary["doses"].append({
            "id": dose.id,
            "medicine_name": med.medicine_name,
            "dosage": med.dosage,
            "scheduled_time": dose.scheduled_time,
            "status": dose.status,
            "confirmed_at": dose.confirmed_at.isoformat() if dose.confirmed_at else None
        })

    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "email": patient.email
        },
        "permission": authorization.permission,
        "adherence_percentage": analytics["overall_adherence"],
        "today_summary": today_summary,
        "weekly_chart": analytics["weekly_chart"],
        "patterns": analytics["patterns"],
        "suggestions": analytics["suggestions"],
        "disclaimer": SAFETY_DISCLAIMER
    }
