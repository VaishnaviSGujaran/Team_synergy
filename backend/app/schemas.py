from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# --- User Schemas ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=3, max_length=160)
    password: str = Field(..., min_length=6)
    confirm_password: Optional[str] = None
    role: str = Field(default="patient", pattern="^(patient|caregiver|admin)$")
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Medication Schemas ---
class ScheduleCreate(BaseModel):
    scheduled_time: str = Field(..., description="HH:MM format e.g. 08:00")
    frequency: str = "daily"
    days_of_week: Optional[str] = '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'

class ScheduleOut(BaseModel):
    id: str
    medication_id: str
    scheduled_time: str
    frequency: str
    days_of_week: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MedicationCreate(BaseModel):
    medicine_name: str = Field(..., min_length=1, max_length=150)
    dosage: str = Field(..., min_length=1, max_length=80)
    instructions: str
    start_date: date
    end_date: Optional[date] = None
    frequency: Optional[str] = "daily"
    scheduled_times: List[str] = Field(default=["08:00"], description="List of times like ['08:00', '20:00']")

class MedicationUpdate(BaseModel):
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    instructions: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None

class MedicationOut(BaseModel):
    id: str
    user_id: str
    medicine_name: str
    dosage: str
    instructions: str
    start_date: date
    end_date: Optional[date] = None
    status: str
    created_at: Optional[datetime] = None
    schedules: List[ScheduleOut] = []

    class Config:
        from_attributes = True

# --- Dose Record Schemas ---
class DoseResponseRequest(BaseModel):
    status: str = Field(..., pattern="^(TAKEN|MISSED|SNOOZED)$")
    snooze_minutes: Optional[int] = Field(default=15, description="10, 20, or 30 minutes")
    notes: Optional[str] = None

class DoseRecordOut(BaseModel):
    id: str
    schedule_id: str
    scheduled_date: date
    scheduled_time: str
    status: str
    confirmed_at: Optional[datetime] = None
    snooze_until: Optional[datetime] = None
    notes: Optional[str] = None
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    instructions: Optional[str] = None

    class Config:
        from_attributes = True

# --- Caregiver Access Schemas ---
class CaregiverInviteRequest(BaseModel):
    caregiver_email: str = Field(..., min_length=3, max_length=160)
    permission: str = "view_adherence"

class CaregiverAccessOut(BaseModel):
    id: str
    patient_id: str
    caregiver_id: str
    caregiver_name: Optional[str] = None
    caregiver_email: Optional[str] = None
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None
    permission: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Reminder Settings Schemas ---
class ReminderSettingsUpdate(BaseModel):
    reminder_before_minutes: Optional[int] = Field(default=10, ge=0, le=120)
    reminder_after_minutes: Optional[int] = Field(default=30, ge=5, le=180)
    max_reminders: Optional[int] = Field(default=2, ge=1, le=5)
    quiet_hours_start: Optional[str] = Field(default="22:00")
    quiet_hours_end: Optional[str] = Field(default="07:00")
    sound_enabled: Optional[bool] = True

class ReminderSettingsOut(BaseModel):
    id: str
    user_id: str
    reminder_before_minutes: int
    reminder_after_minutes: int
    max_reminders: int
    quiet_hours_start: str
    quiet_hours_end: str
    sound_enabled: bool

    class Config:
        from_attributes = True
