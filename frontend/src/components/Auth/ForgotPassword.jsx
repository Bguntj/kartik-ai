import { useState } from "react";
import API from "../../services/api";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await API.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage("OTP has been sent to your email.");
      setStep(2);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await API.post("/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword,
      });

      setMessage(
        "Password reset successfully. You can now login."
      );

      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Invalid OTP or password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">
            🔐
          </div>
        </div>

        <div className="auth-heading">
          <h1>Forgot password?</h1>

          <p>
            Reset your <strong>Kartik AI</strong> password
          </p>
        </div>

        {step === 1 && (

          <form onSubmit={sendOTP}>

            <div className="auth-field">

              <label>Email</label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ✉
                </span>

                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            {error && (
              <div className="auth-error">
                ⚠ {error}
              </div>
            )}

            {message && (
              <div className="auth-success">
                ✓ {message}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Sending OTP..."
                : "Send OTP →"}
            </button>

          </form>

        )}

        {step === 2 && (

          <form onSubmit={resetPassword}>

            <div className="auth-field">

              <label>Verification Code</label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  🔢
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            <div className="auth-field">

              <label>New Password</label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  🔒
                </span>

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  minLength={6}
                  required
                />

              </div>

            </div>

            {error && (
              <div className="auth-error">
                ⚠ {error}
              </div>
            )}

            {message && (
              <div className="auth-success">
                ✓ {message}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Resetting..."
                : "Reset Password →"}
            </button>

          </form>

        )}

        <button
          type="button"
          className="auth-register"
          onClick={onBack}
        >
          ← Back to Login
        </button>

      </div>

    </div>
  );
}