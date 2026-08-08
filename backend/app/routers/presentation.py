from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

from backend.app.database.db import get_db
from backend.app.models.models import User, SpeechAnalysis, Profile
from backend.app.schemas.schemas import SpeechAnalysisCreate, SpeechAnalysisResponse
from backend.app.routers.auth import get_current_user
from backend.app.services.speech import analyze_speech_delivery
from backend.app.services.export import generate_speech_pdf, generate_speech_excel

router = APIRouter(prefix="/presentation", tags=["Presentation Analytics"])

@router.post("/analyze", response_model=SpeechAnalysisResponse)
def analyze_presentation(
    speech_in: SpeechAnalysisCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Run delivery analysis engine
    analysis = analyze_speech_delivery(speech_in.transcript, speech_in.duration)
    
    # Override client scores if provided (e.g., frontend volume stability metrics)
    if speech_in.confidence_score is not None:
        analysis["confidence_score"] = round((analysis["confidence_score"] + speech_in.confidence_score) / 2.0, 1)
        # Recalculate overall score with updated confidence
        analysis["overall_score"] = round(
            ((analysis["pace"] * 0.3 if 130 <= analysis["pace"] <= 160 else 70 * 0.3) + 
             (analysis["confidence_score"] * 0.3) + 
             (analysis["clarity_score"] * 0.4)) - (len(analysis["fallacies_json"]) * 10),
            1
        )
        analysis["overall_score"] = max(10.0, min(100.0, analysis["overall_score"]))

    # 2. Save Speech Analysis to database
    db_speech = SpeechAnalysis(
        user_id=current_user.id,
        title=speech_in.title,
        duration=analysis["duration"],
        transcript=speech_in.transcript,
        pace=analysis["pace"],
        filler_word_count=analysis["filler_word_count"],
        clarity_score=analysis["clarity_score"],
        confidence_score=analysis["confidence_score"],
        fallacies_json=analysis["fallacies_json"],
        overall_score=analysis["overall_score"]
    )
    db.add(db_speech)
    db.commit()
    db.refresh(db_speech)
    
    # 3. Update profile metrics
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile and profile.skills_json:
        skills = dict(profile.skills_json)
        # Update speaking skills
        skills["speech_pace"] = round((skills.get("speech_pace", 50.0) * 0.7) + (analysis["pace"] * 0.3 if 130 <= analysis["pace"] <= 160 else 70 * 0.3), 1)
        skills["confidence"] = round((skills.get("confidence", 50.0) * 0.7) + (analysis["confidence_score"] * 0.3), 1)
        profile.skills_json = skills
        db.commit()
        
    return db_speech

@router.get("/history", response_model=List[SpeechAnalysisResponse])
def get_presentation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SpeechAnalysis).filter(
        SpeechAnalysis.user_id == current_user.id
    ).order_by(SpeechAnalysis.created_at.desc()).all()

@router.get("/history/{analysis_id}", response_model=SpeechAnalysisResponse)
def get_presentation_details(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(SpeechAnalysis).filter(
        SpeechAnalysis.id == analysis_id,
        SpeechAnalysis.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Speech analysis report not found.")
    return analysis

@router.get("/history/{analysis_id}/pdf")
def export_pdf(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(SpeechAnalysis).filter(
        SpeechAnalysis.id == analysis_id,
        SpeechAnalysis.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Speech analysis report not found.")
        
    # Standard DB structure to dictionary conversion
    analysis_dict = {
        "title": analysis.title,
        "duration": analysis.duration,
        "transcript": analysis.transcript,
        "pace": analysis.pace,
        "filler_word_count": analysis.filler_word_count,
        "clarity_score": analysis.clarity_score,
        "confidence_score": analysis.confidence_score,
        "fallacies_json": analysis.fallacies_json,
        "overall_score": analysis.overall_score,
        "created_at": analysis.created_at
    }
    
    pdf_buffer = generate_speech_pdf(analysis_dict, current_user.email)
    
    filename = f"speech_report_{analysis_id}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/excel")
def export_excel(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = db.query(SpeechAnalysis).filter(
        SpeechAnalysis.user_id == current_user.id
    ).order_by(SpeechAnalysis.created_at.asc()).all()
    
    if not analyses:
        raise HTTPException(status_code=400, detail="No speech history available to export.")
        
    analyses_list = []
    for a in analyses:
        analyses_list.append({
            "title": a.title,
            "duration": a.duration,
            "transcript": a.transcript,
            "pace": a.pace,
            "filler_word_count": a.filler_word_count,
            "clarity_score": a.clarity_score,
            "confidence_score": a.confidence_score,
            "fallacies_json": a.fallacies_json,
            "overall_score": a.overall_score,
            "created_at": a.created_at
        })
        
    excel_buffer = generate_speech_excel(analyses_list)
    
    filename = "speech_analytics_summary.xlsx"
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
