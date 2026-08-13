import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.main import app
from app.db.database import get_db, Base
from app.models.user import User
from app.models.role import Role
from app.utils.password import hash_password
from app.utils.jwt import create_access_token

TEST_DATABASE_URL = "sqlite:///./test_milestone3.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    # Ensure 4 roles exist in test SQLite db
    role_names = ["Learner", "Debate Coach", "Educator", "Administrator"]
    for idx, rname in enumerate(role_names, 1):
        if not db.query(Role).filter(Role.id == idx).first():
            db.add(Role(id=idx, name=rname, description=f"{rname} role"))

    db.commit()

    # Create test users if missing
    def _create_user(email, full_name, role_id):
        u = db.query(User).filter(User.email == email).first()
        if not u:
            u = User(email=email, full_name=full_name, password_hash=hash_password("Password123!"), role_id=role_id, is_active=True)
            db.add(u)
            db.commit()
            db.refresh(u)
        return u

    test_learner = _create_user("learner@test.com", "Test Learner", 1)
    test_coach = _create_user("coach@test.com", "Test Coach", 2)
    test_educator = _create_user("educator@test.com", "Test Educator", 3)
    test_admin = _create_user("admin@test.com", "Test Admin", 4)

    db.close()

    yield

    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_milestone3.db"):
        try:
            os.remove("./test_milestone3.db")
        except Exception:
            pass

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def learner_token():
    return create_access_token({"sub": "learner@test.com", "role": "Learner"})

@pytest.fixture
def coach_token():
    return create_access_token({"sub": "coach@test.com", "role": "Debate Coach"})

@pytest.fixture
def educator_token():
    return create_access_token({"sub": "educator@test.com", "role": "Educator"})

@pytest.fixture
def admin_token():
    return create_access_token({"sub": "admin@test.com", "role": "Administrator"})
