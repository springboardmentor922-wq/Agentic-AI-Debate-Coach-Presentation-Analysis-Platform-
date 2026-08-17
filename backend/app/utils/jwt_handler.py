from datetime import datetime, timedelta
from jose import jwt

from app.config.config import SECRET_KEY, ALGORITHM

from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.utils.oauth2 import oauth2_scheme
from fastapi import Depends

from sqlalchemy.orm import Session
from app.models.user import User
from app.database.database import get_db
from jose import ExpiredSignatureError

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(hours=12)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt





def verify_access_token(token: str):

    print("\n========== TOKEN RECEIVED ==========")
    print(token)

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("\n========== PAYLOAD ==========")
        print(payload)

        email = payload.get("sub")

        role = payload.get("role")

        print("Email :", email)
        print("Role :", role)

        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid Token"
            )

        return payload

    except ExpiredSignatureError:

        print("\nTOKEN EXPIRED!")

        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )

    except JWTError as e:

        print("\nJWT ERROR")
        print(e)

        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )
    


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_access_token(token)

    email = payload.get("sub")

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user