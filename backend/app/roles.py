from fastapi import Depends, HTTPException

from app.dependencies import get_current_user


def require_roles(*allowed_roles):

    def role_checker(current_user=Depends(get_current_user)):

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this resource."
            )

        return current_user

    return role_checker