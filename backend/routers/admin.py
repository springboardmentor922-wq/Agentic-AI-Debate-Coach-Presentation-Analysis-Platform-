from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.role import Role

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):

    users = db.query(User).all()

    result = []

    for user in users:

        role = db.query(Role).filter(
            Role.role_id == user.role_id
        ).first()

        result.append({
            "id": user.user_id,
            "name": user.full_name,
            "email": user.email,
            "role": role.role_name if role else "Unknown"
        })

    return result