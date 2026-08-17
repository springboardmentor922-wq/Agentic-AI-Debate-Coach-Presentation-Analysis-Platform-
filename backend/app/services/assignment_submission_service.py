from sqlalchemy.orm import Session

from datetime import datetime

from app.models.assignment_submission import (
    AssignmentSubmission
)

from app.models.assignment import Assignment

from app.models.user import User

from app.models.classroom import Classroom


# ============================================================
# CHECK WHETHER LEARNER CAN ACCESS ASSIGNMENT
# ============================================================

def learner_can_access_assignment(
    learner: User,
    assignment: Assignment,
    db: Session
):

    # Direct learner assignment

    if assignment.learner_id == learner.id:

        return True


    # Class assignment

    if assignment.classroom_id:

        if learner.classroom_id == assignment.classroom_id:

            classroom = (
                db.query(Classroom)
                .filter(
                    Classroom.id ==
                    assignment.classroom_id,

                    Classroom.educator_id ==
                    assignment.educator_id
                )
                .first()
            )

            if classroom:

                return True


    return False


# ============================================================
# CREATE SUBMISSION
# ============================================================

def create_submission(
    learner: User,
    assignment_id: int,
    response: str,
    db: Session
):

    assignment = (
        db.query(Assignment)
        .filter(
            Assignment.id == assignment_id
        )
        .first()
    )

    if assignment is None:

        return None, "Assignment not found"


    if not learner_can_access_assignment(
        learner,
        assignment,
        db
    ):

        return None, "You are not assigned this assignment"


    if not response.strip():

        return None, "Response cannot be empty"


    # --------------------------------------------------------
    # CHECK EXISTING SUBMISSION
    # --------------------------------------------------------

    existing = (
        db.query(AssignmentSubmission)
        .filter(
            AssignmentSubmission.assignment_id ==
            assignment_id,

            AssignmentSubmission.learner_id ==
            learner.id
        )
        .first()
    )


    if existing:

        existing.response = response.strip()

        existing.status = "Resubmitted"

        existing.submitted_at = datetime.utcnow()

        # Do not erase existing review

        db.commit()

        db.refresh(existing)

        return existing, None


    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    submission = AssignmentSubmission(

        assignment_id=assignment_id,

        learner_id=learner.id,

        response=response.strip(),

        status="Submitted"

    )


    db.add(submission)

    db.commit()

    db.refresh(submission)

    return submission, None


# ============================================================
# GET LEARNER ASSIGNMENTS
# ============================================================

def get_learner_assignments(
    learner: User,
    db: Session
):

    assignments = (
        db.query(Assignment)
        .filter(
            (
                Assignment.learner_id ==
                learner.id
            )
            |
            (
                Assignment.classroom_id ==
                learner.classroom_id
            )
        )
        .order_by(
            Assignment.id.desc()
        )
        .all()
    )


    result = []


    for assignment in assignments:

        submission = (
            db.query(AssignmentSubmission)
            .filter(
                AssignmentSubmission.assignment_id ==
                assignment.id,

                AssignmentSubmission.learner_id ==
                learner.id
            )
            .first()
        )


        result.append({

            "id":
                assignment.id,

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

            "submission_status":
                submission.status
                if submission
                else "Not Submitted",

            "submission_id":
                submission.id
                if submission
                else None,

            "score":
                submission.score
                if submission
                else None,

            "educator_feedback":
                submission.educator_feedback
                if submission
                else None

        })


    return result


# ============================================================
# GET EDUCATOR SUBMISSIONS
# ============================================================

def get_educator_submissions(
    educator_id: int,
    db: Session
):

    rows = (

        db.query(
            AssignmentSubmission,
            Assignment,
            User
        )

        .join(
            Assignment,
            Assignment.id ==
            AssignmentSubmission.assignment_id
        )

        .join(
            User,
            User.id ==
            AssignmentSubmission.learner_id
        )

        .filter(
            Assignment.educator_id ==
            educator_id
        )

        .order_by(
            AssignmentSubmission.submitted_at.desc()
        )

        .all()

    )


    result = []


    for submission, assignment, learner in rows:

        result.append({

            "id":
                submission.id,

            "assignment_id":
                assignment.id,

            "assignment_title":
                assignment.title,

            "learner_id":
                learner.id,

            "learner_name":
                learner.full_name,

            "learner_email":
                learner.email,

            "response":
                submission.response,

            "score":
                submission.score,

            "educator_feedback":
                submission.educator_feedback,

            "status":
                submission.status,

            "submitted_at":
                submission.submitted_at,

            "reviewed_at":
                submission.reviewed_at

        })


    return result


# ============================================================
# REVIEW SUBMISSION
# ============================================================

def review_submission(
    educator_id: int,
    submission_id: int,
    score: float,
    feedback: str,
    db: Session
):

    submission = (

        db.query(
            AssignmentSubmission
        )

        .filter(
            AssignmentSubmission.id ==
            submission_id
        )

        .first()

    )


    if submission is None:

        return None, "Submission not found"


    assignment = (

        db.query(
            Assignment
        )

        .filter(
            Assignment.id ==
            submission.assignment_id,

            Assignment.educator_id ==
            educator_id
        )

        .first()

    )


    if assignment is None:

        return None, "You do not have permission to review this submission"


    if score < 0 or score > 100:

        return None, "Score must be between 0 and 100"


    submission.score = score

    submission.educator_feedback = feedback

    submission.status = "Reviewed"

    submission.reviewed_at = datetime.utcnow()


    db.commit()

    db.refresh(submission)


    return submission, None