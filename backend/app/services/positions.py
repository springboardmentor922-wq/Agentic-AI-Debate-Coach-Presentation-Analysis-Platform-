from fastapi import HTTPException
from app.db.mongodb import get_db
from app.schemas.session import PositionAssignment

async def assign_positions(session_id: str, assignment: PositionAssignment, current_user):
    db = get_db()
    session = await db.sessions.find_one({"_id": session_id})
    
    if not session:
        raise HTTPException(404, "Session not found")
    
    # Role check: only coach/educator can pre-assign
    if current_user["role"] not in ["coach", "educator", "admin"]:
        raise HTTPException(403, "Only moderators can assign positions")
    
    await db.sessions.update_one(
        {"_id": session_id},
        {"$set": {"positions": assignment.positions}}
    )
    return {"status": "positions updated"}