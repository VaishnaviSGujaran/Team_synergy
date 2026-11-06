import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="patient")  # 'patient', 'caregiver', 'admin'
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    medications = relationship("Medication", back_populates="user", cascade="all, delete-orphan")
    reminder_settings = relationship("ReminderSetting", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Caregiver relations: patient authorizes caregivers, or caregiver is linked to patients
    caregiver_links_as_patient = relationship(
        "CaregiverAccess", 
        foreign_keys="[CaregiverAccess.patient_id]", 
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    caregiver_links_as_caregiver = relationship(
        "CaregiverAccess", 
        foreign_keys="[CaregiverAccess.caregiver_id]", 
        back_populates="caregiver",
        cascade="all, delete-orphan"
    )


class Medication(Base):
    __tablename__ = "medications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_name = Column(String(150), nullable=False)
    dosage = Column(String(80), nullable=False)
    instructions = Column(Text, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(20), default="active")  # 'active', 'completed', 'discontinued'
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    user = relationship("User", back_populates="medications")
    schedules = relationship("Schedule", back_populates="medication", cascade="all, delete-orphan")


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    medication_id = Column(String(36), ForeignKey("medications.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_time = Column(String(8), nullable=False)  # HH:MM format e.g. "08:00"
    frequency = Column(String(30), default="daily")  # 'daily', 'weekly', 'as_needed'
    days_of_week = Column(Text, default='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]')
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    # Relationships
    medication = relationship("Medication", back_populates="schedules")
    dose_records = relationship("DoseRecord", back_populates="schedule", cascade="all, delete-orphan")


class DoseRecord(Base):
    __tablename__ = "dose_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    schedule_id = Column(String(36), ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_date = Column(Date, nullable=False, index=True)
    scheduled_time = Column(String(8), nullable=False)
    status = Column(String(20), nullable=False, default="PENDING", index=True)  # 'PENDING', 'TAKEN', 'MISSED', 'SNOOZED'
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    snooze_until = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    schedule = relationship("Schedule", back_populates="dose_records")


class CaregiverAccess(Base):
    __tablename__ = "caregiver_access"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    caregiver_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    permission = Column(String(50), default="view_adherence")  # 'view_adherence', 'view_full_history'
    status = Column(String(20), default="active")  # 'active', 'pending', 'revoked'
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="caregiver_links_as_patient")
    caregiver = relationship("User", foreign_keys=[caregiver_id], back_populates="caregiver_links_as_caregiver")


class ReminderSetting(Base):
    __tablename__ = "reminder_settings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    reminder_before_minutes = Column(Integer, default=10)
    reminder_after_minutes = Column(Integer, default=30)
    max_reminders = Column(Integer, default=2)
    quiet_hours_start = Column(String(8), default="22:00")
    quiet_hours_end = Column(String(8), default="07:00")
    sound_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    user = relationship("User", back_populates="reminder_settings")

