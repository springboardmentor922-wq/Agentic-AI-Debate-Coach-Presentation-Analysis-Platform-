"""
One-time bootstrap script to create the FIRST administrator account.

Why this exists: Debate Coach, Educator, and Administrator accounts can only
be created by an existing administrator (see POST /api/v1/admin/users), and
the public /register page only ever creates Learners. That's a deliberate
chicken-and-egg gap for security — so the very first admin has to be created
directly against the database, once, from the command line.

Usage (from the backend/ folder, with your virtualenv active and .env present):

    python -m app.scripts.create_admin

You'll be prompted for a name, email, and password. After this, sign in at
/admin/login with that email/password, and use the Admin Dashboard's
"Add User" panel to create every other Coach, Educator, and Admin account —
you should not need to run this script again.
"""
import asyncio
import getpass
import sys
from datetime import datetime

sys.path.append(".")

from app.core.database import users_collection  # noqa: E402
from app.core.security import hash_password  # noqa: E402


async def main():
    print("=== AI Debate Coach — Create First Administrator ===\n")

    existing_admin = await users_collection.find_one({"role": "administrator"})
    if existing_admin:
        print(f"An administrator account already exists: {existing_admin.get('email')}")
        print("This script only creates the FIRST admin. To add more Coach, Educator, or")
        print("Administrator accounts, sign in as that admin and use the Admin Dashboard's")
        print('"Add User" panel instead.')
        return

    full_name = input("Full name: ").strip()
    email = input("Email address: ").strip().lower()
    password = getpass.getpass("Password (min 6 characters): ")
    confirm = getpass.getpass("Confirm password: ")

    if not full_name or not email:
        print("Full name and email are required.")
        return
    if len(password) < 6:
        print("Password must be at least 6 characters.")
        return
    if password != confirm:
        print("Passwords do not match.")
        return

    existing = await users_collection.find_one({"email": email})
    if existing:
        print(f"\nA user with email {email} already exists (role: {existing.get('role')}).")
        print("If you want to make them an administrator, update their role directly in MongoDB,")
        print("or use a different email for this new admin account.")
        return

    doc = {
        "full_name": full_name,
        "email": email,
        "password_hash": hash_password(password),
        "role": "administrator",
        "experience_level": None,
        "preferred_debate_topics": [],
        "presentation_domains": [],
        "learning_goals": [],
        "coaching_preferences": None,
        "avatar_url": None,
        "institution": None,
        "department": None,
        "year": None,
        "phone_number": None,
        "bio": None,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    await users_collection.insert_one(doc)
    print(f"\n✅ Administrator account created for {email}.")
    print("   Sign in at /admin/login on your frontend.")


if __name__ == "__main__":
    asyncio.run(main())
