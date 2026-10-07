import os
import requests
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")


def send_telegram_alert(message: str):
    """Telegram ku alert anuppum. Token illa-na silent-a skip pannum."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[ALERT-SKIP] Telegram not configured:", message)
        return False

    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        response = requests.post(
            url,
            json={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML"
            },
            timeout=5
        )
        if response.status_code == 200:
            print("[ALERT-SENT] Telegram alert sent")
            return True
        else:
            print("[ALERT-FAIL] Telegram error:", response.text)
            return False
    except Exception as e:
        print("[ALERT-ERROR]", str(e))
        return False