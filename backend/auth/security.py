from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from jose import jwt
from passlib.context import CryptContext


# ==========================================
# JWT Configuration
# ==========================================

SECRET_KEY = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


# ==========================================
# Password Hashing
# ==========================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:

    return pwd_context.hash(
        password
    )


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ==========================================
# OTP Generation
# ==========================================

def generate_otp() -> str:

    return f"{secrets.randbelow(1000000):06d}"


# ==========================================
# OTP Hashing
# ==========================================

def hash_otp(otp: str) -> str:

    return hashlib.sha256(
        otp.encode("utf-8")
    ).hexdigest()


# ==========================================
# OTP Verification
# ==========================================

def verify_otp(
    otp: str,
    otp_hash: str
) -> bool:

    return secrets.compare_digest(
        hash_otp(otp),
        otp_hash
    )


# ==========================================
# OTP Expiry
# ==========================================

def get_otp_expiry():

    return (
        datetime.now(timezone.utc)
        + timedelta(minutes=5)
    )


# ==========================================
# Create JWT Token
# ==========================================

def create_access_token(
    user_id: int
) -> str:

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ==========================================
# Decode JWT Token
# ==========================================

def decode_access_token(
    token: str
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            return None

        return int(user_id)

    except Exception:

        return None