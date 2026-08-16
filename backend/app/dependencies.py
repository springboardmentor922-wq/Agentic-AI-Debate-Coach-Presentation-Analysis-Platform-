from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .security import verify_token

security = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials if credentials else request.cookies.get("admin_session")

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )

    if payload.get("token_type") == "admin_mfa_pending":
        raise HTTPException(status_code=401, detail="Complete administrator verification first.")

    return payload


def get_current_admin(current_user=Depends(get_current_user)):
    if current_user.get("role") != "Administrator" or current_user.get("token_type") != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    return current_user
