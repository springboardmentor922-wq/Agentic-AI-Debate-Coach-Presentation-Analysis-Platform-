from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models.debate_history
import models.role
import models.user
from routers.chat import router as chat_router
from routers import coach_dashboard
from routers import educator_dashboard
from routers import learner_dashboard
from routers import admin
from routers.auth import router as auth_router
from routers.debate import router as debate_router
from routers.dashboard import router as dashboard_router

app = FastAPI()
app.include_router(learner_dashboard.router)
app.include_router(coach_dashboard.router)
app.include_router(educator_dashboard.router)
app.include_router(admin.router)
app.include_router(chat_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Welcome to Agentic AI Debate Coach"
    }


@app.get("/about")
def about():
    return {
        "project": "Agentic AI Debate Coach and Presentation Analysis Platform",
        "organization": "Infosys Springboard Virtual Internship",
        "developer": "Neha",
        "version": "1.0"
    }


app.include_router(auth_router)
app.include_router(debate_router)
app.include_router(dashboard_router)