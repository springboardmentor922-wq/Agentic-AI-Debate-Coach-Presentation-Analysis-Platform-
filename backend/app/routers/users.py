from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud
from ..security import create_access_token

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = crud.get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return crud.create_user(db, user)

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = crud.authenticate_user(
        db,
        user.email,
        user.password
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
    {
        "id": db_user.id,
        "sub": db_user.email,
        "role": db_user.role
    }
)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role,
        "full_name": db_user.full_name
    }