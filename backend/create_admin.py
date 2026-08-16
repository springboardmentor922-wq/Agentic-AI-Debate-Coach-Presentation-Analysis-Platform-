"""Create the first administrator without storing credentials in source code.

Run from the backend folder after setting ADMIN_EMAIL and ADMIN_PASSWORD in the
environment. The command refuses to overwrite an existing account.
"""
import os
import sys

from app.database import SessionLocal
from app import crud, schemas


email = os.getenv("ADMIN_EMAIL", "").strip().lower()
password = os.getenv("ADMIN_PASSWORD", "")
full_name = os.getenv("ADMIN_NAME", "System Administrator").strip()

if not email or not password:
    sys.exit("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this command.")

if len(password) < 14:
    sys.exit("ADMIN_PASSWORD must contain at least 14 characters.")

db = SessionLocal()
try:
    if crud.get_user_by_email(db, email):
        sys.exit("An account with this email already exists. Refusing to overwrite it.")

    crud.create_user(
        db,
        schemas.UserCreate(
            full_name=full_name,
            email=email,
            password=password,
            role="Administrator",
        ),
    )
    print("Administrator created. Sign in through /admin/login to enrol MFA.")
finally:
    db.close()
