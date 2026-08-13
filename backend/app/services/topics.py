from fastapi import HTTPException, Depends
from app.db.mongodb import get_db
from app.schemas.topic import TopicCreate, TopicResponse
from app.core.security import get_current_user

async def create_topic(topic_in: TopicCreate, current_user=Depends(get_current_user)):
    db = get_db()
    
    role = current_user.get("role")
    scope_data = {}

    if role == "coach":
        scope_data = {"scope": "coach_learners", "assigned_coach": current_user["id"]}
    elif role == "educator":
        scope_data = {"scope": "class", "assigned_class": current_user.get("class_id")}
    elif role == "admin":
        scope_data = {"scope": "global"}
    else:
        raise HTTPException(403, "Insufficient permissions")

    topic_dict = topic_in.dict() | scope_data | {"created_by": current_user["id"]}
    
    result = await db.topics.insert_one(topic_dict)
    topic_dict["id"] = str(result.inserted_id)
    
    return TopicResponse(**topic_dict)

async def get_visible_topics(current_user=Depends(get_current_user)):
    db = get_db()
    # Implement role-based filtering logic here (similar to earlier example)
    # ...
    pass