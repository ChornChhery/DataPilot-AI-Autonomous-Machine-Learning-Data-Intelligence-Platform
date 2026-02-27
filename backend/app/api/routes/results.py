from fastapi import APIRouter, HTTPException
from app.core.database import get_db

router = APIRouter()

@router.get("/results/{session_id}")
async def get_results(session_id: str):
    db = get_db()
    doc = await db.analyses.find_one({"session_id": session_id}, {"_id": 0, "filepath": 0})
    if not doc:
        raise HTTPException(404, "Session not found.")
    if doc.get("status") != "completed":
        raise HTTPException(202, "Analysis not yet completed.")
    return doc