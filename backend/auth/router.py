from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import SessionLocal
from models import User

from auth.schemas import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    ResendOTPRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

from auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

from email_service import (
    send_otp_email,
    send_password_reset_email,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

security = HTTPBearer()


# ==========================================
# OTP Configuration
# ==========================================

OTP_EXPIRY_MINUTES = 5
OTP_RESEND_SECONDS = 60
MAX_OTP_ATTEMPTS = 5


# ==========================================
# OTP Helpers
# ==========================================

def generate_otp():
    return f"{secrets.randbelow(1000000):06d}"


def hash_otp(otp: str):
    return hashlib.sha256(
        otp.encode()
    ).hexdigest()


def set_otp(
    user,
    otp: str,
    purpose: str
):

    now = datetime.now(timezone.utc)

    user.otp_code_hash = hash_otp(otp)

    user.otp_expires_at = (
        now +
        timedelta(
            minutes=OTP_EXPIRY_MINUTES
        )
    ).isoformat()

    user.otp_attempts = 0

    user.otp_purpose = purpose

    user.otp_last_sent_at = now.isoformat()


def check_resend_cooldown(user):

    if not user.otp_last_sent_at:
        return

    try:

        last_sent = datetime.fromisoformat(
            user.otp_last_sent_at
        )

        elapsed = (
            datetime.now(timezone.utc)
            - last_sent
        ).total_seconds()

        if elapsed < OTP_RESEND_SECONDS:

            remaining = max(
                1,
                int(
                    OTP_RESEND_SECONDS
                    - elapsed
                )
            )

            raise HTTPException(
                status_code=429,
                detail=(
                    f"Please wait {remaining} "
                    "seconds before requesting "
                    "another code."
                )
            )

    except ValueError:

        pass


def verify_otp(
    user,
    otp: str,
    purpose: str
):

    # ==========================================
    # Check Purpose
    # ==========================================

    if user.otp_purpose != purpose:

        return False, "Invalid OTP."


    # ==========================================
    # Check OTP Exists
    # ==========================================

    if not user.otp_code_hash:

        return False, "Invalid or expired OTP."


    # ==========================================
    # Check Attempts
    # ==========================================

    if user.otp_attempts >= MAX_OTP_ATTEMPTS:

        return (
            False,
            "Too many incorrect attempts. "
            "Please request a new OTP."
        )


    # ==========================================
    # Check Expiry
    # ==========================================

    if not user.otp_expires_at:

        return False, "OTP has expired."


    try:

        expires_at = datetime.fromisoformat(
            user.otp_expires_at
        )

    except ValueError:

        return False, "Invalid OTP."


    if datetime.now(timezone.utc) > expires_at:

        return False, "OTP has expired."


    # ==========================================
    # Verify OTP
    # ==========================================

    if hash_otp(otp) != user.otp_code_hash:

        user.otp_attempts += 1

        remaining = (
            MAX_OTP_ATTEMPTS
            - user.otp_attempts
        )

        if remaining > 0:

            return (
                False,
                f"Invalid OTP. "
                f"{remaining} attempts remaining."
            )

        return (
            False,
            "Too many incorrect attempts. "
            "Please request a new OTP."
        )


    return True, None


def clear_otp(user):

    user.otp_code_hash = None
    user.otp_expires_at = None
    user.otp_attempts = 0
    user.otp_purpose = None
    user.otp_last_sent_at = None


# ==========================================
# Register
# ==========================================

@router.post(
    "/register",
    response_model=AuthResponse
)
def register(data: RegisterRequest):

    db = SessionLocal()

    try:

        # ==========================================
        # Check Existing Email
        # ==========================================

        existing_user = (
            db.query(User)
            .filter(
                User.email ==
                data.email.lower().strip()
            )
            .first()
        )

        if existing_user:

            raise HTTPException(
                status_code=400,
                detail="Email already registered."
            )


        # ==========================================
        # Validate Password
        # ==========================================

        if len(data.password) < 6:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Password must be at least "
                    "6 characters."
                )
            )


        # ==========================================
        # Create User
        # ==========================================

        user = User(
            username=data.username.strip(),
            email=data.email.lower().strip(),
            password_hash=hash_password(
                data.password
            )
        )

        db.add(user)
        db.commit()
        db.refresh(user)


        # ==========================================
        # Create Token
        # ==========================================

        token = create_access_token(
            user.id
        )

        return AuthResponse(
            access_token=token
        )

    finally:

        db.close()


# ==========================================
# Login - Email + Password
# ==========================================

@router.post("/login")
def login(data: LoginRequest):

    db = SessionLocal()

    try:

        # ==========================================
        # Find User
        # ==========================================

        user = (
            db.query(User)
            .filter(
                User.email ==
                data.email.lower().strip()
            )
            .first()
        )

        if not user:

            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid email or password."
                )
            )


        # ==========================================
        # Verify Password
        # ==========================================

        if not verify_password(
            data.password,
            user.password_hash
        ):

            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid email or password."
                )
            )


        # ==========================================
        # Generate Login OTP
        # ==========================================

        otp = generate_otp()
        print("========== LOGIN OTP DEBUG ==========")
        print("EMAIL:", user.email)
        print("OTP:", otp)
        print("OTP HASH:", hash_otp(otp))
        print("=====================================")

        set_otp(
            user,
            otp,
            "login"
        )

        db.commit()


        # ==========================================
        # Send OTP
        # ==========================================

        try:

            send_otp_email(
                user.email,
                otp
            )

        except Exception as e:

            print(
                "❌ OTP Email Error:",
                e
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Unable to send OTP email."
                )
            )


        # ==========================================
        # Do NOT Login Yet
        # ==========================================

        return {
            "requires_otp": True,
            "message": (
                "Verification code sent "
                "to your email."
            )
        }

    finally:

        db.close()


# ==========================================
# Verify Login OTP
# ==========================================

@router.post("/verify-otp")
def verify_login_otp(
    email: str,
    otp: str
):

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(
                User.email ==
                email.lower().strip()
            )
            .first()
        )

        if not user:

            raise HTTPException(
                status_code=401,
                detail="Invalid verification request."
            )


        valid, error = verify_otp(
            user,
            otp.strip(),
            "login"
        )

        if not valid:

            db.commit()

            raise HTTPException(
                status_code=400,
                detail=error
            )


        # ==========================================
        # OTP Correct
        # ==========================================

        clear_otp(user)

        db.commit()


        # ==========================================
        # Create Access Token
        # ==========================================

        token = create_access_token(
            user.id
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    finally:

        db.close()


# ==========================================
# Resend Login OTP
# ==========================================

@router.post("/resend-otp")
def resend_otp(
    data: ResendOTPRequest
):

    db = SessionLocal()

    try:

        # ==========================================
        # Find User
        # ==========================================

        user = (
            db.query(User)
            .filter(
                User.email ==
                data.email.lower().strip()
            )
            .first()
        )

        if not user:

            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid email or password."
                )
            )


        # ==========================================
        # Verify Password Again
        # ==========================================

        if not verify_password(
            data.password,
            user.password_hash
        ):

            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid email or password."
                )
            )


        # ==========================================
        # Cooldown
        # ==========================================

        check_resend_cooldown(user)


        # ==========================================
        # Generate New OTP
        # ==========================================

        otp = generate_otp()

        set_otp(
            user,
            otp,
            "login"
        )

        db.commit()


        # ==========================================
        # Send Email
        # ==========================================

        try:

            send_otp_email(
                user.email,
                otp
            )

        except Exception as e:

            print(
                "❌ Resend OTP Email Error:",
                e
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Unable to send OTP email."
                )
            )


        return {
            "message": (
                "A new verification code "
                "has been sent."
            )
        }

    finally:

        db.close()


# ==========================================
# Forgot Password
# ==========================================

@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest
):

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(
                User.email ==
                data.email.lower().strip()
            )
            .first()
        )


        # ==========================================
        # Don't Reveal Account Existence
        # ==========================================

        if not user:

            return {
                "message": (
                    "If this email is registered, "
                    "a reset code has been sent."
                )
            }


        # ==========================================
        # Cooldown
        # ==========================================

        check_resend_cooldown(user)


        # ==========================================
        # Generate Reset OTP
        # ==========================================

        otp = generate_otp()

        set_otp(
            user,
            otp,
            "reset_password"
        )

        db.commit()


        # ==========================================
        # Send Reset Email
        # ==========================================

        try:

            send_password_reset_email(
                user.email,
                otp
            )

        except Exception as e:

            print(
                "❌ Password Reset Email Error:",
                e
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Unable to send reset email."
                )
            )


        return {
            "message": (
                "If this email is registered, "
                "a reset code has been sent."
            )
        }

    finally:

        db.close()


# ==========================================
# Reset Password
# ==========================================

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest
):

    # ==========================================
    # Validate Password
    # ==========================================

    if len(data.new_password) < 6:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password must be at least "
                "6 characters."
            )
        )


    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(
                User.email ==
                data.email.lower().strip()
            )
            .first()
        )

        if not user:

            raise HTTPException(
                status_code=400,
                detail="Invalid reset request."
            )


        # ==========================================
        # Verify Reset OTP
        # ==========================================

        valid, error = verify_otp(
            user,
            data.otp.strip(),
            "reset_password"
        )

        if not valid:

            db.commit()

            raise HTTPException(
                status_code=400,
                detail=error
            )


        # ==========================================
        # Change Password
        # ==========================================

        user.password_hash = hash_password(
            data.new_password
        )


        # ==========================================
        # Invalidate OTP
        # ==========================================

        clear_otp(user)

        db.commit()


        return {
            "message": (
                "Password reset successfully."
            )
        }

    finally:

        db.close()


# ==========================================
# Current User
# ==========================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_current_user(
    credentials:
        HTTPAuthorizationCredentials =
        Depends(security)
):

    user_id = decode_access_token(
        credentials.credentials
    )

    if user_id is None:

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid or expired token."
            )
        )


    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(
                User.id == user_id
            )
            .first()
        )

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )


        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email
        )

    finally:

        db.close()  