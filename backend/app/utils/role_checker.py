from fastapi import Depends, HTTPException, status

from app.models.user import User
from app.utils.jwt_handler import get_current_user


class RoleChecker:

    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)):

        if current_user.role not in self.allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action."
            )

        return current_user