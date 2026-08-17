import json

from sqlalchemy.orm import Session

from app.models.presentation_review import PresentationReview
from app.models.user import User


def create_presentation_review(
    learner_id: int,
    presentation: str,
    result: dict,
    db: Session
):

    review = PresentationReview(

        learner_id=learner_id,

        presentation=presentation,

        clarity=result.get("clarity", 0),

        confidence=result.get("confidence", 0),

        communication=result.get(
            "communication",
            0
        ),

        structure=result.get(
            "structure",
            0
        ),

        overall=result.get(
            "overall",
            0
        ),

        strengths=json.dumps(
            result.get("strengths", [])
        ),

        weaknesses=json.dumps(
            result.get("weaknesses", [])
        ),

        suggestions=json.dumps(
            result.get("suggestions", [])
        )
    )

    db.add(review)

    db.commit()

    db.refresh(review)

    return review


def get_presentation_reviews(db: Session):

    reviews = (
        db.query(PresentationReview)
        .order_by(
            PresentationReview.created_at.desc()
        )
        .all()
    )

    result = []

    for review in reviews:

        learner = (
            db.query(User)
            .filter(
                User.id == review.learner_id
            )
            .first()
        )

        result.append({

            "id": review.id,

            "learner_id": review.learner_id,

            "learner_name":
                learner.full_name
                if learner
                else "Unknown",

            "presentation":
                review.presentation,

            "clarity":
                review.clarity,

            "confidence":
                review.confidence,

            "communication":
                review.communication,

            "structure":
                review.structure,

            "overall":
                review.overall,

            "strengths":
                json.loads(
                    review.strengths or "[]"
                ),

            "weaknesses":
                json.loads(
                    review.weaknesses or "[]"
                ),

            "suggestions":
                json.loads(
                    review.suggestions or "[]"
                ),

            "created_at":
                review.created_at
        })

    return result


def get_presentation_review(
    review_id: int,
    db: Session
):

    review = (
        db.query(PresentationReview)
        .filter(
            PresentationReview.id == review_id
        )
        .first()
    )

    if not review:

        return None

    learner = (
        db.query(User)
        .filter(
            User.id == review.learner_id
        )
        .first()
    )

    return {

        "id": review.id,

        "learner_id": review.learner_id,

        "learner_name":
            learner.full_name
            if learner
            else "Unknown",

        "presentation":
            review.presentation,

        "clarity":
            review.clarity,

        "confidence":
            review.confidence,

        "communication":
            review.communication,

        "structure":
            review.structure,

        "overall":
            review.overall,

        "strengths":
            json.loads(
                review.strengths or "[]"
            ),

        "weaknesses":
            json.loads(
                review.weaknesses or "[]"
            ),

        "suggestions":
            json.loads(
                review.suggestions or "[]"
            ),

        "created_at":
            review.created_at
    }