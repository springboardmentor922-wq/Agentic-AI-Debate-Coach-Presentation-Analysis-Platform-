from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.evaluation import Evaluation
from app.models.classroom import Classroom


# ============================================================
# HELPER
# ============================================================

def round_score(value):
    return round(float(value or 0), 2)


# ============================================================
# EDUCATOR DASHBOARD SUMMARY
# ============================================================

def get_educator_dashboard_summary(
    educator_id: int,
    db: Session,
    period: str = "6w"
):

    # ========================================================
    # 1. GET EDUCATOR'S CLASSES
    # ========================================================

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

    classroom_ids = [
        classroom.id
        for classroom in classrooms
    ]


    # ========================================================
    # 2. GET LEARNERS BELONGING TO THESE CLASSES
    # ========================================================

    if classroom_ids:

        learners = (
            db.query(User)
            .filter(
                User.role == "Learner",
                User.classroom_id.in_(classroom_ids)
            )
            .order_by(
                User.full_name.asc()
            )
            .all()
        )

    else:

        learners = []


    learner_ids = [
        learner.id
        for learner in learners
    ]


    # ========================================================
    # 3. TOTAL LEARNERS
    # ========================================================

    total_learners = len(learners)


    # ========================================================
    # 4. ACTIVE CLASSES
    # ========================================================

    active_classes = len(classrooms)


    # ========================================================
    # 5. PERIOD FILTER
    # ========================================================

    # IMPORTANT:
    # Evaluation.created_at is timezone-aware.
    # Therefore all dates used for comparison must also
    # be timezone-aware.

    now = datetime.now(timezone.utc)

    if period == "3m":

        start_date = now - timedelta(days=90)

    elif period == "year":

        start_date = now - timedelta(days=365)

    elif period == "1w":

        start_date = now - timedelta(weeks=1)

    elif period == "4w":

        start_date = now - timedelta(weeks=4)

    else:

        start_date = now - timedelta(weeks=6)


    # ========================================================
    # 6. GET EVALUATIONS
    # ========================================================

    if learner_ids:

        evaluations = (
            db.query(Evaluation)
            .filter(
                Evaluation.user_id.in_(
                    learner_ids
                )
            )
            .order_by(
                Evaluation.created_at.desc()
            )
            .all()
        )

    else:

        evaluations = []


    # ========================================================
    # 7. PERIOD EVALUATIONS
    # ========================================================

    period_evaluations = [
        evaluation
        for evaluation in evaluations
        if evaluation.created_at
        and evaluation.created_at >= start_date
    ]


    # ========================================================
    # 8. DEBATES CONDUCTED
    # ========================================================

    debates_conducted = len(
        period_evaluations
    )


    # ========================================================
    # 9. AVERAGE CLASS SCORE
    # ========================================================

    scores = [
        float(
            evaluation.overall_percentage or 0
        )
        for evaluation in period_evaluations
    ]

    if scores:

        average_class_score = round(
            sum(scores) / len(scores),
            2
        )

    else:

        average_class_score = 0


    # ========================================================
    # 10. LEARNER PERFORMANCE
    # ========================================================

    learner_performance = []

    for learner in learners:

        learner_evaluations = [
            evaluation
            for evaluation in evaluations
            if evaluation.user_id == learner.id
        ]

        learner_scores = [
            float(
                evaluation.overall_percentage or 0
            )
            for evaluation in learner_evaluations
        ]

        if learner_scores:

            average = round(
                sum(learner_scores)
                / len(learner_scores),
                2
            )

        else:

            average = 0


        learner_performance.append({

            "id": learner.id,

            "name":
                learner.full_name,

            "email":
                learner.email,

            "classroom_id":
                learner.classroom_id,

            "average_score":
                average,

            "evaluation_count":
                len(learner_evaluations)

        })


    # ========================================================
    # 11. TOP PERFORMER
    # ========================================================

    learners_with_evaluations = [
        learner
        for learner in learner_performance
        if learner["evaluation_count"] > 0
    ]


    if learners_with_evaluations:

        top_student = max(
            learners_with_evaluations,
            key=lambda learner:
                learner["average_score"]
        )

        top_performer = (
            top_student["name"]
        )

        top_performer_score = (
            top_student["average_score"]
        )

    else:

        top_performer = "No data"

        top_performer_score = 0


    # ========================================================
    # 12. PERFORMANCE DISTRIBUTION
    #
    # Based on learner average score.
    # NOT individual evaluations.
    # ========================================================

    excellent = 0
    good = 0
    average = 0
    needs_improvement = 0


    for learner in learners_with_evaluations:

        score = learner[
            "average_score"
        ]

        if score >= 80:

            excellent += 1

        elif score >= 70:

            good += 1

        elif score >= 50:

            average += 1

        else:

            needs_improvement += 1


    # ========================================================
    # 13. CLASS PERFORMANCE
    # ========================================================

    class_performance = []


    for classroom in classrooms:

        class_learners = [
            learner
            for learner in learners
            if learner.classroom_id
            == classroom.id
        ]

        class_learner_ids = [
            learner.id
            for learner in class_learners
        ]


        class_evaluations = [
            evaluation
            for evaluation in period_evaluations
            if evaluation.user_id
            in class_learner_ids
        ]


        class_scores = [
            float(
                evaluation.overall_percentage or 0
            )
            for evaluation
            in class_evaluations
        ]


        if class_scores:

            class_average = round(
                sum(class_scores)
                / len(class_scores),
                2
            )

        else:

            class_average = 0


        class_performance.append({

            "id":
                classroom.id,

            "name":
                classroom.name,

            "description":
                classroom.description,

            "learner_count":
                len(class_learners),

            "evaluation_count":
                len(class_evaluations),

            "average_score":
                class_average

        })


    # ========================================================
    # 14. RECENT ACTIVITIES
    # ========================================================

    recent_activities = []


    for evaluation in evaluations[:8]:

        learner = next(
            (
                learner
                for learner in learners
                if learner.id
                == evaluation.user_id
            ),
            None
        )


        if learner is None:

            continue


        recent_activities.append({

            "type":
                "evaluation",

            "learner_name":
                learner.full_name,

            "topic":
                evaluation.topic,

            "score":
                round_score(
                    evaluation.overall_percentage
                ),

            "grade":
                evaluation.grade,

            "created_at":
                evaluation.created_at.isoformat()
                if evaluation.created_at
                else None

        })


    # ========================================================
    # 15. NEEDS REVIEW
    #
    # Low-performing recent evaluations.
    # ========================================================

    needs_review = []


    for evaluation in evaluations:

        score = float(
            evaluation.overall_percentage or 0
        )


        if score < 60:

            learner = next(
                (
                    learner
                    for learner in learners
                    if learner.id
                    == evaluation.user_id
                ),
                None
            )


            if learner:

                needs_review.append({

                    "evaluation_id":
                        evaluation.id,

                    "learner_id":
                        learner.id,

                    "learner_name":
                        learner.full_name,

                    "topic":
                        evaluation.topic,

                    "score":
                        round_score(score),

                    "grade":
                        evaluation.grade,

                    "created_at":
                        evaluation.created_at.isoformat()
                        if evaluation.created_at
                        else None

                })


        if len(needs_review) >= 5:

            break


    # ========================================================
    # 16. SKILL PERFORMANCE
    # ========================================================

    skill_evaluations = period_evaluations


    def skill_average(attribute):

        values = []

        for evaluation in skill_evaluations:

            value = getattr(
                evaluation,
                attribute,
                None
            )

            if value is not None:

                values.append(
                    float(value)
                )


        if not values:

            return 0


        return round(
            sum(values) / len(values),
            2
        )


    skills = {

        "grammar":
            skill_average(
                "grammar_percentage"
            ),

        "logic":
            skill_average(
                "logic_percentage"
            ),

        "confidence":
            skill_average(
                "confidence_percentage"
            ),

        "relevance":
            skill_average(
                "relevance_percentage"
            )

    }


    # ========================================================
    # 17. WEAKEST SKILL
    # ========================================================

    if skill_evaluations:

        weakest_skill = min(
            skills,
            key=skills.get
        )

        weakest_skill_score = (
            skills[weakest_skill]
        )

    else:

        weakest_skill = "No data"

        weakest_skill_score = 0


    skill_names = {

        "grammar":
            "Grammar",

        "logic":
            "Logic",

        "confidence":
            "Confidence",

        "relevance":
            "Relevance"

    }


    # ========================================================
    # 18. PERFORMANCE TREND
    # ========================================================

    weekly_performance = []


    for week_index in range(5, -1, -1):

        week_end = (
            now
            - timedelta(
                weeks=week_index
            )
        )

        week_start = (
            week_end
            - timedelta(
                days=7
            )
        )


        week_evaluations = [

            evaluation

            for evaluation
            in evaluations

            if evaluation.created_at
            and week_start
            <= evaluation.created_at
            < week_end

        ]


        week_scores = [

            float(
                evaluation.overall_percentage
                or 0
            )

            for evaluation
            in week_evaluations

        ]


        if week_scores:

            week_average = round(
                sum(week_scores)
                / len(week_scores),
                2
            )

        else:

            week_average = 0


        weekly_performance.append({

            "label":
                week_start.strftime(
                    "%d %b"
                ),

            "score":
                week_average,

            "evaluations":
                len(week_evaluations)

        })


    # ========================================================
    # 19. RETURN EVERYTHING
    # ========================================================

    return {

        "total_learners":
            total_learners,

        "active_classes":
            active_classes,

        "debates_conducted":
            debates_conducted,

        "average_class_score":
            average_class_score,

        "top_performer":
            top_performer,

        "top_performer_score":
            top_performer_score,

        "distribution": {

            "excellent":
                excellent,

            "good":
                good,

            "average":
                average,

            "needs_improvement":
                needs_improvement

        },

        "classes":
            class_performance,

        "recent_activities":
            recent_activities,

        "needs_review":
            needs_review,

        "skills":
            skills,

        "weakest_skill":
            skill_names.get(
                weakest_skill,
                "No data"
            ),

        "weakest_skill_score":
            weakest_skill_score,

        "weekly_performance":
            weekly_performance,

        "topics_covered":
            len(
                set(
                    evaluation.topic
                    for evaluation
                    in period_evaluations
                    if evaluation.topic
                )
            )

    }