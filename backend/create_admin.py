from app.database import SessionLocal
from app import crud, schemas

db = SessionLocal()

admin = schemas.UserCreate(
    full_name="System Administrator",
    email="admin@debatecoach.com",
    password="Admin@123",
    role="Administrator"
)

existing = crud.get_user_by_email(db, admin.email)

if existing:
    print("Administrator already exists.")
else:
    crud.create_user(db, admin)
    print("Administrator created successfully!")

db.close()