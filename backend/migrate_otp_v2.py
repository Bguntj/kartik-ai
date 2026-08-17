import sqlite3
import os

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DB_PATH = os.path.join(
    BASE_DIR,
    "chat.db"
)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

columns = [
    ("otp_purpose", "TEXT"),
    ("otp_last_sent_at", "TEXT"),
]

for column_name, column_type in columns:

    try:

        cursor.execute(
            f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"
        )

        print(f"✅ Added: {column_name}")

    except sqlite3.OperationalError as e:

        if "duplicate column name" in str(e).lower():

            print(f"ℹ️ Already exists: {column_name}")

        else:

            raise

conn.commit()
conn.close()

print("✅ OTP v2 migration completed.")