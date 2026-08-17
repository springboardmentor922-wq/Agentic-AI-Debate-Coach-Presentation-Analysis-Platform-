from sqlalchemy.orm import Session

from app.models.assigned_debate import AssignedDebate


def get_my_assigned_debates(
    learner_id: int,
    db: Session
):

    return (

        db.query(AssignedDebate)

        .filter(
            AssignedDebate.learner_id == learner_id
        )

        .order_by(
            AssignedDebate.created_at.desc()
        )

        .all()

    )