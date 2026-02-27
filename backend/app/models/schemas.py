from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ProblemType(str, Enum):
    classification = "classification"
    regression = "regression"

class AnalysisStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"

class UploadResponse(BaseModel):
    session_id: str
    filename: str
    columns: List[str]
    shape: List[int]
    preview: List[Dict]

class AnalyzeRequest(BaseModel):
    session_id: str
    target_column: str

class ModelMetrics(BaseModel):
    model_name: str
    accuracy: Optional[float] = None
    f1_score: Optional[float] = None
    roc_auc: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    cv_mean: float
    cv_std: float
    train_time_sec: float
    
    class Config:
        protected_namespaces = ()

class StatusResponse(BaseModel):
    session_id: str
    status: AnalysisStatus
    progress: int
    current_step: str
    logs: List[str]
    error: Optional[str] = None