"""Reports & Export System (Module 13). Generates downloadable PDF and
Excel files from data already computed elsewhere -- no new analytics here,
just export formatting."""

import io

from openpyxl import Workbook
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet


def build_session_summary_excel(session, summary) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = "Debate Summary"

    ws.append(["Topic", session["topic"]])
    ws.append(["Format", session["format"]])
    ws.append(["Position", session["position"]])
    ws.append(["Status", session["status"]])
    ws.append([])
    ws.append(["Metric", "Value"])
    ws.append(["Overall Score", summary["avg_overall"]])
    ws.append(["Turns Taken", summary["turns_count"]])
    ws.append(["Fallacies Detected", summary["fallacy_count"]])
    ws.append(["Clarity", summary["avg_clarity"]])
    ws.append(["Relevance", summary["avg_relevance"]])
    ws.append(["Evidence Strength", summary["avg_evidence"]])
    ws.append(["Logical Consistency", summary["avg_consistency"]])
    ws.append(["Persuasiveness", summary["avg_persuasiveness"]])
    ws.append([])
    ws.append(["Remarks", summary["overall_assessment"]])
    ws.append([])
    ws.append(["Strengths"])
    for s in summary["strengths"]:
        ws.append(["", s])
    ws.append(["Areas to Improve"])
    for s in summary["areas_to_improve"]:
        ws.append(["", s])
    ws.append(["Suggested Next Steps"])
    for s in summary["suggested_next_steps"]:
        ws.append(["", s])

    buffer = io.BytesIO()
    wb.save(buffer)
    return buffer.getvalue()


def build_session_summary_pdf(session, summary) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"Debate Summary: {session['topic']}", styles["Title"]))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        f"Format: {session['format']} &nbsp;&nbsp; Position: {session['position']} &nbsp;&nbsp; Status: {session['status']}",
        styles["Normal"],
    ))
    elements.append(Spacer(1, 14))

    table_data = [
        ["Metric", "Value"],
        ["Overall Score", f"{summary['avg_overall']}/100"],
        ["Turns Taken", summary["turns_count"]],
        ["Fallacies Detected", summary["fallacy_count"]],
        ["Clarity", f"{summary['avg_clarity']}%"],
        ["Relevance", f"{summary['avg_relevance']}%"],
        ["Evidence Strength", f"{summary['avg_evidence']}%"],
        ["Logical Consistency", f"{summary['avg_consistency']}%"],
        ["Persuasiveness", f"{summary['avg_persuasiveness']}%"],
    ]
    table = Table(table_data, colWidths=[220, 200])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#146c82")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e6e9f1")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("Remarks", styles["Heading3"]))
    elements.append(Paragraph(summary["overall_assessment"], styles["Normal"]))
    elements.append(Spacer(1, 10))

    for heading, items in [
        ("Strengths", summary["strengths"]),
        ("Areas to Improve", summary["areas_to_improve"]),
        ("Suggested Next Steps", summary["suggested_next_steps"]),
    ]:
        elements.append(Paragraph(heading, styles["Heading3"]))
        for item in items:
            elements.append(Paragraph(f"• {item}", styles["Normal"]))
        elements.append(Spacer(1, 10))

    doc.build(elements)
    return buffer.getvalue()


def build_platform_report_excel(admin_data) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = "Platform Report"

    ws.append(["Total Users", admin_data["totalUsers"]])
    ws.append(["Total Sessions", admin_data["totalSessions"]])
    ws.append(["Active Sessions", admin_data["activeSessions"]])
    ws.append(["Platform Average Score", admin_data["platformAverageScore"]])
    ws.append([])
    ws.append(["Role", "Count"])
    for r in admin_data["roleDistribution"]:
        ws.append([r["role"], r["total"]])

    buffer = io.BytesIO()
    wb.save(buffer)
    return buffer.getvalue()