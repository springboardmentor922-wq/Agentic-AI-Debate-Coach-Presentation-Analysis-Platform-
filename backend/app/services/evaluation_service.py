import json
from sqlalchemy.orm import Session

from app.models.evaluation import Evaluation
from app.services.gemini_service import evaluate_debate
from app.services.local_ai_service import local_evaluate


# =========================================
# GRADE CALCULATION
# =========================================

def calculate_grade(percentage: float) -> str:

    if percentage >= 90:
        return "A+"

    elif percentage >= 80:
        return "A"

    elif percentage >= 70:
        return "B"

    elif percentage >= 60:
        return "C"

    else:
        return "D"


# =========================================
# SAFE SCORE CONVERSION
# =========================================

def safe_score(value) -> int:

    """
    Convert AI score to a valid integer
    between 0 and 10.

    Handles values such as:

    8
    "8"
    "8/10"
    "8 / 10"
    "8.5/10"

    Anything outside 0-10 is clamped.
    """

    try:

        value_string = str(value).strip()

        # Handle values such as "8/10"
        if "/" in value_string:

            value_string = (
                value_string
                .split("/")[0]
                .strip()
            )

        score = float(value_string)

    except Exception:

        score = 0


    # -----------------------------------------
    # FORCE VALID RANGE
    # -----------------------------------------

    score = max(0, min(score, 10))


    return int(round(score))


# =========================================
# SAFE PERCENTAGE
# =========================================

def safe_percentage(value, score) -> float:

    """
    Percentage should always correspond
    to the validated score.

    Score 8 -> 80%
    Score 10 -> 100%
    """

    try:

        percentage = float(
            str(value)
            .replace("%", "")
            .strip()
        )

    except Exception:

        percentage = score * 10


    # -----------------------------------------
    # Do not trust AI percentage blindly
    # -----------------------------------------

    # The score is the authoritative value.
    percentage = score * 10


    return round(
        max(0, min(percentage, 100)),
        2
    )


# =========================================
# SUBMIT EVALUATION
# =========================================

def submit_evaluation(
    db: Session,
    user_id: int,
    topic: str,
    argument: str,
    recording_path: str = None
):

    # =========================================
    # TRY GEMINI
    # =========================================

    try:

        print(
            "\n========== USING GEMINI ==========\n"
        )

        ai = evaluate_debate(
            topic,
            argument
        )

        ai["feedback"] = (
            ai.get("feedback", "")
            + "\n\nEvaluation generated using Gemini AI."
        )

    except Exception as e:

        print(
            "\n========== GEMINI FAILED ==========\n"
        )

        print(str(e))

        print(
            "\n========== USING LOCAL AI ==========\n"
        )

        ai = local_evaluate(
            topic,
            argument
        )

        ai["feedback"] = (
            ai.get("feedback", "")
            + "\n\nGemini API unavailable."
            "\nAutomatically switched to Local AI."
        )


    # =========================================
    # VALIDATE GRAMMAR
    # =========================================

    grammar = safe_score(
        ai["grammar"]["score"]
    )

    grammar_percentage = safe_percentage(
        ai["grammar"].get("percentage"),
        grammar
    )

    grammar_remark = (
        ai["grammar"].get(
            "remark",
            ""
        )
    )


    # =========================================
    # VALIDATE LOGIC
    # =========================================

    logic = safe_score(
        ai["logic"]["score"]
    )

    logic_percentage = safe_percentage(
        ai["logic"].get("percentage"),
        logic
    )

    logic_remark = (
        ai["logic"].get(
            "remark",
            ""
        )
    )


    # =========================================
    # VALIDATE CONFIDENCE
    # =========================================

    confidence = safe_score(
        ai["confidence"]["score"]
    )

    confidence_percentage = safe_percentage(
        ai["confidence"].get("percentage"),
        confidence
    )

    confidence_remark = (
        ai["confidence"].get(
            "remark",
            ""
        )
    )


    # =========================================
    # VALIDATE RELEVANCE
    # =========================================

    relevance = safe_score(
        ai["relevance"]["score"]
    )

    relevance_percentage = safe_percentage(
        ai["relevance"].get("percentage"),
        relevance
    )

    relevance_remark = (
        ai["relevance"].get(
            "remark",
            ""
        )
    )


    # =========================================
    # OVERALL SCORE
    # =========================================

    overall_score = (
        grammar
        + logic
        + confidence
        + relevance
    )


    # Maximum possible = 40
    overall_score = max(
        0,
        min(
            overall_score,
            40
        )
    )


    # Convert 40 -> 100%
    overall_percentage = round(
        (overall_score / 40) * 100,
        2
    )


    # Final safety check
    overall_percentage = max(
        0,
        min(
            overall_percentage,
            100
        )
    )


    grade = calculate_grade(
        overall_percentage
    )


    # =========================================
    # CREATE DATABASE RECORD
    # =========================================

    evaluation = Evaluation(

        user_id=user_id,

        topic=topic,

        argument=argument,

        recording_path=recording_path,


        # -------------------------------------
        # Grammar
        # -------------------------------------

        grammar_score=grammar,

        grammar_percentage=
            grammar_percentage,

        grammar_remark=
            grammar_remark,


        # -------------------------------------
        # Logic
        # -------------------------------------

        logic_score=logic,

        logic_percentage=
            logic_percentage,

        logic_remark=
            logic_remark,


        # -------------------------------------
        # Confidence
        # -------------------------------------

        confidence_score=confidence,

        confidence_percentage=
            confidence_percentage,

        confidence_remark=
            confidence_remark,


        # -------------------------------------
        # Relevance
        # -------------------------------------

        relevance_score=relevance,

        relevance_percentage=
            relevance_percentage,

        relevance_remark=
            relevance_remark,


        # -------------------------------------
        # Overall
        # -------------------------------------

        overall_score=
            overall_score,

        overall_percentage=
            overall_percentage,

        grade=grade,


        # -------------------------------------
        # Existing AI Data
        # -------------------------------------

        strengths=json.dumps(
            ai.get("strengths", [])
        ),

        weaknesses=json.dumps(
            ai.get("weaknesses", [])
        ),

        coach_tips=json.dumps(
            ai.get("coach_tips", [])
        ),


        # -------------------------------------
        # Debate AI Data
        # -------------------------------------

        counter_arguments=json.dumps(
            ai.get(
                "counter_arguments",
                []
            )
        ),

        logical_fallacies=json.dumps(
            ai.get(
                "logical_fallacies",
                []
            )
        ),

        rebuttals=json.dumps(
            ai.get(
                "rebuttals",
                []
            )
        ),


        opening_statement=
            ai.get(
                "opening_statement",
                ""
            ),

        closing_statement=
            ai.get(
                "closing_statement",
                ""
            ),

        improved_argument=
            ai.get(
                "improved_argument",
                ""
            ),


        real_world_examples=json.dumps(
            ai.get(
                "real_world_examples",
                []
            )
        ),

        statistics=json.dumps(
            ai.get(
                "statistics",
                []
            )
        ),

        ai_insights=json.dumps(
            ai.get(
                "ai_insights",
                []
            )
        ),


        feedback=
            ai.get(
                "feedback",
                ""
            )
    )


    # =========================================
    # SAVE
    # =========================================

    print("\n===== FINAL SCORES =====")

    print(
        f"Grammar: {grammar}/10 "
        f"({grammar_percentage}%)"
    )

    print(
        f"Logic: {logic}/10 "
        f"({logic_percentage}%)"
    )

    print(
        f"Confidence: {confidence}/10 "
        f"({confidence_percentage}%)"
    )

    print(
        f"Relevance: {relevance}/10 "
        f"({relevance_percentage}%)"
    )

    print(
        f"Overall: {overall_score}/40 "
        f"({overall_percentage}%)"
    )

    print(
        f"Grade: {grade}"
    )

    print("========================\n")


    db.add(evaluation)

    db.commit()

    db.refresh(evaluation)


    # =========================================
    # RESPONSE
    # =========================================

    return {

        "grammar": {
            "score": grammar,
            "percentage":
                f"{grammar_percentage}%",
            "remark":
                grammar_remark
        },

        "logic": {
            "score": logic,
            "percentage":
                f"{logic_percentage}%",
            "remark":
                logic_remark
        },

        "confidence": {
            "score": confidence,
            "percentage":
                f"{confidence_percentage}%",
            "remark":
                confidence_remark
        },

        "relevance": {
            "score": relevance,
            "percentage":
                f"{relevance_percentage}%",
            "remark":
                relevance_remark
        },


        "overall": {

            "score":
                f"{overall_score}/40",

            "percentage":
                f"{overall_percentage}%",

            "grade":
                grade
        },


        "strengths":
            ai.get(
                "strengths",
                []
            ),

        "weaknesses":
            ai.get(
                "weaknesses",
                []
            ),

        "coach_tips":
            ai.get(
                "coach_tips",
                []
            ),


        "counter_arguments":
            ai.get(
                "counter_arguments",
                []
            ),

        "logical_fallacies":
            ai.get(
                "logical_fallacies",
                []
            ),

        "rebuttals":
            ai.get(
                "rebuttals",
                []
            ),


        "opening_statement":
            ai.get(
                "opening_statement",
                ""
            ),

        "closing_statement":
            ai.get(
                "closing_statement",
                ""
            ),

        "improved_argument":
            ai.get(
                "improved_argument",
                ""
            ),


        "real_world_examples":
            ai.get(
                "real_world_examples",
                []
            ),

        "statistics":
            ai.get(
                "statistics",
                []
            ),

        "ai_insights":
            ai.get(
                "ai_insights",
                []
            ),

        "feedback":
            ai.get(
                "feedback",
                ""
            )
    }