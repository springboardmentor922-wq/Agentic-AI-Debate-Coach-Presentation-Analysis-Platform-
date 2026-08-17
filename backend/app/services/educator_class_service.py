from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.classroom import Classroom
from app.models.user import User
from app.models.evaluation import Evaluation


# =========================================================
# GET ALL EDUCATOR CLASSES
# =========================================================

def get_educator_classes(
    educator_id: int,
    db: Session
):

    classrooms = (
        db.query(Classroom)
        .filter(
            Classroom.educator_id == educator_id
        )
        .order_by(
            Classroom.id.desc()
        )
        .all()
    )

    result = []

    for classroom in classrooms:

        students = (
            db.query(User)
            .filter(
                User.classroom_id == classroom.id,
                User.role == "Learner"
            )
            .all()
        )

        student_count = len(students)

        average_score = (
            db.query(
                func.avg(
                    Evaluation.overall_percentage
                )
            )
            .join(
                User,
                User.id == Evaluation.user_id
            )
            .filter(
                User.classroom_id == classroom.id,
                User.role == "Learner"
            )
            .scalar()
        )

        average_score = (
            round(float(average_score), 2)
            if average_score is not None
            else 0
        )

        top_student = (
            db.query(
                User.full_name,
                func.avg(
                    Evaluation.overall_percentage
                ).label("score")
            )
            .join(
                Evaluation,
                Evaluation.user_id == User.id
            )
            .filter(
                User.classroom_id == classroom.id,
                User.role == "Learner"
            )
            .group_by(
                User.id,
                User.full_name
            )
            .order_by(
                func.avg(
                    Evaluation.overall_percentage
                ).desc()
            )
            .first()
        )

        result.append({

            "id": classroom.id,

            "name": classroom.name,

            "description":
                classroom.description,

            "educator_id":
                classroom.educator_id,

            "student_count":
                student_count,

            "average_score":
                average_score,

            "top_performer": {

                "name":
                    top_student.full_name
                    if top_student
                    else "N/A",

                "score":
                    round(
                        float(top_student.score),
                        2
                    )
                    if top_student
                    else 0

            }

        })

    return result


# =========================================================
# CREATE CLASS
# =========================================================

def create_educator_class(
    educator_id: int,
    name: str,
    description: str,
    db: Session
):

    classroom = Classroom(

        name=name,

        description=description,

        educator_id=educator_id

    )

    db.add(classroom)

    db.commit()

    db.refresh(classroom)

    return classroom


# =========================================================
# GET SINGLE CLASS
# =========================================================

def get_educator_class(
    educator_id: int,
    classroom_id: int,
    db: Session
):

    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.educator_id == educator_id
        )
        .first()
    )

    if classroom is None:
        return None

    students = (
        db.query(User)
        .filter(
            User.classroom_id == classroom.id,
            User.role == "Learner"
        )
        .all()
    )

    student_data = []

    for student in students:

        average_score = (
            db.query(
                func.avg(
                    Evaluation.overall_percentage
                )
            )
            .filter(
                Evaluation.user_id == student.id
            )
            .scalar()
        )

        average_score = (
            round(float(average_score), 2)
            if average_score is not None
            else 0
        )

        student_data.append({

            "id":
                student.id,

            "name":
                student.full_name,

            "email":
                student.email,

            "college":
                student.college,

            "branch":
                student.branch,

            "cgpa":
                student.cgpa,

            "average_score":
                average_score

        })

    average_class_score = (
        db.query(
            func.avg(
                Evaluation.overall_percentage
            )
        )
        .join(
            User,
            User.id == Evaluation.user_id
        )
        .filter(
            User.classroom_id == classroom.id,
            User.role == "Learner"
        )
        .scalar()
    )

    average_class_score = (
        round(
            float(average_class_score),
            2
        )
        if average_class_score is not None
        else 0
    )

    # -----------------------------------------
    # TOP PERFORMER
    # -----------------------------------------

    top_student = (
        db.query(
            User.full_name,
            func.avg(
                Evaluation.overall_percentage
            ).label("score")
        )
        .join(
            Evaluation,
            Evaluation.user_id == User.id
        )
        .filter(
            User.classroom_id == classroom.id,
            User.role == "Learner"
        )
        .group_by(
            User.id,
            User.full_name
        )
        .order_by(
            func.avg(
                Evaluation.overall_percentage
            ).desc()
        )
        .first()
    )

    return {

        "id":
            classroom.id,

        "name":
            classroom.name,

        "description":
            classroom.description,

        "educator_id":
            classroom.educator_id,

        "student_count":
            len(students),

        "average_score":
            average_class_score,

        "top_performer": {

            "name":
                top_student.full_name
                if top_student
                else "N/A",

            "score":
                round(
                    float(top_student.score),
                    2
                )
                if top_student
                else 0

        },

        "students":
            student_data

    }


# =========================================================
# UPDATE CLASS
# =========================================================

def update_educator_class(
    educator_id: int,
    classroom_id: int,
    name: str,
    description: str,
    db: Session
):

    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.educator_id == educator_id
        )
        .first()
    )

    if classroom is None:
        return None

    classroom.name = name

    classroom.description = description

    db.commit()

    db.refresh(classroom)

    return classroom


# =========================================================
# DELETE CLASS
# =========================================================

def delete_educator_class(
    educator_id: int,
    classroom_id: int,
    db: Session
):

    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.educator_id == educator_id
        )
        .first()
    )

    if classroom is None:
        return None

    # Remove classroom assignment
    # from learners first

    db.query(User).filter(
        User.classroom_id == classroom.id
    ).update(
        {
            User.classroom_id: None
        },
        synchronize_session=False
    )

    db.delete(classroom)

    db.commit()

    return True


# =========================================================
# GET AVAILABLE LEARNERS
# =========================================================

def get_available_learners(
    educator_id: int,
    classroom_id: int,
    db: Session
):

    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.educator_id == educator_id
        )
        .first()
    )

    if classroom is None:
        return None

    learners = (
        db.query(User)
        .filter(
            User.role == "Learner",
            User.classroom_id.is_(None)
        )
        .order_by(
            User.full_name.asc()
        )
        .all()
    )

    return [

        {
            "id":
                learner.id,

            "name":
                learner.full_name,

            "email":
                learner.email,

            "college":
                learner.college,

            "branch":
                learner.branch,

            "cgpa":
                learner.cgpa
        }

        for learner in learners

    ]


# =========================================================
# ASSIGN LEARNERS
# =========================================================

def assign_learners_to_class(
    educator_id: int,
    classroom_id: int,
    learner_ids: list[int],
    db: Session
):

    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.educator_id == educator_id
        )
        .first()
    )

    if classroom is None:
        return None

    learners = (
        db.query(User)
        .filter(
            User.id.in_(learner_ids),
            User.role == "Learner"
        )
        .all()
    )

    assigned = []

    for learner in learners:

        learner.classroom_id = classroom_id

        assigned.append({

            "id":
                learner.id,

            "name":
                learner.full_name,

            "email":
                learner.email

        })

    db.commit()

    return {

        "message":
            "Learners assigned successfully",

        "classroom_id":
            classroom_id,

        "assigned_learners":
            assigned

    }


# =========================================================
# REMOVE LEARNER
# =========================================================

def remove_learner_from_class(
    educator_id: int,
    classroom_id: int,
    learner_id: int,
    db: Session
):

    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.educator_id == educator_id
        )
        .first()
    )

    if classroom is None:
        return None

    learner = (
        db.query(User)
        .filter(
            User.id == learner_id,
            User.role == "Learner",
            User.classroom_id == classroom_id
        )
        .first()
    )

    if learner is None:
        return False

    learner.classroom_id = None

    db.commit()

    return {

        "message":
            "Learner removed from class",

        "learner_id":
            learner.id,

        "classroom_id":
            classroom_id

    }


# =========================================================
# CLASS PERFORMANCE ANALYTICS
# =========================================================

def get_class_analytics(
    educator_id: int,
    classroom_id: int,
    db: Session
):

    # -----------------------------------------
    # CHECK CLASSROOM
    # -----------------------------------------

    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.educator_id == educator_id
        )
        .first()
    )

    if classroom is None:
        return None


    # -----------------------------------------
    # GET LEARNERS
    # -----------------------------------------

    learners = (
        db.query(User)
        .filter(
            User.classroom_id == classroom_id,
            User.role == "Learner"
        )
        .all()
    )

    learner_ids = [
        learner.id
        for learner in learners
    ]


    # -----------------------------------------
    # NO LEARNERS
    # -----------------------------------------

    if not learner_ids:

        return {

            "classroom_id":
                classroom_id,

            "class_name":
                classroom.name,

            "total_learners":
                0,

            "total_evaluations":
                0,

            "average_score":
                0,

            "highest_score":
                0,

            "lowest_score":
                0,

            "skills": {

                "grammar": 0,
                "logic": 0,
                "confidence": 0,
                "relevance": 0

            },

            "score_distribution": {

                "excellent": 0,
                "good": 0,
                "average": 0,
                "needs_improvement": 0

            },

            "top_learners": []

        }


    # -----------------------------------------
    # GET EVALUATIONS
    # -----------------------------------------

    evaluations = (
        db.query(Evaluation)
        .filter(
            Evaluation.user_id.in_(
                learner_ids
            )
        )
        .all()
    )

    total_evaluations = len(
        evaluations
    )


    # -----------------------------------------
    # NO EVALUATIONS
    # -----------------------------------------

    if total_evaluations == 0:

        return {

            "classroom_id":
                classroom_id,

            "class_name":
                classroom.name,

            "total_learners":
                len(learner_ids),

            "total_evaluations":
                0,

            "average_score":
                0,

            "highest_score":
                0,

            "lowest_score":
                0,

            "skills": {

                "grammar": 0,
                "logic": 0,
                "confidence": 0,
                "relevance": 0

            },

            "score_distribution": {

                "excellent": 0,
                "good": 0,
                "average": 0,
                "needs_improvement": 0

            },

            "top_learners": []

        }


    # -----------------------------------------
    # OVERALL SCORES
    # -----------------------------------------

    scores = [

        float(
            evaluation.overall_percentage or 0
        )

        for evaluation in evaluations

    ]


    average_score = (
        sum(scores) / len(scores)
    )

    highest_score = max(scores)

    lowest_score = min(scores)


    # -----------------------------------------
    # SKILL SCORES
    # -----------------------------------------

    grammar_scores = [

        float(
            evaluation.grammar_percentage or 0
        )

        for evaluation in evaluations

    ]

    logic_scores = [

        float(
            evaluation.logic_percentage or 0
        )

        for evaluation in evaluations

    ]

    confidence_scores = [

        float(
            evaluation.confidence_percentage or 0
        )

        for evaluation in evaluations

    ]

    relevance_scores = [

        float(
            evaluation.relevance_percentage or 0
        )

        for evaluation in evaluations

    ]


    # -----------------------------------------
    # SCORE DISTRIBUTION
    # -----------------------------------------

    excellent = 0

    good = 0

    average = 0

    needs_improvement = 0


    for score in scores:

        if score >= 80:

            excellent += 1

        elif score >= 70:

            good += 1

        elif score >= 50:

            average += 1

        else:

            needs_improvement += 1


    # -----------------------------------------
    # TOP LEARNERS
    #
    # IMPORTANT:
    # This calculates the average score
    # PER LEARNER, not the highest single
    # evaluation.
    # -----------------------------------------

    top_learners_query = (

        db.query(

            User.id,

            User.full_name,

            func.avg(
                Evaluation.overall_percentage
            ).label(
                "average_score"
            ),

            func.count(
                Evaluation.id
            ).label(
                "evaluation_count"
            )

        )

        .join(
            Evaluation,
            Evaluation.user_id == User.id
        )

        .filter(

            User.classroom_id ==
                classroom_id,

            User.role ==
                "Learner"

        )

        .group_by(

            User.id,

            User.full_name

        )

        .order_by(

            func.avg(
                Evaluation.overall_percentage
            ).desc()

        )

        .limit(5)

        .all()

    )


    top_learners = []


    for learner in top_learners_query:

        top_learners.append({

            "id":
                learner.id,

            "name":
                learner.full_name,

            "average_score":
                round(
                    float(
                        learner.average_score or 0
                    ),
                    2
                ),

            "evaluation_count":
                learner.evaluation_count

        })


    # -----------------------------------------
    # RETURN ANALYTICS
    # -----------------------------------------
        # -----------------------------------------
    # RECENT EVALUATIONS
    # -----------------------------------------

    recent_evaluations_query = (
        db.query(
            Evaluation,
            User.full_name
        )
        .join(
            User,
            User.id == Evaluation.user_id
        )
        .filter(
            User.classroom_id == classroom_id,
            User.role == "Learner"
        )
        .order_by(
            Evaluation.created_at.desc()
        )
        .limit(10)
        .all()
    )

    recent_evaluations = []

    for evaluation, learner_name in recent_evaluations_query:

        recent_evaluations.append({

            "id":
                evaluation.id,

            "learner_id":
                evaluation.user_id,

            "learner_name":
                learner_name,

            "topic":
                evaluation.topic,

            "score":
                round(
                    float(
                        evaluation.overall_percentage or 0
                    ),
                    2
                ),

            "grade":
                evaluation.grade or "N/A",

            "created_at":
                evaluation.created_at.isoformat()
                if evaluation.created_at
                else None

        })

    return {

        "classroom_id":
            classroom_id,

        "class_name":
            classroom.name,

        "total_learners":
            len(learner_ids),

        "total_evaluations":
            total_evaluations,

        "average_score":
            round(
                average_score,
                2
            ),

        "highest_score":
            round(
                highest_score,
                2
            ),

        "lowest_score":
            round(
                lowest_score,
                2
            ),

        "skills": {

            "grammar":
                round(
                    sum(grammar_scores)
                    / len(grammar_scores),
                    2
                ),

            "logic":
                round(
                    sum(logic_scores)
                    / len(logic_scores),
                    2
                ),

            "confidence":
                round(
                    sum(confidence_scores)
                    / len(confidence_scores),
                    2
                ),

            "relevance":
                round(
                    sum(relevance_scores)
                    / len(relevance_scores),
                    2
                )

        },

        "score_distribution": {

            "excellent":
                excellent,

            "good":
                good,

            "average":
                average,

            "needs_improvement":
                needs_improvement

        },

                "top_learners":
            top_learners,

        "recent_evaluations":
            recent_evaluations

    }