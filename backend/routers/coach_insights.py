from fastapi import APIRouter

router = APIRouter(
    prefix="/coach",
    tags=["Coach"]
)

@router.get("/attention")
def learners_needing_attention():

    return [
        {
            "learner_name": "Neha",
            "average_score": 58,
            "reason": "Weak Evidence Usage"
        },
        {
            "learner_name": "Rahul",
            "average_score": 62,
            "reason": "Frequent Logical Fallacies"
        }
    ]