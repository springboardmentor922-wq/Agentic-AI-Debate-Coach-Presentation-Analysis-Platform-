from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import engine, Base
import app.database.models

from app.routers import user, session, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(session.router)
app.include_router(dashboard.router)


@app.get("/")
def home():
    return {"message": "Welcome to AI Debate Coach Backend"}