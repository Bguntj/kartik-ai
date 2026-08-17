import os
import smtplib

from email.message import EmailMessage
from dotenv import load_dotenv


# ==========================================
# Load Environment
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

ENV_FILE = os.path.join(
    BASE_DIR,
    ".env"
)

load_dotenv(
    dotenv_path=ENV_FILE,
    override=True
)


# ==========================================
# SMTP Configuration
# ==========================================

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

SMTP_EMAIL = os.getenv("SMTP_EMAIL")

SMTP_PASSWORD = os.getenv(
    "SMTP_APP_PASSWORD"
)


# ==========================================
# Debug
# ==========================================

print("==========================================")
print("Kartik AI Email Service")
print("==========================================")
print("ENV FILE:", ENV_FILE)
print("SMTP EMAIL:", SMTP_EMAIL)
print(
    "SMTP PASSWORD SET:",
    bool(SMTP_PASSWORD)
)
print("==========================================")


# ==========================================
# Generic Email Sender
# ==========================================

def _send_email(
    recipient_email: str,
    subject: str,
    body: str
):

    if not SMTP_EMAIL:
        raise RuntimeError(
            "SMTP_EMAIL is not configured."
        )

    if not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_APP_PASSWORD is not configured."
        )

    message = EmailMessage()

    message["Subject"] = subject
    message["From"] = SMTP_EMAIL
    message["To"] = recipient_email

    message.set_content(body)

    with smtplib.SMTP(
        SMTP_HOST,
        SMTP_PORT
    ) as server:

        server.starttls()

        server.login(
            SMTP_EMAIL,
            SMTP_PASSWORD
        )

        server.send_message(message)


# ==========================================
# Login OTP Email
# ==========================================

def send_otp_email(
    recipient_email: str,
    otp: str
):

    body = f"""
Hello,

Your Kartik AI login verification code is:

{otp}

This code will expire in 5 minutes.

If you did not attempt to log in,
you can safely ignore this email.

Regards,
Kartik AI
"""

    _send_email(
        recipient_email=recipient_email,
        subject="Your Kartik AI Login Code",
        body=body
    )


# ==========================================
# Password Reset OTP Email
# ==========================================

def send_password_reset_email(
    recipient_email: str,
    otp: str
):

    body = f"""
Hello,

We received a request to reset your Kartik AI password.

Your password reset verification code is:

{otp}

This code will expire in 5 minutes.

If you did not request a password reset,
you can safely ignore this email.

Regards,
Kartik AI
"""

    _send_email(
        recipient_email=recipient_email,
        subject="Kartik AI Password Reset Code",
        body=body
    )