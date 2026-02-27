from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "AutoML Agent Platform"
    DEBUG: bool = False
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "datapilot"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    UPLOAD_DIR: str = "/uploads"
    MAX_FILE_SIZE_MB: int = 100
    CV_FOLDS: int = 5
    TEST_SIZE: float = 0.2
    RANDOM_STATE: int = 42

    class Config:
        env_file = ".env"

settings = Settings()