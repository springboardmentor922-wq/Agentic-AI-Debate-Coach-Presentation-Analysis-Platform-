from fastapi import FastAPI

app = FastAPI(
    title="Agentic AI Debate Coach API",
    description="Backend API for Agentic AI Debate Coach & Presentation Analysis Platform",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "Welcome to Agentic AI Debate Coach API"
    }

@app.get("/health")
def health_check():
    return {
        "status": "Healthy"
    }