import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAttempt } from "../api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus(null);

    try {
      const data = await loginAttempt(username, password);
      setMessage(data.message);
      setStatus(data.success ? "success" : data.blocked ? "blocked" : "error");
    } catch (err) {
      setMessage("Connection Error: " + err.message);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Scan line animation */}
      <div style={styles.scanline}></div>

      {/* Cyber grid background */}
      <div style={styles.grid}></div>

      {/* Status bar - top */}
      <div style={styles.statusBar}>
        <span style={styles.statusItem}>
          <span style={styles.dot}></span> SYSTEM: ONLINE
        </span>
        <span style={styles.statusItem}>ENCRYPTION: AES-256</span>
        <span style={styles.statusItem}>UPTIME: 99.9%</span>
      </div>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>⬢ BRUTE-FORCE ATTACK</h1>
<h2 style={styles.title2}>DETECTION SYSTEM</h2>
          <p style={styles.subtitle}>// AUTHORIZED ACCESS ONLY</p>
        </div>

        {/* Terminal prompt */}
        <div style={styles.terminal}>
          <span style={styles.prompt}>&gt;</span> AUTHENTICATION REQUIRED
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>&gt; USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="enter username"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>&gt; PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="enter password"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "[ AUTHENTICATING... ]" : "[ ▶ EXECUTE LOGIN ]"}
          </button>
        </form>

        {/* Response message */}
        {message && (
          <div
            style={{
              ...styles.message,
              borderLeft:
                status === "success"
                  ? "4px solid #00ff88"
                  : status === "blocked"
                  ? "4px solid #ff3366"
                  : "4px solid #ffaa00",
              color:
                status === "success"
                  ? "#00ff88"
                  : status === "blocked"
                  ? "#ff3366"
                  : "#ffaa00",
            }}
          >
            <span style={styles.prompt}>&gt;</span> {message}
          </div>
        )}

        {/* Hints */}
        <div style={styles.hints}>
          <span style={styles.hint}>&gt; 5 wrong attempts → IP BANNED</span>
          <span style={styles.hint}>&gt; MONITORED BY SECURITY TEAM</span>
        </div>

        {/* Dashboard link */}
        <button onClick={() => navigate("/dashboard")} style={styles.linkBtn}>
          [ → ACCESS DASHBOARD ]
        </button>
      </div>

      {/* Status bar - bottom */}
      <div style={styles.statusBarBottom}>
        <span style={styles.statusItem}>
          <span style={styles.dotGreen}></span> THREAT LEVEL: LOW
        </span>
        <span style={styles.statusItem}>FIREWALL: ACTIVE</span>
        <span style={styles.statusItem}>SESSION: SECURE</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  scanline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, transparent, #00d4ff, transparent)",
    animation: "scanline 8s linear infinite",
    opacity: 0.3,
    pointerEvents: "none",
  },
  grid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)",
    backgroundSize: "50px 50px",
    pointerEvents: "none",
  },
  statusBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "8px 20px",
    background: "rgba(10, 14, 26, 0.9)",
    borderBottom: "1px solid #00d4ff40",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#00d4ff",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "1px",
  },
  statusBarBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "8px 20px",
    background: "rgba(10, 14, 26, 0.9)",
    borderTop: "1px solid #00d4ff40",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#00d4ff",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "1px",
  },
  statusItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#00ff88",
    boxShadow: "0 0 8px #00ff88",
    animation: "blink 1.5s infinite",
  },
  dotGreen: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#00ff88",
    boxShadow: "0 0 8px #00ff88",
  },
  card: {
    background: "rgba(15, 23, 42, 0.95)",
    border: "1px solid #00d4ff40",
    borderRadius: "4px",
    padding: "40px",
    width: "100%",
    maxWidth: "440px",
    boxShadow:
      "0 0 40px rgba(0, 212, 255, 0.15), inset 0 0 60px rgba(0, 212, 255, 0.03)",
    position: "relative",
    zIndex: 2,
    backdropFilter: "blur(10px)",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "26px",
    color: "#00d4ff",
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    letterSpacing: "3px",
    animation: "glow-cyan 3s infinite",
  },
title2: {
  margin: "4px 0 0 0",
  fontSize: "20px",
  color: "#00d4ff",
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 900,
  letterSpacing: "4px",
  animation: "glow-cyan 3s infinite",
},
  subtitle: {
    margin: "8px 0 0 0",
    color: "#64748b",
    fontSize: "12px",
    letterSpacing: "2px",
  },
  terminal: {
    padding: "10px 14px",
    background: "rgba(0, 212, 255, 0.05)",
    border: "1px solid #00d4ff30",
    borderRadius: "3px",
    fontSize: "12px",
    color: "#00d4ff",
    marginBottom: "20px",
    letterSpacing: "1px",
  },
  prompt: {
    color: "#00ff88",
    marginRight: "8px",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    color: "#00d4ff",
    letterSpacing: "2px",
    fontWeight: "bold",
  },
  input: {
    padding: "12px 14px",
    fontSize: "14px",
    background: "rgba(10, 14, 26, 0.8)",
    border: "1px solid #00d4ff40",
    borderRadius: "3px",
    color: "#e2e8f0",
    outline: "none",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.2s",
  },
  button: {
    padding: "14px",
    fontSize: "14px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
    color: "#0a0e1a",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: "2px",
    marginTop: "8px",
    boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)",
  },
  message: {
    marginTop: "16px",
    padding: "12px 14px",
    background: "rgba(10, 14, 26, 0.8)",
    borderRadius: "3px",
    fontSize: "13px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  hints: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "10px",
    color: "#64748b",
    letterSpacing: "1px",
  },
  hint: {
    color: "#64748b",
  },
  linkBtn: {
    marginTop: "16px",
    padding: "10px",
    width: "100%",
    background: "transparent",
    border: "1px solid #00d4ff",
    color: "#00d4ff",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "2px",
  },
};

export default Login;