from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.role import Role
from app.schemas.role import RoleCreate
from app.auth.dependencies import get_current_admin

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_role(
    role: RoleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    existing = db.query(Role).filter(
        Role.name == role.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Role already exists."
        )

    new_role = Role(**role.model_dump())

    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    return new_role


@router.get("/")
def get_roles(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    return db.query(Role).all()