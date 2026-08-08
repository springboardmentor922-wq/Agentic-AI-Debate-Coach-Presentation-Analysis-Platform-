import io
import json
import pandas as pd
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_speech_pdf(analysis: Dict[str, Any], email: str) -> io.BytesIO:
    """
    Generates a beautifully structured PDF report for a speech presentation rehearsal.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0F172A'), # Slate 900
        spaceAfter=15
    )
    
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#38BDF8'), # Sky 400
        spaceBefore=12,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'), # Slate 700
        spaceAfter=6
    )

    bold_body_style = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []
    
    # Header
    story.append(Paragraph("AI Debate Coach & Presentation Analyzer", title_style))
    story.append(Paragraph(f"<b>Speech Report:</b> {analysis.get('title', 'Speech Rehearsal')}", body_style))
    story.append(Paragraph(f"<b>User Email:</b> {email}", body_style))
    story.append(Paragraph(f"<b>Rehearsed On:</b> {datetime_to_string(analysis.get('created_at'))}", body_style))
    story.append(Spacer(1, 15))
    
    # Overview Score Card Table
    story.append(Paragraph("Performance Metrics", section_style))
    
    data = [
        [Paragraph("Metric", bold_body_style), Paragraph("Score / Value", bold_body_style), Paragraph("Status", bold_body_style)],
        [
            Paragraph("Overall Score", body_style), 
            Paragraph(f"{analysis.get('overall_score', 0)} / 100", bold_body_style),
            Paragraph("Excellent" if analysis.get('overall_score', 0) >= 80 else "Good" if analysis.get('overall_score', 0) >= 60 else "Needs Practice", body_style)
        ],
        [
            Paragraph("Clarity Score", body_style), 
            Paragraph(f"{analysis.get('clarity_score', 0)} / 100", body_style),
            Paragraph("Clear vocabulary & structure" if analysis.get('clarity_score', 0) >= 75 else "Moderate structure", body_style)
        ],
        [
            Paragraph("Confidence Score", body_style), 
            Paragraph(f"{analysis.get('confidence_score', 0)} / 100", body_style),
            Paragraph("Highly confident" if analysis.get('confidence_score', 0) >= 75 else "Improve pace stability", body_style)
        ],
        [
            Paragraph("Pace (WPM)", body_style), 
            Paragraph(f"{analysis.get('pace', 0)} WPM", body_style),
            Paragraph("Optimal (130-160 WPM)" if 130 <= analysis.get('pace', 0) <= 160 else "Too Slow" if analysis.get('pace', 0) < 130 else "Too Fast", body_style)
        ],
        [
            Paragraph("Filler Words", body_style), 
            Paragraph(f"{sum(analysis.get('filler_word_count', {}).values())} fillers used", body_style),
            Paragraph("Minimize filler usage" if sum(analysis.get('filler_word_count', {}).values()) > 5 else "Minimal", body_style)
        ]
    ]
    
    t = Table(data, colWidths=[150, 120, 240])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F8FAFC')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(t)
    story.append(Spacer(1, 15))
    
    # Fallacies
    story.append(Paragraph("Logical Fallacies Detected", section_style))
    fallacies = analysis.get('fallacies_json', [])
    if not fallacies:
        story.append(Paragraph("Fantastic job! No logical fallacies were detected in your speech.", body_style))
    else:
        for f in fallacies:
            story.append(Paragraph(f"• <b>{f['fallacy']}</b> (Found matching text: \"<i>{f['occurrences'][0]['match']}</i>\")", bold_body_style))
            story.append(Paragraph(f"  Explanation: {f['explanation']}", body_style))
            story.append(Paragraph(f"  Coaching Tip: {f['correction']}", body_style))
            story.append(Spacer(1, 5))
            
    story.append(Spacer(1, 15))
    
    # Transcript Snippet
    story.append(Paragraph("Speech Transcript", section_style))
    story.append(Paragraph(analysis.get('transcript', ''), body_style))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

def generate_speech_excel(analyses: List[Dict[str, Any]]) -> io.BytesIO:
    """
    Generates an Excel sheet summarizing multiple speech rehearsal attempts.
    """
    buffer = io.BytesIO()
    
    data_list = []
    for idx, a in enumerate(analyses):
        # Flatten filler counts
        fillers = sum(a.get('filler_word_count', {}).values())
        
        data_list.append({
            "Attempt": idx + 1,
            "Title": a.get('title', 'Speech'),
            "Pace (WPM)": a.get('pace', 0),
            "Duration (s)": a.get('duration', 0.0),
            "Filler Word Count": fillers,
            "Clarity Score": a.get('clarity_score', 0.0),
            "Confidence Score": a.get('confidence_score', 0.0),
            "Overall Score": a.get('overall_score', 0.0),
            "Fallacies Found": len(a.get('fallacies_json', []))
        })
        
    df = pd.DataFrame(data_list)
    
    # Write to Excel in memory
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Speech Performance Tracker")
        
    buffer.seek(0)
    return buffer

def datetime_to_string(dt) -> str:
    if isinstance(dt, str):
        return dt
    if hasattr(dt, 'strftime'):
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    return "N/A"
