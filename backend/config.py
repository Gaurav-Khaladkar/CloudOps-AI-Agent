"""
CloudOps AI Agent - Configuration Module
"""
import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "CloudOps AI Agent"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AUTO_APPROVE_LOW_RISK: bool = False
    MAX_ALLOWABLE_RISK_SCORE: int = 50
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = "0.0.0.0"

settings = Settings()
