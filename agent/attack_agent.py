"""
External Device Attack Agent
Level 5 Cybersecurity Project - Brute Force Detection

Idhu script-a 2nd laptop / VM la run pannunga.
Adhu automatically brute-force attack simulate pannum,
and backend la detect aagi, Telegram alert varum.
"""
import requests
import time
import socket
import platform
import sys

# ============ CONFIG ============
# Backend URL - local la running-a irundha 127.0.0.1:8000
# Cloud la deploy aana aprom, adhu URL podunga (https://your-app.onrender.com)
BACKEND_URL = "http://127.0.0.1:8000"

# Agent API Key - .env la irukkura value
AGENT_API_KEY = "agent-secret-key-change-me"

# Attack settings
TARGET_USER = "admin"
ATTEMPTS = 50
DELAY = 0.2  # seconds between attempts


def get_device_info():
    """Idhu external device info collect pannum"""
    return {
        "device_id": f"{socket.gethostname()}-{platform.system()}",
        "hostname": socket.gethostname(),
        "os": platform.system()
    }


def register_agent():
    """Backend la device register pannum"""
    info = get_device_info()
    try:
        r = requests.post(
            f"{BACKEND_URL}/api/agent/register",
            json=info,
            headers={"X-API-Key": AGENT_API_KEY},
            timeout=10
        )
        if r.status_code == 200:
            print(f"[+] Agent registered: {info['device_id']}")
            print(f"[+] Response: {r.json()}")
        else:
            print(f"[!] Register failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"[!] Register error: {e}")
        sys.exit(1)


def send_heartbeat():
    """Device alive-a nu signal anuppum"""
    info = get_device_info()
    try:
        requests.post(
            f"{BACKEND_URL}/api/agent/heartbeat",
            json=info,
            headers={"X-API-Key": AGENT_API_KEY},
            timeout=5
        )
    except Exception:
        pass


def brute_force():
    """Brute-force attack simulate pannum"""
    info = get_device_info()
    print(f"\n[*] Starting brute-force: {ATTEMPTS} attempts")
    print(f"[*] Target: {BACKEND_URL}/api/login")
    print(f"[*] Username: {TARGET_USER}")
    print(f"[*] Device: {info['device_id']}")
    print("-" * 60)

    banned_at = None
    for i in range(ATTEMPTS):
        try:
            r = requests.post(
                f"{BACKEND_URL}/api/login",
                json={"username": TARGET_USER, "password": f"wrong{i}"},
                headers={"X-Agent-ID": info["device_id"]},
                timeout=5
            )
            data = r.json()
            msg = data.get("message", "")
            blocked = data.get("blocked", False)

            status = "🚨 BLOCKED" if blocked else "❌ FAIL"
            print(f"  [{i+1:03d}] {status} | {msg}")

            if blocked and banned_at is None:
                banned_at = i + 1
                print(f"\n🎯 BAN TRIGGERED at attempt {banned_at}!")

        except Exception as e:
            print(f"  [{i+1:03d}] ERROR: {e}")

        # Heartbeat every 10 attempts
        if (i + 1) % 10 == 0:
            send_heartbeat()

        time.sleep(DELAY)

    print("-" * 60)
    print(f"[*] Attack complete. {ATTEMPTS} attempts sent.")
    if banned_at:
        print(f"[+] IP was banned at attempt {banned_at} ✅")


if __name__ == "__main__":
    print("=" * 60)
    print("EXTERNAL DEVICE ATTACK AGENT")
    print("Brute-Force Detection System - Level 5 Project")
    print("=" * 60)
    print(f"[*] Hostname: {socket.gethostname()}")
    print(f"[*] OS: {platform.system()}")
    print(f"[*] Backend: {BACKEND_URL}")
    print()

    register_agent()
    brute_force()
    print("\n[*] Agent finished.")