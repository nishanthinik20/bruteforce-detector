import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStats, getDevices, getBlocked, getAlerts, getAttempts } from "../api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [s, d, b, a, at] = await Promise.all([
        getStats(),
        getDevices(),
        getBlocked(),
        getAlerts(),
        getAttempts(20),
      ]);
      setStats(s);
      setDevices(d);
      setBlocked(b);
      setAlerts(a);
      setAttempts(at);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const threatLevel =
    stats && stats.active_bans > 0
      ? "HIGH"
      : stats && stats.failed_attempts > 5
      ? "MEDIUM"
      : "LOW";

  const threatColor =
    threatLevel === "HIGH"
      ? "#ff3366"
      : threatLevel === "MEDIUM"
      ? "#ffaa00"
      : "#00ff88";

  return (
    <div style={styles.container}>
      <div style={styles.grid}></div>

      {/* Top status bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <h1 style={styles.title}>🛡️ THREAT MONITORING</h1>
          <span style={styles.subtitle}>// SECURITY OPERATIONS CENTER</span>
        </div>
        <div style={styles.topRight}>
          <span style={styles.liveDot}></span>
          <span style={styles.liveText}>LIVE</span>
          <span style={styles.time}>{lastUpdate.toLocaleTimeString()}</span>
          <button onClick={() => navigate("/")} style={styles.backBtn}>
            [ ← LOGOUT ]
          </button>
        </div>
      </div>

      {/* Threat level banner */}
      <div
        style={{
          ...styles.threatBanner,
          borderColor: threatColor,
          background: `${threatColor}15`,
        }}
      >
        <span style={styles.threatLabel}>&gt; THREAT LEVEL:</span>
        <span style={{ ...styles.threatValue, color: threatColor }}>
          {threatLevel}
        </span>
        {threatLevel === "HIGH" && (
          <span style={styles.threatAlert}>🚨 ACTIVE ATTACK DETECTED</span>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div style={styles.statsGrid}>
          <StatCard label="TOTAL ATTEMPTS" value={stats.total_attempts} color="#00d4ff" />
          <StatCard label="FAILED ATTEMPTS" value={stats.failed_attempts} color="#ff3366" />
          <StatCard label="UNIQUE IPs" value={stats.unique_ips} color="#ffaa00" />
          <StatCard label="ACTIVE BANS" value={stats.active_bans} color="#ff3366" pulse={stats.active_bans > 0} />
          <StatCard label="DEVICES" value={stats.total_devices} color="#00ff88" />
          <StatCard label="ALERTS" value={stats.total_alerts} color="#a855f7" />
        </div>
      )}

      {/* Row 1 — Blocked IPs + Devices */}
      <div style={styles.row}>
        <Panel title="🚫 BLOCKED IPs" count={blocked.length} accent="#ff3366">
          {blocked.length === 0 ? (
            <p style={styles.empty}>&gt; No blocked IPs</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>&gt; IP</th>
                  <th style={styles.th}>&gt; REASON</th>
                  <th style={styles.th}>&gt; STATUS</th>
                </tr>
              </thead>
              <tbody>
                {blocked.map((b) => (
                  <tr key={b.id}>
                    <td style={styles.td}>
                      <code>{b.ip_address}</code>
                    </td>
                    <td style={styles.td}>{b.reason}</td>
                    <td style={styles.td}>
                      <span style={b.active ? styles.badgeRed : styles.badgeGray}>
                        {b.active ? "BANNED" : "EXPIRED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="💻 CONNECTED DEVICES" count={devices.length} accent="#00ff88">
          {devices.length === 0 ? (
            <p style={styles.empty}>&gt; No devices registered</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>&gt; DEVICE ID</th>
                  <th style={styles.th}>&gt; OS</th>
                  <th style={styles.th}>&gt; IP</th>
                  <th style={styles.th}>&gt; STATUS</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.id}>
                    <td style={styles.td}>
                      <code>{d.device_id}</code>
                    </td>
                    <td style={styles.td}>{d.os}</td>
                    <td style={styles.td}>{d.ip_address}</td>
                    <td style={styles.td}>
                      <span style={styles.badgeGreen}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      {/* Row 2 — Alerts + Attempts */}
      <div style={styles.row}>
        <Panel title="🚨 ALERTS" count={alerts.length} accent="#ff3366">
          {alerts.length === 0 ? (
            <p style={styles.empty}>&gt; No alerts</p>
          ) : (
            <div style={styles.scrollList}>
              {alerts.map((a) => (
                <div key={a.id} style={styles.alertItem}>
                  <div style={styles.alertHeader}>
                    <span style={styles.badgeRed}>{a.alert_type}</span>
                    <span style={styles.alertTime}>
                      {new Date(a.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={styles.alertMsg}>&gt; {a.message}</p>
                  <p style={styles.alertMeta}>
                    IP: <code>{a.source_ip}</code>
                    {a.device_id && (
                      <>
                        {" "}
                        | Device: <code>{a.device_id}</code>
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="📊 RECENT ATTEMPTS" count={attempts.length} accent="#00d4ff">
          {attempts.length === 0 ? (
            <p style={styles.empty}>&gt; No attempts</p>
          ) : (
            <div style={styles.scrollList}>
              {attempts.map((at) => (
                <div key={at.id} style={styles.attemptItem}>
                  <span style={at.success ? styles.badgeGreen : styles.badgeRed}>
                    {at.success ? "SUCCESS" : "FAIL"}
                  </span>
                  <span style={styles.attemptUser}>{at.username}</span>
                  <code style={styles.attemptIP}>{at.source_ip}</code>
                  <span style={styles.attemptTime}>
                    {new Date(at.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, pulse }) {
  return (
    <div
      style={{
        ...styles.statCard,
        borderTop: `3px solid ${color}`,
        animation: pulse ? "pulse-red 1.5s infinite" : "none",
      }}
    >
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color, textShadow: `0 0 15px ${color}80` }}>
        {value}
      </p>
    </div>
  );
}

function Panel({ title, count, accent, children }) {
  return (
    <div style={{ ...styles.panel, borderLeft: `3px solid ${accent}` }}>
      <h2 style={{ ...styles.panelTitle, color: accent }}>
        {title} <span style={styles.count}>({count})</span>
      </h2>
      {children}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)",
    backgroundSize: "50px 50px",
    pointerEvents: "none",
    zIndex: 0,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    background: "rgba(15, 23, 42, 0.95)",
    border: "1px solid #00d4ff40",
    borderRadius: "4px",
    marginBottom: "16px",
    position: "relative",
    zIndex: 1,
    flexWrap: "wrap",
    gap: "12px",
  },
  topLeft: {},
  title: {
    margin: 0,
    fontSize: "22px",
    color: "#00d4ff",
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    letterSpacing: "2px",
    animation: "glow-cyan 3s infinite",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "11px",
    letterSpacing: "2px",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00ff88",
    boxShadow: "0 0 10px #00ff88",
    animation: "blink 1.5s infinite",
  },
  liveText: {
    color: "#00ff88",
    fontWeight: "bold",
    fontSize: "12px",
    letterSpacing: "2px",
  },
  time: {
    color: "#64748b",
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  backBtn: {
    padding: "8px 14px",
    background: "transparent",
    color: "#00d4ff",
    border: "1px solid #00d4ff",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "2px",
    fontWeight: "bold",
  },
  threatBanner: {
    padding: "12px 20px",
    border: "1px solid",
    borderRadius: "4px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    position: "relative",
    zIndex: 1,
    fontFamily: "'JetBrains Mono', monospace",
    flexWrap: "wrap",
  },
  threatLabel: {
    color: "#64748b",
    fontSize: "12px",
    letterSpacing: "2px",
  },
  threatValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    fontSize: "18px",
    letterSpacing: "3px",
  },
  threatAlert: {
    marginLeft: "auto",
    color: "#ff3366",
    fontWeight: "bold",
    fontSize: "12px",
    animation: "blink 1s infinite",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
    position: "relative",
    zIndex: 1,
  },
  statCard: {
    background: "rgba(15, 23, 42, 0.95)",
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid #1e293b",
  },
  statLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "10px",
    letterSpacing: "2px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  statValue: {
    margin: "10px 0 0 0",
    fontSize: "32px",
    fontWeight: "bold",
    fontFamily: "'Orbitron', sans-serif",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
    position: "relative",
    zIndex: 1,
  },
  panel: {
    background: "rgba(15, 23, 42, 0.95)",
    padding: "16px 20px",
    borderRadius: "4px",
    border: "1px solid #1e293b",
  },
  panelTitle: {
    margin: "0 0 14px 0",
    fontSize: "13px",
    letterSpacing: "2px",
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 700,
  },
  count: {
    color: "#64748b",
    fontSize: "12px",
  },
  empty: {
    color: "#64748b",
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  th: {
    textAlign: "left",
    padding: "8px",
    color: "#00d4ff",
    borderBottom: "1px solid #1e293b",
    fontSize: "10px",
    letterSpacing: "2px",
    fontWeight: "bold",
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #0f172a",
    color: "#cbd5e1",
  },
  badgeRed: {
    background: "rgba(255, 51, 102, 0.15)",
    color: "#ff3366",
    padding: "3px 8px",
    borderRadius: "3px",
    fontSize: "10px",
    fontWeight: "bold",
    letterSpacing: "1px",
    border: "1px solid #ff336640",
  },
  badgeGreen: {
    background: "rgba(0, 255, 136, 0.15)",
    color: "#00ff88",
    padding: "3px 8px",
    borderRadius: "3px",
    fontSize: "10px",
    fontWeight: "bold",
    letterSpacing: "1px",
    border: "1px solid #00ff8840",
  },
  badgeGray: {
    background: "rgba(100, 116, 139, 0.15)",
    color: "#94a3b8",
    padding: "3px 8px",
    borderRadius: "3px",
    fontSize: "10px",
    border: "1px solid #64748b40",
  },
  scrollList: {
    maxHeight: "320px",
    overflowY: "auto",
    paddingRight: "8px",
  },
  alertItem: {
    padding: "12px",
    marginBottom: "10px",
    background: "rgba(10, 14, 26, 0.8)",
    borderRadius: "3px",
    borderLeft: "3px solid #ff3366",
  },
  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  alertTime: {
    color: "#64748b",
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  alertMsg: {
    margin: "6px 0",
    fontSize: "12px",
    color: "#e2e8f0",
    fontFamily: "'JetBrains Mono', monospace",
  },
  alertMeta: {
    margin: 0,
    fontSize: "10px",
    color: "#64748b",
    fontFamily: "'JetBrains Mono', monospace",
  },
  attemptItem: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #0f172a",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  attemptUser: {
    color: "#e2e8f0",
    minWidth: "70px",
  },
  attemptIP: {
    color: "#ffaa00",
  },
  attemptTime: {
    marginLeft: "auto",
    color: "#64748b",
    fontSize: "10px",
  },
};

export default Dashboard;