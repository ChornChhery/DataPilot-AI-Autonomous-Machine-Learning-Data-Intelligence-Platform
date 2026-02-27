import os
import uuid
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from app.models.schemas import UploadResponse
from app.core.config import settings
from app.core.database import get_db
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are supported.")

    session_id = str(uuid.uuid4())
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(settings.UPLOAD_DIR, f"{session_id}.csv")

    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit.")

    with open(filepath, "wb") as f:
        f.write(contents)

    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        raise HTTPException(422, f"Failed to parse CSV: {e}")

    db = get_db()
    await db.analyses.insert_one({
        "session_id": session_id,
        "filename": file.filename,
        "filepath": filepath,
        "shape": list(df.shape),
        "columns": df.columns.tolist(),
        "status": "pending",
        "progress": 0,
        "current_step": "Awaiting analysis",
        "logs": [],
        "created_at": datetime.utcnow(),
    })

    return UploadResponse(
        session_id=session_id,
        filename=file.filename,
        columns=df.columns.tolist(),
        shape=list(df.shape),
        preview=df.head(5).fillna("").to_dict(orient="records"),
    )