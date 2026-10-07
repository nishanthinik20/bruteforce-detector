import axios from "axios";

// Backend URL
// Local la running-a irundha 127.0.0.1:8000
// Cloud la deploy aana aprom, adhu URL podunga (https://your-app.onrender.com)
const API_URL = import.meta.env.VITE_API_URL || "https://bruteforce-detector-api.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============ ATTACK (Login) ============
export const loginAttempt = async (username, password, agentId = null) => {
  const headers = {};
  if (agentId) headers["X-Agent-ID"] = agentId;
  const res = await api.post("/api/login", { username, password }, { headers });
  return res.data;
};

// ============ DASHBOARD ============
export const getStats = async () => {
  const res = await api.get("/api/dashboard/stats");
  return res.data;
};

export const getDevices = async () => {
  const res = await api.get("/api/dashboard/devices");
  return res.data;
};

export const getAttempts = async (limit = 50) => {
  const res = await api.get(`/api/dashboard/attempts?limit=${limit}`);
  return res.data;
};

export const getBlocked = async () => {
  const res = await api.get("/api/dashboard/blocked");
  return res.data;
};

export const getAlerts = async (limit = 50) => {
  const res = await api.get(`/api/dashboard/alerts?limit=${limit}`);
  return res.data;
};

export default api;