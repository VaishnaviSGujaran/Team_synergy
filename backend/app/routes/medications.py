from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Medication, Schedule, DoseRecord
from ..schemas import MedicationCreate, MedicationUpdate, MedicationOut
from ..auth import get_current_user
from datetime import date

router = APIRouter(prefix="/api/medications", tags=["Medications"])

@router.get("", response_model=List[MedicationOut])
def list_medications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Patients view their own medications; caregivers and admins can view with appropriate context
    meds = db.query(Medication).filter(Medication.user_id == current_user.id).order_by(Medication.created_at.desc()).all()
    return meds

@router.post("", response_model=MedicationOut)
def create_medication(med_in: MedicationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can manage personal medications.")

    new_med = Medication(
        user_id=current_user.id,
        medicine_name=med_in.medicine_name.strip(),
        dosage=med_in.dosage.strip(),
        instructions=med_in.instructions.strip(),
        start_date=med_in.start_date,
        end_date=med_in.end_date,
        status="active"
    )
    db.add(new_med)
    db.flush()

    # Create schedules for provided times
    today = date.today()
    for time_str in med_in.scheduled_times:
        clean_time = time_str.strip()
        if len(clean_time) == 5:  # e.g., "08:00"
            sch = Schedule(
                medication_id=new_med.id,
                scheduled_time=clean_time,
                frequency=med_in.frequency or "daily"
            )
            db.add(sch)
            db.flush()

            # Seed a today's pending dose record for this schedule
            dose = DoseRecord(
                schedule_id=sch.id,
                scheduled_date=today,
                scheduled_time=clean_time,
                status="PENDING",
                notes="Initial scheduled dose"
            )
            db.add(dose)

    db.commit()
    db.refresh(new_med)
    return new_med

@router.put("/{med_id}", response_model=MedicationOut)
def update_medication(med_id: str, med_in: MedicationUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id, Medication.user_id == current_user.id).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found.")

    if med_in.medicine_name is not None:
        med.medicine_name = med_in.medicine_name.strip()
    if med_in.dosage is not None:
        med.dosage = med_in.dosage.strip()
    if med_in.instructions is not None:
        med.instructions = med_in.instructions.strip()
    if med_in.start_date is not None:
        med.start_date = med_in.start_date
    if med_in.end_date is not None:
        med.end_date = med_in.end_date
    if med_in.status is not None:
        med.status = med_in.status

    db.commit()
    db.refresh(med)
    return med

@router.delete("/{med_id}")
def delete_medication(med_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id, Medication.user_id == current_user.id).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found.")

    db.delete(med)
    db.commit()
    return {"message": "Medication deleted successfully"}
