import logging
import traceback
from datetime import datetime
from app.core.database import get_db
from app.modules.data_understanding import analyze_dataset, detect_problem_type
from app.modules.data_cleaning import clean_dataset
from app.modules.feature_engineering import engineer_features
from app.modules.statistical_analysis import run_statistics
from app.modules.model_training import train_models
from app.modules.model_evaluation import evaluate_and_select

logger = logging.getLogger(__name__)

async def _log(session_id, message, progress, step):
    db = get_db()
    logger.info(f"[{session_id}] [{step}] {message}")
    await db.analyses.update_one(
        {"session_id": session_id},
        {"$set": {"progress": progress, "current_step": step},
         "$push": {"logs": f"[{step}] {message}"}},
    )

async def run_pipeline(session_id: str, target_column: str):
    db = get_db()
    try:
        doc = await db.analyses.find_one({"session_id": session_id})
        filepath = doc["filepath"]

        await _log(session_id, "Loading dataset...", 5, "Data Understanding")
        df, dataset_info = analyze_dataset(filepath)
        problem_type = detect_problem_type(df, target_column)
        dataset_info["problem_type"] = problem_type
        await db.analyses.update_one(
            {"session_id": session_id},
            {"$set": {"dataset_info": dataset_info, "problem_type": problem_type}},
        )
        await _log(session_id, f"Problem type: {problem_type}. Shape: {df.shape}", 10, "Data Understanding")

        await _log(session_id, "Cleaning data...", 15, "Data Cleaning")
        df_clean = clean_dataset(df, target_column)
        await _log(session_id, f"Clean shape: {df_clean.shape}", 25, "Data Cleaning")

        await _log(session_id, "Engineering features...", 30, "Feature Engineering")
        X, y, feature_names = engineer_features(df_clean, target_column, problem_type)
        await _log(session_id, f"Features: {len(feature_names)}", 40, "Feature Engineering")

        await _log(session_id, "Running statistics...", 45, "Statistical Analysis")
        stats, corr_matrix = run_statistics(df_clean, target_column)
        await db.analyses.update_one(
            {"session_id": session_id},
            {"$set": {"statistics": stats, "correlation_matrix": corr_matrix}},
        )
        await _log(session_id, "Statistics complete.", 55, "Statistical Analysis")

        await _log(session_id, f"Training models...", 60, "Model Training")
        trained_models = train_models(X, y, problem_type)
        await _log(session_id, f"Trained {len(trained_models)} models.", 80, "Model Training")

        await _log(session_id, "Evaluating models...", 85, "Model Evaluation")
        best_model, metrics, feature_importance = evaluate_and_select(
            trained_models, X, y, feature_names, problem_type
        )
        await _log(session_id, f"Best model: {best_model}", 100, "Model Evaluation")

        await db.analyses.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": "completed",
                "best_model": best_model,
                "model_metrics": metrics,
                "feature_importance": feature_importance,
                "completed_at": datetime.utcnow(),
            }},
        )

    except Exception as exc:
        logger.error(f"[{session_id}] Pipeline failed: {traceback.format_exc()}")
        await db.analyses.update_one(
            {"session_id": session_id},
            {"$set": {"status": "failed", "error": str(exc)}},
        )