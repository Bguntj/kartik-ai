import { useEffect, useState } from "react";
import API from "../../services/api";
import ForgotPassword from "./ForgotPassword";


export default function Login({
    onLogin,
    onSwitch
}) {

    // ==========================================
    // Login State
    // ==========================================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] = useState("");

    const [loading, setLoading] =
        useState(false);


    // ==========================================
    // OTP State
    // ==========================================

    const [otpStep, setOtpStep] =
        useState(false);

    const [otp, setOtp] =
        useState("");

    const [resendCooldown, setResendCooldown] =
        useState(0);


    // ==========================================
    // Forgot Password
    // ==========================================

    const [showForgotPassword, setShowForgotPassword] =
        useState(false);


    // ==========================================
    // Resend Countdown
    // ==========================================

    useEffect(() => {

        if (resendCooldown <= 0) {
            return;
        }

        const timer = setInterval(() => {

            setResendCooldown(
                (prev) => prev - 1
            );

        }, 1000);


        return () => {
            clearInterval(timer);
        };

    }, [resendCooldown]);


    // ==========================================
    // Login
    // ==========================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);


        try {

            const response =
                await API.post(
                    "/auth/login",
                    {
                        email: email.trim(),
                        password
                    }
                );


            // ==========================================
            // OTP Required
            // ==========================================

            if (response.data.requires_otp) {

                setOtpStep(true);

                setResendCooldown(60);

                setOtp("");

                return;
            }


            // ==========================================
            // Fallback
            // ==========================================

            const token =
                response.data.access_token;


            if (!token) {

                throw new Error(
                    "Login token was not received."
                );

            }


            localStorage.setItem(
                "access_token",
                token
            );


            onLogin(token);

        } catch (err) {

            console.error(
                "❌ Login Error:",
                err
            );


            setError(
                err.response?.data?.detail ||
                "Login failed. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // Verify OTP
    // ==========================================

    const handleVerifyOTP = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);


        if (otp.length !== 6) {

            setError(
                "Please enter the 6-digit code."
            );

            setLoading(false);

            return;
        }


        try {

            const response =
                await API.post(
                    "/auth/verify-otp",
                    null,
                    {
                        params: {
                            email:
                                email.trim(),

                            otp:
                                otp.trim()
                        }
                    }
                );


            const token =
                response.data.access_token;


            if (!token) {

                throw new Error(
                    "Login token was not received."
                );

            }


            localStorage.setItem(
                "access_token",
                token
            );


            onLogin(token);

        } catch (err) {

            console.error(
                "❌ OTP Verification Error:",
                err
            );


            setError(
                err.response?.data?.detail ||
                "Invalid verification code."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // Resend OTP
    // ==========================================

    const handleResendOTP = async () => {

        if (resendCooldown > 0) {
            return;
        }


        setError("");
        setLoading(true);


        try {

            await API.post(
                "/auth/resend-otp",
                {
                    email:
                        email.trim(),

                    password
                }
            );


            setOtp("");

            setResendCooldown(60);


        } catch (err) {

            console.error(
                "❌ Resend OTP Error:",
                err
            );


            setError(
                err.response?.data?.detail ||
                "Unable to resend OTP."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // Forgot Password Screen
    // ==========================================

    if (showForgotPassword) {

        return (
            <ForgotPassword
                onBack={() =>
                    setShowForgotPassword(false)
                }
            />
        );
    }


    // ==========================================
    // OTP Screen
    // ==========================================

    if (otpStep) {

        return (

            <div className="auth-page">

                {/* Glow */}

                <div
                    className="
                        auth-glow
                        auth-glow-one
                    "
                />

                <div
                    className="
                        auth-glow
                        auth-glow-two
                    "
                />


                <div className="auth-card">

                    {/* Logo */}

                    <div className="auth-logo">

                        <div
                            className="
                                auth-logo-icon
                            "
                        >
                            🔐
                        </div>

                    </div>


                    {/* Heading */}

                    <div className="auth-heading">

                        <h1>
                            Check your email
                        </h1>

                        <p>

                            We sent a 6-digit
                            verification code to

                            <br />

                            <strong>
                                {email}
                            </strong>

                        </p>

                    </div>


                    {/* OTP Form */}

                    <form
                        onSubmit={
                            handleVerifyOTP
                        }
                    >

                        <div
                            className="
                                auth-field
                            "
                        >

                            <label>
                                Verification Code
                            </label>


                            <div
                                className="
                                    auth-input-wrapper
                                "
                            >

                                <span
                                    className="
                                        auth-input-icon
                                    "
                                >
                                    🔢
                                </span>


                                <input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  maxLength={6}
  placeholder="Enter 6-digit code"
  value={otp}
  onChange={(e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
  }}
/>

                            </div>

                        </div>


                        {/* Error */}

                        {error && (

                            <div
                                className="
                                    auth-error
                                "
                            >

                                <span>
                                    ⚠
                                </span>

                                {error}

                            </div>

                        )}


                        {/* Verify */}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={
                                loading ||
                                otp.length !== 6
                            }
                        >

                            {loading ? (

                                <>
                                    <span
                                        className="
                                            auth-spinner
                                        "
                                    />

                                    Verifying...

                                </>

                            ) : (

                                <>
                                    Verify & Login

                                    <span
                                        className="
                                            login-arrow
                                        "
                                    >
                                        →
                                    </span>
                                </>

                            )}

                        </button>


                    </form>


                    {/* Resend */}

                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px"
                        }}
                    >

                        <button
                            type="button"
                            className="
                                forgot-password
                            "
                            onClick={
                                handleResendOTP
                            }
                            disabled={
                                resendCooldown > 0 ||
                                loading
                            }
                        >

                            {resendCooldown > 0

                                ? `Resend code in ${resendCooldown}s`

                                : "Resend OTP"
                            }

                        </button>

                    </div>


                    {/* Back */}

                    <button
                        type="button"
                        className="auth-register"
                        onClick={() => {

                            setOtpStep(false);

                            setOtp("");

                            setError("");

                        }}
                    >
                        ← Back to Login
                    </button>


                    <p className="auth-footer">

                        The verification code
                        expires in 5 minutes.

                    </p>

                </div>

            </div>

        );
    }


    // ==========================================
    // Normal Login Screen
    // ==========================================

    return (

        <div className="auth-page">

            {/* Glow effects */}

            <div
                className="
                    auth-glow
                    auth-glow-one
                "
            />

            <div
                className="
                    auth-glow
                    auth-glow-two
                "
            />


            <div className="auth-card">

                {/* Logo */}

                <div className="auth-logo">

                    <div
                        className="
                            auth-logo-icon
                        "
                    >
                        ✦
                    </div>

                </div>


                {/* Heading */}

                <div className="auth-heading">

                    <h1>
                        Welcome back
                    </h1>

                    <p>

                        Sign in to continue to

                        {" "}

                        <strong>
                            Kartik AI
                        </strong>

                    </p>

                </div>


                {/* Login Form */}

                <form
                    onSubmit={handleLogin}
                >

                    {/* Email */}

                    <div
                        className="
                            auth-field
                        "
                    >

                        <label>
                            Email
                        </label>


                        <div
                            className="
                                auth-input-wrapper
                            "
                        >

                            <span
                                className="
                                    auth-input-icon
                                "
                            >
                                ✉
                            </span>


                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                autoComplete="email"
                                required
                            />

                        </div>

                    </div>


                    {/* Password */}

                    <div
                        className="
                            auth-field
                        "
                    >

                        <div
                            className="
                                auth-label-row
                            "
                        >

                            <label>
                                Password
                            </label>


                            <button
                                type="button"
                                className="
                                    forgot-password
                                "
                                onClick={() =>
                                    setShowForgotPassword(
                                        true
                                    )
                                }
                            >
                                Forgot password?
                            </button>

                        </div>


                        <div
                            className="
                                auth-input-wrapper
                            "
                        >

                            <span
                                className="
                                    auth-input-icon
                                "
                            >
                                🔒
                            </span>


                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="current-password"
                                required
                            />


                            <button
                                type="button"
                                className="
                                    password-toggle
                                "
                                onClick={() =>
                                    setShowPassword(
                                        (prev) =>
                                            !prev
                                    )
                                }
                            >

                                {showPassword
                                    ? "🙈"
                                    : "👁"
                                }

                            </button>

                        </div>

                    </div>


                    {/* Error */}

                    {error && (

                        <div
                            className="
                                auth-error
                            "
                        >

                            <span>
                                ⚠
                            </span>

                            {error}

                        </div>

                    )}


                    {/* Login Button */}

                    <button
                        type="submit"
                        className="
                            auth-submit
                        "
                        disabled={loading}
                    >

                        {loading ? (

                            <>
                                <span
                                    className="
                                        auth-spinner
                                    "
                                />

                                Signing in...
                            </>

                        ) : (

                            <>
                                Sign in

                                <span
                                    className="
                                        login-arrow
                                    "
                                >
                                    →
                                </span>
                            </>

                        )}

                    </button>

                </form>


                {/* Register Divider */}

                <div
                    className="
                        auth-divider
                    "
                >
                    <span>
                        New to Kartik AI?
                    </span>
                </div>


                {/* Register */}

                <button
                    type="button"
                    className="
                        auth-register
                    "
                    onClick={onSwitch}
                >
                    Create an account
                </button>


                {/* Footer */}

                <p
                    className="
                        auth-footer
                    "
                >
                    Your conversations are
                    private and secure.
                </p>

            </div>

        </div>
    );
}