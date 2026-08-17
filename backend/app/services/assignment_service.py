from sqlalchemy.orm import Session

from app.models.assignment import Assignment
from app.models.user import User
from app.models.classroom import Classroom

from app.schemas.assignment import AssignmentCreate


# ============================================================
# CREATE ASSIGNMENT
# ============================================================

def create_assignment(
    educator: User,
    data: AssignmentCreate,
    db: Session
):

    # --------------------------------------------------------
    # BASIC VALIDATION
    # --------------------------------------------------------

    if not data.title.strip():

        raise ValueError(
            "Assignment title is required"
        )


    # --------------------------------------------------------
    # MUST SELECT EITHER CLASS OR LEARNER
    # --------------------------------------------------------

    if not data.classroom_id and not data.learner_id:

        raise ValueError(
            "Select a learner or classroom"
        )


    if data.classroom_id and data.learner_id:

        raise ValueError(
            "Select either a learner or classroom, not both"
        )


    # --------------------------------------------------------
    # CLASS ASSIGNMENT
    # --------------------------------------------------------

    if data.classroom_id:

        classroom = (
            db.query(Classroom)
            .filter(
                Classroom.id == data.classroom_id,
                Classroom.educator_id == educator.id
            )
            .first()
        )

        if classroom is None:

            raise ValueError(
                "Class not found or does not belong to this educator"
            )


    # --------------------------------------------------------
    # LEARNER ASSIGNMENT
    # --------------------------------------------------------

    if data.learner_id:

        learner = (
            db.query(User)
            .filter(
                User.id == data.learner_id,
                User.role == "Learner"
            )
            .first()
        )

        if learner is None:

            raise ValueError(
                "Learner not found"
            )

        # Learner must belong to educator's class

        if learner.classroom_id:

            classroom = (
                db.query(Classroom)
                .filter(
                    Classroom.id == learner.classroom_id,
                    Classroom.educator_id == educator.id
                )
                .first()
            )

            if classroom is None:

                raise ValueError(
                    "This learner does not belong to your classroom"
                )

        else:

            raise ValueError(
                "Learner is not assigned to your classroom"
            )


    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    assignment = Assignment(

        educator_id=educator.id,

        classroom_id=data.classroom_id,

        learner_id=data.learner_id,

        title=data.title.strip(),

        description=data.description,

        category=data.category,

        difficulty=data.difficulty,

        due_date=data.due_date,

        status="Assigned"

    )

    db.add(assignment)

    db.commit()

    db.refresh(assignment)

    return assignment


# ============================================================
# GET EDUCATOR ASSIGNMENTS
# ============================================================

def get_educator_assignments(
    educator_id: int,
    db: Session
):

    assignments = (
        db.query(Assignment)
        .filter(
            Assignment.educator_id == educator_id
        )
        .order_by(
            Assignment.id.desc()
        )
        .all()
    )

    result = []

    for assignment in assignments:

        learner_name = None
        classroom_name = None

        # ----------------------------------------------------
        # LEARNER
        # ----------------------------------------------------

        if assignment.learner_id:

            learner = (
                db.query(User)
                .filter(
                    User.id == assignment.learner_id
                )
                .first()
            )

            if learner:

                learner_name = learner.full_name


        # ----------------------------------------------------
        # CLASS
        # ----------------------------------------------------

        if assignment.classroom_id:

            classroom = (
                db.query(Classroom)
                .filter(
                    Classroom.id ==
                    assignment.classroom_id
                )
                .first()
            )

            if classroom:

                classroom_name = classroom.name


        result.append({

            "id": assignment.id,

            "educator_id":
                assignment.educator_id,

            "classroom_id":
                assignment.classroom_id,

            "classroom_name":
                classroom_name,

            "learner_id":
                assignment.learner_id,

            "learner_name":
                learner_name,

            "title":
                assignment.title,

            "description":
                assignment.description,

            "category":
                assignment.category,

            "difficulty":
                assignment.difficulty,

            "due_date":
                assignment.due_date,

            "status":
                assignment.status,

            "created_at":
                assignment.created_at

        })

    return result


# ============================================================
# DELETE ASSIGNMENT
# ============================================================

def delete_assignment(
    educator_id: int,
    assignment_id: int,
    db: Session
):

    assignment = (
        db.query(Assignment)
        .filter(
            Assignment.id == assignment_id,
            Assignment.educator_id == educator_id
        )
        .first()
    )

    if assignment is None:

        return None

    db.delete(assignment)

    db.commit()

    return True