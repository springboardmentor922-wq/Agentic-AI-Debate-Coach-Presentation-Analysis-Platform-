from sqlalchemy.orm import Session

from app.models.assigned_debate import AssignedDebate
from app.models.user import User

from app.schemas.assigned_debate import AssignedDebateCreate


# ==========================================
# ASSIGN DEBATE
# ==========================================

def assign_debate(
    coach: User,
    debate: AssignedDebateCreate,
    db: Session
):

    # Make sure the selected learner exists
    learner = (
        db.query(User)
        .filter(
            User.id == debate.learner_id,
            User.role == "Learner"
        )
        .first()
    )

    if learner is None:
        return None

    new_debate = AssignedDebate(

        learner_id=debate.learner_id,

        coach_id=coach.id,

        topic=debate.topic,

        category=debate.category,

        difficulty=debate.difficulty,

        due_date=debate.due_date,

        status="Assigned"

    )

    db.add(new_debate)

    db.commit()

    db.refresh(new_debate)

    return new_debate


# ==========================================
# GET ASSIGNED DEBATES
# ==========================================

def get_all_assigned(
    current_user: User,
    db: Session
):

    # --------------------------------------
    # COACH
    # --------------------------------------

    if current_user.role == "Debate Coach":

        return (
            db.query(AssignedDebate)
            .filter(
                AssignedDebate.coach_id ==
                current_user.id
            )
            .order_by(
                AssignedDebate.id.desc()
            )
            .all()
        )


    # --------------------------------------
    # LEARNER
    # --------------------------------------

    if current_user.role == "Learner":

        return (
            db.query(AssignedDebate)
            .filter(
                AssignedDebate.learner_id ==
                current_user.id
            )
            .order_by(
                AssignedDebate.id.desc()
            )
            .all()
        )


    # --------------------------------------
    # OTHER ROLES
    # --------------------------------------

    return []