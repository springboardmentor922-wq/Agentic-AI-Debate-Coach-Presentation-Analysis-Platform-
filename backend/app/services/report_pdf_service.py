"""
Reports Module (Milestone 4) — real PDF generation.

Builds a PDF purely from data already persisted for a completed debate
(debate_feedback_reports_collection, performance_scores_collection,
fallacy_reports_collection). There is no template text or filler content:
if a section has no data, it's omitted rather than padded.
"""
import io
from datetime import datetime, timezone

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def _bullets(items: list[str], style) -> list[Paragraph]:
    return [Paragraph(f"• {item}", style) for item in items]


def build_debate_report_pdf(
    topic: str,
    debate_format: str,
    date: str,
    overall_score: float | None,
    report: dict | None,
    fallacies: list[dict],
    coach_score: float | None = None,
    coach_comments: str | None = None,
    educator_score: float | None = None,
    educator_comments: str | None = None,
    session_id: str | None = None,
    learner_name: str | None = None,
    learner_email: str | None = None,
    coach_name: str | None = None,
    educator_name: str | None = None,
    presentation: dict | None = None,
    audio_link: str | None = None,
) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()
    h1 = styles["Heading1"]
    h2 = styles["Heading2"]
    body = styles["BodyText"]
    small = ParagraphStyle("small", parent=body, fontSize=9, textColor=colors.grey)
    brand_style = ParagraphStyle("brand", parent=body, fontSize=10, textColor=colors.HexColor("#4f46e5"), spaceAfter=2)

    story = [
        Paragraph("AI DEBATE COACH", brand_style),
        Paragraph("Debate & Presentation Report", h1),
        Paragraph(topic, h2),
        Paragraph(f"Format: {debate_format} &nbsp;|&nbsp; Date: {date}" + (f" &nbsp;|&nbsp; Session ID: {session_id}" if session_id else ""), small),
        Spacer(1, 10),
    ]

    # -- Identity block: who this report is about and who reviewed it --
    identity_rows = []
    if learner_name:
        identity_rows.append(["Learner", learner_name + (f" ({learner_email})" if learner_email else "")])
    if coach_name:
        identity_rows.append(["Debate Coach", coach_name])
    if educator_name:
        identity_rows.append(["Educator", educator_name])
    if identity_rows:
        identity_table = Table(identity_rows, colWidths=[1.5 * inch, 5.3 * inch])
        identity_table.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(identity_table)
        story.append(Spacer(1, 10))

    if overall_score is not None or coach_score is not None or educator_score is not None:
        score_rows = [["AI Score", "Coach Score", "Educator Score"]]
        score_rows.append([
            f"{overall_score}/100" if overall_score is not None else "—",
            f"{coach_score}/100" if coach_score is not None else "—",
            f"{educator_score}/100" if educator_score is not None else "—",
        ])
        score_table = Table(score_rows, colWidths=[2.27 * inch, 2.27 * inch, 2.27 * inch])
        score_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        story.append(score_table)
        story.append(Spacer(1, 12))

    if report:
        if report.get("overall_rating") is not None:
            story.append(Paragraph(f"Overall Rating: {report['overall_rating']}/10", h2))
            story.append(Spacer(1, 6))

        sub_score_fields = [
            ("argument_quality", "Argument Quality"),
            ("evidence_usage", "Evidence Usage"),
            ("logical_consistency", "Logical Consistency"),
            ("rebuttal_effectiveness", "Rebuttal Effectiveness"),
            ("communication_skills", "Communication Skills"),
        ]
        if any(report.get(key) is not None for key, _ in sub_score_fields):
            rows = [[label for _, label in sub_score_fields]]
            rows.append([f"{report.get(key, 0)}/10" for key, _ in sub_score_fields])
            sub_table = Table(rows, colWidths=[1.36 * inch] * 5)
            sub_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#374151")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            story.append(sub_table)
            story.append(Spacer(1, 12))

        if report.get("strengths"):
            story.append(Paragraph("Strengths", h2))
            story.extend(_bullets(report["strengths"], body))
            story.append(Spacer(1, 8))
        if report.get("weaknesses"):
            story.append(Paragraph("Weaknesses", h2))
            story.extend(_bullets(report["weaknesses"], body))
            story.append(Spacer(1, 8))
        if report.get("missing_evidence"):
            story.append(Paragraph("Missing Evidence", h2))
            story.extend(_bullets(report["missing_evidence"], body))
            story.append(Spacer(1, 8))
        if report.get("logical_issues"):
            story.append(Paragraph("Logical Issues", h2))
            story.extend(_bullets(report["logical_issues"], body))
            story.append(Spacer(1, 8))
        if report.get("recommended_improvements"):
            story.append(Paragraph("Recommended Improvements", h2))
            story.extend(_bullets(report["recommended_improvements"], body))
            story.append(Spacer(1, 8))
        if report.get("learning_recommendations"):
            story.append(Paragraph("Learning Recommendations", h2))
            story.extend(_bullets(report["learning_recommendations"], body))
            story.append(Spacer(1, 8))
        if report.get("final_summary"):
            story.append(Paragraph("AI Feedback Summary", h2))
            story.append(Paragraph(report["final_summary"], body))
            story.append(Spacer(1, 8))

    if coach_comments:
        story.append(Paragraph("Debate Coach Feedback", h2))
        story.append(Paragraph(coach_comments, body))
        story.append(Spacer(1, 8))

    if educator_comments:
        story.append(Paragraph("Educator Final Feedback", h2))
        story.append(Paragraph(educator_comments, body))
        story.append(Spacer(1, 8))

    if fallacies:
        story.append(Paragraph("Logical Fallacies Detected", h2))
        rows = [["Type", "Severity", "Explanation", "Credibility Impact"]]
        for f in fallacies:
            rows.append([
                f.get("fallacy_type") or "—", f.get("severity") or "—",
                f.get("explanation") or "", f.get("credibility_assessment") or "—",
            ])
        table = Table(rows, colWidths=[1.1 * inch, 0.8 * inch, 2.8 * inch, 2.1 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(table)
        story.append(Spacer(1, 8))

    if presentation:
        story.append(Paragraph("Presentation Analysis", h2))
        pscore = presentation.get("presentation_score") or {}
        if pscore:
            delivery_fields = [
                ("overall_score", "Overall"), ("confidence_score", "Confidence"), ("clarity_score", "Clarity"),
                ("engagement_score", "Engagement"), ("pacing_score", "Pacing"), ("fluency_score", "Fluency"),
            ]
            present = [(k, l) for k, l in delivery_fields if pscore.get(k) is not None]
            if present:
                rows = [[label for _, label in present], [f"{pscore.get(key)}/100" for key, _ in present]]
                pt = Table(rows, colWidths=[7.6 * inch / len(present)] * len(present))
                pt.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#374151")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]))
                story.append(pt)
                story.append(Spacer(1, 8))
        counter = presentation.get("counterarguments") or {}
        if counter.get("counterarguments"):
            story.append(Paragraph("Counterarguments", ParagraphStyle("h3s", parent=h2, fontSize=12)))
            story.extend(_bullets(counter["counterarguments"], body))
            story.append(Spacer(1, 8))
        if audio_link:
            story.append(Paragraph(f'<link href="{audio_link}">Audio recording link</link>', body))
            story.append(Spacer(1, 6))
        transcript = presentation.get("transcript")
        if transcript:
            excerpt = transcript if len(transcript) <= 2000 else transcript[:2000] + " […truncated, see full transcript in-app]"
            story.append(Paragraph("Transcript", ParagraphStyle("h3s", parent=h2, fontSize=12)))
            story.append(Paragraph(excerpt, ParagraphStyle("mono", parent=body, fontSize=8, textColor=colors.HexColor("#374151"))))
            story.append(Spacer(1, 8))

    story.append(Spacer(1, 20))
    story.append(Paragraph("Generated by AI Debate Coach", brand_style))
    story.append(Paragraph(f"{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", small))

    doc.build(story)
    return buf.getvalue()
