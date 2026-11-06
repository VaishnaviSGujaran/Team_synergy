import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed_data import seed_initial_data
from .routes import auth, medications, doses, analytics, caregivers, settings, admin

# Medical Safety Disclaimer
SAFETY_DISCLAIMER = (
    "MediTrack is a medication management and adherence support platform. "
    "It does not provide medical diagnosis, prescribe medications, change treatment plans, "
    "or replace professional medical advice. Medication information should be based on "
    "prescriptions provided by qualified healthcare professionals."
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default demo data if needed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield
    # Shutdown cleanups if any

app = FastAPI(
    title="MediTrack - Medication Adherence Intelligence API",
    description="Full-stack chronic patient medication adherence platform backend.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite frontend and common development ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(medications.router)
app.include_router(doses.router)
app.include_router(analytics.router)
app.include_router(caregivers.router)
app.include_router(settings.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "platform": "MediTrack",
        "tagline": "Medication Adherence Intelligence Platform for Chronic Patients",
        "status": "online",
        "version": "1.0.0",
        "disclaimer": SAFETY_DISCLAIMER
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

