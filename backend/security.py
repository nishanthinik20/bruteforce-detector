import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from models import LoginAttempt, BlockedIP, Alert
from alerts import send_telegram_alert

load_dotenv()

FAIL_THRESHOLD = int(os.getenv("FAIL_THRESHOLD", "5"))
WINDOW_SECONDS = int(os.getenv("WINDOW_SECONDS", "60"))
BAN_MINUTES = int(os.getenv("BAN_MINUTES", "10"))


def is_blocked(db: Session, source_ip: str) -> bool:
    """IP block aagirukka nu check pannum"""
    now = datetime.utcnow()
    ban = db.query(BlockedIP).filter(
        BlockedIP.ip_address == source_ip,
        BlockedIP.active == True,
        BlockedIP.unblock_at > now
    ).first()
    return ban is not None


def record_attempt(db: Session, username: str, source_ip: str,
                   device_id: str = None, success: bool = False):
    """Login attempt database la record pannum"""
    attempt = LoginAttempt(
        username=username,
        source_ip=source_ip,
        device_id=device_id,
        success=success
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt
def check_and_ban(db: Session, source_ip: str, device_id: str = None) -> bool:
    """
    Brute-force detect panni IP-a auto-ban pannum.
    Returns: True if banned, False otherwise.
    """
    since = datetime.utcnow() - timedelta(seconds=WINDOW_SECONDS)

    fail_count = db.query(LoginAttempt).filter(
        LoginAttempt.source_ip == source_ip,
        LoginAttempt.success == False,
        LoginAttempt.timestamp >= since
    ).count()

    if fail_count >= FAIL_THRESHOLD:
        now = datetime.utcnow()

        # Already ACTIVE ban irukka check (unblock_at future la irukanum)
        existing_active = db.query(BlockedIP).filter(
            BlockedIP.ip_address == source_ip,
            BlockedIP.active == True,
            BlockedIP.unblock_at > now
        ).first()

        if existing_active:
            return True

        # Old ban irundhaalum expired-a irukku → update pannu
        old_ban = db.query(BlockedIP).filter(
            BlockedIP.ip_address == source_ip
        ).first()

        unblock_time = now + timedelta(minutes=BAN_MINUTES)

        if old_ban:
            # Expired ban-a reactivate pannu
            old_ban.reason = f"{fail_count} failed logins in {WINDOW_SECONDS}s"
            old_ban.blocked_at = now
            old_ban.unblock_at = unblock_time
            old_ban.active = True
        else:
            # New ban
            ban = BlockedIP(
                ip_address=source_ip,
                reason=f"{fail_count} failed logins in {WINDOW_SECONDS}s",
                unblock_at=unblock_time,
                active=True
            )
            db.add(ban)

        # Alert record
        alert = Alert(
            alert_type="BRUTE_FORCE",
            source_ip=source_ip,
            device_id=device_id,
            message=f"Brute-force detected from {source_ip} ({fail_count} attempts). Banned for {BAN_MINUTES} min."
        )
        db.add(alert)
        db.commit()

        # Telegram alert
        send_telegram_alert(
            f"[ALERT] <b>BRUTE FORCE DETECTED</b>\n\n"
            f"<b>IP:</b> {source_ip}\n"
            f"<b>Device:</b> {device_id or 'Unknown'}\n"
            f"<b>Attempts:</b> {fail_count}\n"
            f"<b>Action:</b> Banned for {BAN_MINUTES} min\n"
            f"<b>Time:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC"
        )
        return True

    return False


def cleanup_expired_bans(db: Session):
    """Expired bans-a deactivate pannum"""
    now = datetime.utcnow()
    db.query(BlockedIP).filter(
        BlockedIP.active == True,
        BlockedIP.unblock_at <= now
    ).update({"active": False})
    db.commit()

