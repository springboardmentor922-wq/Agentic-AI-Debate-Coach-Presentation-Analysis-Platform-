from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models
from .routers import users
from .routers import profile
from .routers import debate

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Debate Coach API",
    version="1.0.0"
)

# CORS Configuration
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

@app.get("/")
def home():
    return {
        "message": "Welcome to AI Debate Coach API"
    }