```python
import os
import requests

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
# Brevo Configuration
# ==========================================

BREVO_API_KEY = os.getenv(
    "BREVO_API_KEY"
)

SENDER_EMAIL = os.getenv(
    "SMTP_EMAIL"
)

BREVO_API_URL = (
    "https://api.brevo.com/v3/smtp/email"
)


# ==========================================
# Debug / Startup Information
# ==========================================

print("==========================================")
print("Kartik AI Email Service")
print("==========================================")
print(
    "BREVO API KEY SET:",
    bool(BREVO_API_KEY)
)
print(
    "BREVO API KEY LENGTH:",
    len(BREVO_API_KEY)
    if BREVO_API_KEY
    else 0
)
print(
    "SENDER EMAIL:",
    SENDER_EMAIL
)
print(
    "BREVO API URL:",
    BREVO_API_URL
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

    print("==========================================")
    print("BREVO EMAIL REQUEST")
    print("==========================================")
    print("Recipient:", recipient_email)
    print("Subject:", subject)
    print(
        "API KEY SET:",
        bool(BREVO_API_KEY)
    )
    print(
        "API KEY LENGTH:",
        len(BREVO_API_KEY)
        if BREVO_API_KEY
        else 0
    )
    print(
        "Sender:",
        SENDER_EMAIL
    )
    print(
        "Target URL:",
        BREVO_API_URL
    )

    # ==========================================
    # Validate Configuration
    # ==========================================

    if not BREVO_API_KEY:

        print(
            "❌ BREVO_API_KEY is missing."
        )

        raise RuntimeError(
            "BREVO_API_KEY is not configured."
        )

    if not SENDER_EMAIL:

        print(
            "❌ SMTP_EMAIL is missing."
        )

        raise RuntimeError(
            "SMTP_EMAIL is not configured."
        )


    # ==========================================
    # Prepare Request
    # ==========================================

    payload = {
        "sender": {
            "email": SENDER_EMAIL,
            "name": "Kartik AI"
        },
        "to": [
            {
                "email": recipient_email
            }
        ],
        "subject": subject,
        "textContent": body
    }

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }


    # ==========================================
    # Send Request
    # ==========================================

    print(
        "📡 Sending request to Brevo..."
    )

    try:

        response = requests.post(
            BREVO_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )

    except requests.exceptions.Timeout as e:

        print(
            "❌ BREVO NETWORK ERROR: TIMEOUT"
        )
        print(
            "ERROR:",
            repr(e)
        )

        raise RuntimeError(
            "Brevo connection timed out."
        ) from e

    except requests.exceptions.ConnectionError as e:

        print(
            "❌ BREVO NETWORK ERROR: CONNECTION"
        )
        print(
            "ERROR:",
            repr(e)
        )

        raise RuntimeError(
            f"Unable to connect to Brevo: {str(e)}"
        ) from e

    except requests.exceptions.RequestException as e:

        print(
            "❌ BREVO REQUEST ERROR"
        )
        print(
            "ERROR:",
            repr(e)
        )

        raise RuntimeError(
            f"Brevo request failed: {str(e)}"
        ) from e


    # ==========================================
    # Response Debug
    # ==========================================

    print(
        "BREVO RESPONSE STATUS:",
        response.status_code
    )

    print(
        "BREVO RESPONSE:",
        response.text[:1000]
    )

    print("==========================================")


    # ==========================================
    # Handle Error
    # ==========================================

    if response.status_code >= 400:

        raise RuntimeError(
            f"Brevo email error "
            f"{response.status_code}: "
            f"{response.text}"
        )


    # ==========================================
    # Success
    # ==========================================

    try:

        return response.json()

    except ValueError:

        return {
            "status_code":
                response.status_code,
            "response":
                response.text
        }


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

    return _send_email(
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

If you did not request this,
you can safely ignore this email.

Regards,
Kartik AI
"""

    return _send_email(
        recipient_email=recipient_email,
        subject="Kartik AI Password Reset Code",
        body=body
    )
```

