import io
import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.core.database import get_db

router = APIRouter()

@router.get("/download/{session_id}")
async def download_cleaned_csv(session_id: str):
    """
    Return the cleaned dataset as a downloadable CSV file.
    The cleaned data is reconstructed from the stored dataset info.
    """
    db = get_db()
    doc = await db.analyses.find_one({"session_id": session_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    if doc.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Analysis not completed yet")

    filepath = doc.get("filepath")
    if not filepath:
        raise HTTPException(status_code=404, detail="Original file not found")

    try:
        # Re-run cleaning to get the cleaned dataframe
        from app.modules.data_understanding import analyze_dataset, detect_problem_type
        from app.modules.data_cleaning import clean_dataset

        df, _ = analyze_dataset(filepath)
        target_column = doc.get("target_column", "")
        df_clean = clean_dataset(df, target_column)

        # Stream as CSV
        output = io.StringIO()
        df_clean.to_csv(output, index=False)
        output.seek(0)

        original_name = doc.get("filename", "data").replace(".csv", "")
        download_name = f"{original_name}_cleaned.csv"

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate cleaned CSV: {str(e)}")