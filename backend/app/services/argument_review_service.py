import json

from sqlalchemy.orm import Session

from app.models.argument_review import ArgumentReview
from app.models.user import User


def create_argument_review(
    learner_id: int,
    argument: str,
    result: dict,
    db: Session
):

    review = ArgumentReview(

        learner_id=learner_id,

        argument=argument,

        claim=result.get("claim", ""),

        supporting_points=json.dumps(
            result.get("supporting_points", [])
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


def get_argument_reviews(db: Session):

    reviews = (
        db.query(ArgumentReview)
        .order_by(ArgumentReview.created_at.desc())
        .all()
    )

    result = []

    for review in reviews:

        learner = (
            db.query(User)
            .filter(User.id == review.learner_id)
            .first()
        )

        result.append({

            "id": review.id,

            "learner_id": review.learner_id,

            "learner_name":
                learner.full_name if learner else "Unknown",

            "argument": review.argument,

            "claim": review.claim,

            "supporting_points":
                json.loads(review.supporting_points or "[]"),

            "strengths":
                json.loads(review.strengths or "[]"),

            "weaknesses":
                json.loads(review.weaknesses or "[]"),

            "suggestions":
                json.loads(review.suggestions or "[]"),

            "created_at": review.created_at

        })

    return result


def get_argument_review(
    review_id: int,
    db: Session
):

    review = (
        db.query(ArgumentReview)
        .filter(ArgumentReview.id == review_id)
        .first()
    )

    if not review:
        return None

    learner = (
        db.query(User)
        .filter(User.id == review.learner_id)
        .first()
    )

    return {

        "id": review.id,

        "learner_id": review.learner_id,

        "learner_name":
            learner.full_name if learner else "Unknown",

        "argument": review.argument,

        "claim": review.claim,

        "supporting_points":
            json.loads(review.supporting_points or "[]"),

        "strengths":
            json.loads(review.strengths or "[]"),

        "weaknesses":
            json.loads(review.weaknesses or "[]"),

        "suggestions":
            json.loads(review.suggestions or "[]"),

        "created_at": review.created_at

    }