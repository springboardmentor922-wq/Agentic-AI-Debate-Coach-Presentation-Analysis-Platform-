import json

from sqlalchemy.orm import Session

from app.models.fallacy_report import FallacyReport
from app.models.user import User


def create_fallacy_report(
    learner_id: int,
    argument: str,
    result: dict,
    db: Session
):

    report = FallacyReport(

        learner_id=learner_id,

        argument=argument,

        detected_fallacies=json.dumps(
            result.get("detected_fallacies", [])
        ),

        explanations=json.dumps(
            result.get("explanation", [])
        ),

        suggestions=json.dumps(
            result.get("suggestions", [])
        )
    )

    db.add(report)

    db.commit()

    db.refresh(report)

    return report


def get_fallacy_reports(db: Session):

    reports = (
        db.query(FallacyReport)
        .order_by(FallacyReport.created_at.desc())
        .all()
    )

    result = []

    for report in reports:

        learner = (
            db.query(User)
            .filter(User.id == report.learner_id)
            .first()
        )

        result.append({

            "id": report.id,

            "learner_id": report.learner_id,

            "learner_name":
                learner.full_name if learner else "Unknown",

            "argument": report.argument,

            "detected_fallacies":
                json.loads(
                    report.detected_fallacies or "[]"
                ),

            "explanation":
                json.loads(
                    report.explanations or "[]"
                ),

            "suggestions":
                json.loads(
                    report.suggestions or "[]"
                ),

            "created_at": report.created_at

        })

    return result


def get_fallacy_report(
    report_id: int,
    db: Session
):

    report = (
        db.query(FallacyReport)
        .filter(
            FallacyReport.id == report_id
        )
        .first()
    )

    if not report:
        return None

    learner = (
        db.query(User)
        .filter(
            User.id == report.learner_id
        )
        .first()
    )

    return {

        "id": report.id,

        "learner_id": report.learner_id,

        "learner_name":
            learner.full_name if learner else "Unknown",

        "argument": report.argument,

        "detected_fallacies":
            json.loads(
                report.detected_fallacies or "[]"
            ),

        "explanation":
            json.loads(
                report.explanations or "[]"
            ),

        "suggestions":
            json.loads(
                report.suggestions or "[]"
            ),

        "created_at": report.created_at

    }