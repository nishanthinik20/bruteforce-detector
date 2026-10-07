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
    const interval = setInterval(fetchData, 3000); // auto-refresh every 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🛡️ Security Dashboard</h1>
        <div style={styles.headerRight}>
          <span style={styles.live}>● LIVE</span>
          <span style={styles.time}>{lastUpdate.toLocaleTimeString()}</span>
          <button onClick={() => navigate("/")} style={styles.backBtn}>
            ← Back to Login
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div style={styles.statsGrid}>
          <StatCard label="Total Attempts" value={stats.total_attempts} color="#3498db" />
          <StatCard label="Failed Attempts" value={stats.failed_attempts} color="#e74c3c" />
          <StatCard label="Unique IPs" value={stats.unique_ips} color="#f39c12" />
          <StatCard label="Active Bans" value={stats.active_bans} color="#c0392b" />
          <StatCard label="Devices" value={stats.total_devices} color="#27ae60" />
          <StatCard label="Alerts" value={stats.total_alerts} color="#8e44ad" />
        </div>
      )}

      <div style={styles.row}>
        {/* Blocked IPs */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>🚫 Blocked IPs ({blocked.length})</h2>
          {blocked.length === 0 ? (
            <p style={styles.empty}>No blocked IPs</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>IP Address</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Active</th>
                </tr>
              </thead>
              <tbody>
                {blocked.map((b) => (
                  <tr key={b.id}>
                    <td style={styles.td}><code>{b.ip_address}</code></td>
                    <td style={styles.td}>{b.reason}</td>
                    <td style={styles.td}>
                      <span style={b.active ? styles.badgeRed : styles.badgeGray}>
                        {b.active ? "BANNED" : "expired"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Connected Devices */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>💻 Connected Devices ({devices.length})</h2>
          {devices.length === 0 ? (
            <p style={styles.empty}>No devices registered</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Device ID</th>
                  <th style={styles.th}>OS</th>
                  <th style={styles.th}>IP</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.id}>
                    <td style={styles.td}><code>{d.device_id}</code></td>
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
        </div>
      </div>

      <div style={styles.row}>
        {/* Alerts */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>🚨 Alerts ({alerts.length})</h2>
          {alerts.length === 0 ? (
            <p style={styles.empty}>No alerts yet</p>
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
                  <p style={styles.alertMsg}>{a.message}</p>
                  <p style={styles.alertMeta}>
                    IP: <code>{a.source_ip}</code>
                    {a.device_id && <> | Device: <code>{a.device_id}</code></>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>📊 Recent Attempts ({attempts.length})</h2>
          {attempts.length === 0 ? (
            <p style={styles.empty}>No attempts yet</p>
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
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { margin: 0, color: "#38bdf8", fontSize: "28px" },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  live: { color: "#22c55e", fontWeight: "bold", fontSize: "14px" },
  time: { color: "#94a3b8", fontSize: "14px" },
  backBtn: {
    padding: "8px 16px",
    background: "#1e293b",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#1e293b",
    padding: "16px",
    borderRadius: "8px",
  },
  statLabel: { margin: 0, color: "#94a3b8", fontSize: "13px" },
  statValue: { margin: "8px 0 0 0", fontSize: "28px", fontWeight: "bold" },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  panel: {
    background: "#1e293b",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #334155",
  },
  panelTitle: { margin: "0 0 12px 0", color: "#38bdf8", fontSize: "16px" },
  empty: { color: "#64748b", fontStyle: "italic", fontSize: "14px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    textAlign: "left",
    padding: "8px",
    color: "#94a3b8",
    borderBottom: "1px solid #334155",
    fontSize: "12px",
  },
  td: { padding: "8px", borderBottom: "1px solid #1e293b" },
  badgeRed: {
    background: "#7f1d1d",
    color: "#fca5a5",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  badgeGreen: {
    background: "#14532d",
    color: "#86efac",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  badgeGray: {
    background: "#334155",
    color: "#cbd5e1",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
  },
  scrollList: { maxHeight: "300px", overflowY: "auto" },
  alertItem: {
    padding: "10px",
    marginBottom: "8px",
    background: "#0f172a",
    borderRadius: "6px",
    borderLeft: "3px solid #ef4444",
  },
  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  alertTime: { color: "#64748b", fontSize: "11px" },
  alertMsg: { margin: "4px 0", fontSize: "13px", color: "#e2e8f0" },
  alertMeta: { margin: 0, fontSize: "11px", color: "#94a3b8" },
  attemptItem: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #0f172a",
    fontSize: "12px",
  },
  attemptUser: { color: "#e2e8f0", minWidth: "60px" },
  attemptIP: { color: "#f39c12" },
  attemptTime: { marginLeft: "auto", color: "#64748b" },
};

export default Dashboard;