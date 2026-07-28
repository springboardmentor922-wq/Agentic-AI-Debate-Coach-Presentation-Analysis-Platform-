from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models

from .routers import users
from .routers import profile
from .routers import debate
from .routers import analysis
from app.routers import chat
from .database import Base, engine, SessionLocal
from . import crud

Base.metadata.create_all(bind=engine)

db = SessionLocal()
crud.create_default_admin(db)
db.close()

app = FastAPI(
    title="AI Debate Coach API",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(profile.router)
app.include_router(debate.router)
app.include_router(analysis.router)
app.include_router(
    chat.router,
    prefix="/chat",
    tags=["Chatbot"],
)
@app.get("/")
def home():
    return {
        "message": "Welcome to AI Debate Coach API"
    }