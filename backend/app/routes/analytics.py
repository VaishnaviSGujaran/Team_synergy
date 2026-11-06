from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import get_current_user
from ..services.adherence_intelligence import calculate_adherence_analytics

router = APIRouter(prefix="/api/analytics", tags=["Adherence Analytics"])

@router.get("")
def get_analytics(
    days: int = Query(14, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns adherence percentage, charts data, and missed-dose pattern intelligence.
    Includes strict medical safety disclaimer and safeguards.
    """
    return calculate_adherence_analytics(db, current_user.id, days=days)
