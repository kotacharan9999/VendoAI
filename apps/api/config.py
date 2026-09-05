import json
from decimal import Decimal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: str = "development"
    APP_NAME: str = "Vendo AI"
    APP_PORT: int = 8000
    SECRET_KEY: str = "vendo-ai-super-secret-key-change-in-production-min-32-chars-long"
    API_V1_STR: str = "/api"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/vendo_ai"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/vendo_ai"

    REDIS_URL: str = "redis://localhost:6379/0"

    AI_PROVIDER: str = "mock"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    STORAGE_PROVIDER: str = "local"
    STORAGE_PATH: str = "./storage"

    CORS_ORIGINS: list[str] | str = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8000",
        "https://vendo-ai-web.vercel.app",
        "https://kotacharan9999.github.io",
        "https://vendo-ai-backend.onrender.com",
    ]

    AUTO_PURCHASE_ENABLED: bool = False
    MAX_NEGOTIATION_ROUNDS: int = 4
    MINIMUM_MARGIN: Decimal = Decimal("0.25")
    TARGET_MARGIN: Decimal = Decimal("0.35")
    AUTO_APPROVAL_LIMIT: Decimal = Decimal(50000)
    HUMAN_APPROVAL_LIMIT: Decimal = Decimal(200000)
    MONTHLY_BUDGET: Decimal = Decimal(1500000)
    MINIMUM_SUPPLIER_RATING: Decimal = Decimal("3.8")
    MAXIMUM_SUPPLIER_RISK: Decimal = Decimal(60)
    MINIMUM_QUOTES: int = 2

    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def parse_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                v = v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and "+asyncpg" not in v:
                v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @field_validator("DATABASE_URL_SYNC", mode="before")
    @classmethod
    def parse_database_url_sync(cls, v: str) -> str:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                v = v.replace("postgres://", "postgresql://", 1)
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: list[str] | str) -> list[str]:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()
