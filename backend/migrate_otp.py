import sqlite3
from database import DATABASE_PATH

conn = sqlite3.connect(DATABASE_PATH)
cursor = conn.cursor()

columns = {
    "otp_code_hash": "TEXT",
    "otp_expires_at": "TEXT",
    "otp_attempts": "INTEGER NOT NULL DEFAULT 0",
}

existing = {
    row[1]
    for row in cursor.execute("PRAGMA table_info(users)").fetchall()
}

for column, definition in columns.items():

    if column not in existing:

        cursor.execute(
            f"ALTER TABLE users ADD COLUMN {column} {definition}"
        )

        print(f"✅ Added: {column}")

    else:

        print(f"ℹ️ Already exists: {column}")

conn.commit()
conn.close()

print("✅ OTP database migration completed.")