from fastapi import APIRouter, HTTPException
from app.core.database import get_db
from app.models.schemas import StatusResponse

router = APIRouter()

@router.get("/status/{session_id}", response_model=StatusResponse)
async def get_status(session_id: str):
    db = get_db()
    doc = await db.analyses.find_one({"session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Session not found.")
    return StatusResponse(
        session_id=session_id,
        status=doc.get("status", "pending"),
        progress=doc.get("progress", 0),
        current_step=doc.get("current_step", ""),
        logs=doc.get("logs", []),
        error=doc.get("error"),
    )