from pydantic import BaseModel, EmailStr


# ==========================================
# Register
# ==========================================

class RegisterRequest(BaseModel):

    username: str
    email: EmailStr
    password: str


# ==========================================
# Login
# ==========================================

class LoginRequest(BaseModel):

    email: EmailStr
    password: str


# ==========================================
# OTP Verification
# ==========================================

class VerifyOTPRequest(BaseModel):

    email: EmailStr
    otp: str


# ==========================================
# Resend OTP
# ==========================================

class ResendOTPRequest(BaseModel):

    email: EmailStr


# ==========================================
# Authentication Response
# ==========================================

class AuthResponse(BaseModel):

    access_token: str
    token_type: str = "bearer"


# ==========================================
# OTP Sent Response
# ==========================================

class OTPResponse(BaseModel):

    message: str


# ==========================================
# Current User
# ==========================================

class UserResponse(BaseModel):

    id: int
    username: str
    email: EmailStr
from pydantic import BaseModel, EmailStr


class ResendOTPRequest(BaseModel):

    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):

    email: EmailStr


class ResetPasswordRequest(BaseModel):

    email: EmailStr
    otp: str
    new_password: str