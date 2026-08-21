"""
=========================================================
Password Utility

Provides secure password hashing and verification.

Used By:
- User Registration
- User Login
=========================================================
"""

from passlib.context import CryptContext

# ---------------------------------------------------------
# Password Hashing Configuration
# ---------------------------------------------------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ---------------------------------------------------------
# Hash Password
# ---------------------------------------------------------

def hash_password(password: str) -> str:
    """
    Converts a plain text password into a secure hash.

    Example:
        Input:
            password123

        Output:
            $2b$12$...
    """

    return pwd_context.hash(password)


# ---------------------------------------------------------
# Verify Password
# ---------------------------------------------------------

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """
    Verifies a user's password during login.

    Returns:
        True  -> Password is correct

        False -> Password is incorrect
    """

    return pwd_context.verify(
        plain_password,
        hashed_password
    )