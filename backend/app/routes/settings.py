from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ReminderSetting
from ..schemas import ReminderSettingsUpdate, ReminderSettingsOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("/reminders", response_model=ReminderSettingsOut)
def get_reminder_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(ReminderSetting).filter(ReminderSetting.user_id == current_user.id).first()
    if not settings:
        settings = ReminderSetting(
            user_id=current_user.id,
            reminder_before_minutes=10,
            reminder_after_minutes=30,
            max_reminders=2,
            quiet_hours_start="22:00",
            quiet_hours_end="07:00",
            sound_enabled=True
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings

@router.put("/reminders", response_model=ReminderSettingsOut)
def update_reminder_settings(
    settings_in: ReminderSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(ReminderSetting).filter(ReminderSetting.user_id == current_user.id).first()
    if not settings:
        settings = ReminderSetting(user_id=current_user.id)
        db.add(settings)

    if settings_in.reminder_before_minutes is not None:
        settings.reminder_before_minutes = settings_in.reminder_before_minutes
    if settings_in.reminder_after_minutes is not None:
        settings.reminder_after_minutes = settings_in.reminder_after_minutes
    if settings_in.max_reminders is not None:
        settings.max_reminders = settings_in.max_reminders
    if settings_in.quiet_hours_start is not None:
        settings.quiet_hours_start = settings_in.quiet_hours_start
    if settings_in.quiet_hours_end is not None:
        settings.quiet_hours_end = settings_in.quiet_hours_end
    if settings_in.sound_enabled is not None:
        settings.sound_enabled = settings_in.sound_enabled

    db.commit()
    db.refresh(settings)
    return settings

