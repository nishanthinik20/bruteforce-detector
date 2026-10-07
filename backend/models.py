from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(100), unique=True, index=True)
    hostname = Column(String(100))
    os = Column(String(50))
    ip_address = Column(String(45))
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    status = Column(String(20), default="active")


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100))
    source_ip = Column(String(45), index=True)
    device_id = Column(String(100), nullable=True)
    success = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class BlockedIP(Base):
    __tablename__ = "blocked_ips"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(45), unique=True, index=True)
    reason = Column(String(200))
    blocked_at = Column(DateTime(timezone=True), server_default=func.now())
    unblock_at = Column(DateTime(timezone=True))
    active = Column(Boolean, default=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50))
    source_ip = Column(String(45))
    device_id = Column(String(100), nullable=True)
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())