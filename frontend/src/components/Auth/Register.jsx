import { useState } from "react";
import API from "../../services/api";

export default function Register({ onRegister, onSwitch }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password: password,
      });

      const token = response.data.access_token;

      localStorage.setItem("access_token", token);

      onRegister(token);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>Kartik AI</h1>

        <p>Create your account</p>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>

        <p>
          Already have an account?{" "}
          <button
            type="button"
            className="auth-link"
            onClick={onSwitch}
          >
            Login
          </button>
        </p>

      </div>
    </div>
  );
}