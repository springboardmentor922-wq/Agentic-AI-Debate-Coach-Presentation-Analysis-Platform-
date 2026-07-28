from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud
from ..security import create_access_token, verify_password

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

    if user.role == "Administrator":
        raise HTTPException(
            status_code=403,
            detail="Administrator accounts cannot be created through signup."
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

@router.post("/admin-login")
def admin_login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if db_user.role != "Administrator":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {"sub": db_user.email}
    )

    return {
        "access_token": token,
        "role": db_user.role
    }