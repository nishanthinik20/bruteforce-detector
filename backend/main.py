from fastapi import FastAPI, Depends, Request, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import os
from dotenv import load_dotenv

from database import get_db, init_db
from models import Device, LoginAttempt, BlockedIP, Alert
from schemas import (
    LoginRequest, LoginResponse,
    AgentRegister, AgentResponse,
    DeviceOut, LoginAttemptOut, BlockedIPOut, AlertOut, StatsOut
)
from security import is_blocked, record_attempt, check_and_ban, cleanup_expired_bans

load_dotenv()

AGENT_API_KEY = os.getenv("AGENT_API_KEY", "agent-secret-key-change-me")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(
    title="Brute-Force Detection API",
    description="Level 5 Cybersecurity Project - Backend API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    print("[STARTUP] Database initialized")


def get_client_ip(request: Request) -> str:
    """Client IP extract pannum (proxy-safe)"""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host


# ============================================================
# ROOT
# ============================================================
@app.get("/")
def root():
    return {
        "status": "running",
        "project": "Brute-Force Attack Detection & Auto-Ban System",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}


# ============================================================
# LOGIN (Attack Target)
# ============================================================
@app.post("/api/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
    x_agent_id: Optional[str] = Header(None, alias="X-Agent-ID")
):
    source_ip = get_client_ip(request)
    device_id = x_agent_id

    # Cleanup expired bans
    cleanup_expired_bans(db)

    # Check if IP is blocked
    if is_blocked(db, source_ip):
        return LoginResponse(
            success=False,
            message="IP is blocked due to suspicious activity",
            blocked=True
        )

    # Simple demo auth (real la DB check)
    success = (payload.username == "admin" and payload.password == "admin123")

    record_attempt(db, payload.username, source_ip, device_id, success)

    if not success:
        banned = check_and_ban(db, source_ip, device_id)
        if banned:
            return LoginResponse(
                success=False,
                message="Too many failed attempts. IP banned.",
                blocked=True
            )
        return LoginResponse(success=False, message="Invalid credentials")

    return LoginResponse(success=True, message="Login successful")


# ============================================================
# AGENT (External Device)
# ============================================================
@app.post("/api/agent/register", response_model=AgentResponse)
def agent_register(
    payload: AgentRegister,
    request: Request,
    db: Session = Depends(get_db),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
):
    if x_api_key != AGENT_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    source_ip = get_client_ip(request)

    device = db.query(Device).filter(Device.device_id == payload.device_id).first()
    if device:
        device.hostname = payload.hostname
        device.os = payload.os
        device.ip_address = source_ip
        device.status = "active"
    else:
        device = Device(
            device_id=payload.device_id,
            hostname=payload.hostname,
            os=payload.os,
            ip_address=source_ip,
            status="active"
        )
        db.add(device)
    db.commit()

    return AgentResponse(
        status="registered",
        message="Device registered successfully",
        device_id=payload.device_id
    )


@app.post("/api/agent/heartbeat")
def agent_heartbeat(
    payload: AgentRegister,
    request: Request,
    db: Session = Depends(get_db),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
):
    if x_api_key != AGENT_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    source_ip = get_client_ip(request)
    device = db.query(Device).filter(Device.device_id == payload.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")

    device.last_seen = func.now()
    device.ip_address = source_ip
    device.status = "active"
    db.commit()
    return {"status": "ok", "device_id": payload.device_id}


# ============================================================
# DASHBOARD
# ============================================================
@app.get("/api/dashboard/devices", response_model=List[DeviceOut])
def dashboard_devices(db: Session = Depends(get_db)):
    return db.query(Device).order_by(Device.last_seen.desc()).all()


@app.get("/api/dashboard/attempts", response_model=List[LoginAttemptOut])
def dashboard_attempts(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(LoginAttempt).order_by(LoginAttempt.timestamp.desc()).limit(limit).all()


@app.get("/api/dashboard/blocked", response_model=List[BlockedIPOut])
def dashboard_blocked(db: Session = Depends(get_db)):
    return db.query(BlockedIP).order_by(BlockedIP.blocked_at.desc()).all()


@app.get("/api/dashboard/alerts", response_model=List[AlertOut])
def dashboard_alerts(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()


@app.get("/api/dashboard/stats", response_model=StatsOut)
def dashboard_stats(db: Session = Depends(get_db)):
    total_attempts = db.query(LoginAttempt).count()
    failed_attempts = db.query(LoginAttempt).filter(LoginAttempt.success == False).count()
    unique_ips = db.query(LoginAttempt.source_ip).distinct().count()
    active_bans = db.query(BlockedIP).filter(BlockedIP.active == True).count()
    total_devices = db.query(Device).count()
    total_alerts = db.query(Alert).count()

    return StatsOut(
        total_attempts=total_attempts,
        failed_attempts=failed_attempts,
        unique_ips=unique_ips,
        active_bans=active_bans,
        total_devices=total_devices,
        total_alerts=total_alerts
    )