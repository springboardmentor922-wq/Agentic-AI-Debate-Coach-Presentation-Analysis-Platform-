from fastapi import FastAPI

import models.role
import models.user

from routers.auth import router as auth_router
from routers.dashboard import router as dashboard_router
app = FastAPI()


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
app.include_router(dashboard_router)