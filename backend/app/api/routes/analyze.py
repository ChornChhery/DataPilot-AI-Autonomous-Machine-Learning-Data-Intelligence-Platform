import logging
from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.models.schemas import AnalyzeRequest
from app.core.database import get_db
from app.agents.orchestrator import run_pipeline

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze")
async def start_analysis(payload: AnalyzeRequest, background_tasks: BackgroundTasks):
    db = get_db()
    session = await db.analyses.find_one({"session_id": payload.session_id})
    if not session:
        raise HTTPException(404, "Session not found. Upload a CSV first.")
    if session["status"] == "running":
        raise HTTPException(409, "Analysis already running.")

    await db.analyses.update_one(
        {"session_id": payload.session_id},
        {"$set": {"status": "running", "target_column": payload.target_column, "progress": 0}},
    )
    background_tasks.add_task(run_pipeline, payload.session_id, payload.target_column)
    return {"session_id": payload.session_id, "message": "Analysis started."}