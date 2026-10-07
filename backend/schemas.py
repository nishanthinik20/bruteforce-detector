from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ============ LOGIN ============
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str
    blocked: bool = False


# ============ AGENT ============
class AgentRegister(BaseModel):
    device_id: str
    hostname: str
    os: str


class AgentResponse(BaseModel):
    status: str
    message: str
    device_id: str


# ============ DEVICE ============
class DeviceOut(BaseModel):
    id: int
    device_id: str
    hostname: str
    os: str
    ip_address: Optional[str] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True


# ============ LOGIN ATTEMPT ============
class LoginAttemptOut(BaseModel):
    id: int
    username: str
    source_ip: str
    device_id: Optional[str] = None
    success: bool
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ BLOCKED IP ============
class BlockedIPOut(BaseModel):
    id: int
    ip_address: str
    reason: str
    blocked_at: Optional[datetime] = None
    unblock_at: Optional[datetime] = None
    active: bool

    class Config:
        from_attributes = True


# ============ ALERT ============
class AlertOut(BaseModel):
    id: int
    alert_type: str
    source_ip: str
    device_id: Optional[str] = None
    message: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ STATS ============
class StatsOut(BaseModel):
    total_attempts: int
    failed_attempts: int
    unique_ips: int
    active_bans: int
    total_devices: int
    total_alerts: int