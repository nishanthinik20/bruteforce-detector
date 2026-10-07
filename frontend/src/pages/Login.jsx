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
      setMessage("Error: " + err.message);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔐 Secure Login</h1>
        <p style={styles.subtitle}>Brute-Force Detection Test Target</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Trying..." : "Login"}
          </button>
        </form>

        {message && (
          <div style={{
            ...styles.message,
            background: status === "success" ? "#d4edda" :
                        status === "blocked" ? "#f8d7da" : "#fff3cd",
            color: status === "success" ? "#155724" :
                   status === "blocked" ? "#721c24" : "#856404",
          }}>
            {message}
          </div>
        )}

        <p style={styles.hint}>
          💡 Try wrong password 5 times → IP will be banned!
        </p>

        <button onClick={() => navigate("/dashboard")} style={styles.linkBtn}>
          → Go to Dashboard
        </button>
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
    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "20px",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    margin: "0 0 8px 0",
    textAlign: "center",
    color: "#1e3c72",
    fontSize: "28px",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "24px",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    outline: "none",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    background: "#1e3c72",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  message: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
  },
  hint: {
    marginTop: "20px",
    textAlign: "center",
    color: "#666",
    fontSize: "12px",
  },
  linkBtn: {
    marginTop: "16px",
    padding: "10px",
    width: "100%",
    background: "transparent",
    border: "2px solid #1e3c72",
    color: "#1e3c72",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default Login;