from fastapi import Depends, HTTPException, status
from utils.auth import verify_token


def require_roles(allowed_roles: list):
    def role_checker(current_user=Depends(verify_token)):
        if current_user["role_id"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource."
            )
        return current_user

    return role_checker