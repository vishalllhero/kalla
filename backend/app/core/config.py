import os
import uuid as _uuid
from typing import Optional

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseSettings
    class SettingsConfigDict(dict):
        pass

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_NAME: str = "KALAA"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # API
    API_V1_STR: str = "/api/v1"
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kalaamvp.db")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "kalaadev")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "kalaa_secure_password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "kalaa")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Platform Fee
    PLATFORM_FEE_PERCENT: float = float(os.getenv("PLATFORM_FEE_PERCENT", "5.0"))
    B2B_FEE_PERCENT: float = float(os.getenv("B2B_FEE_PERCENT", "3.0"))
    SECONDARY_SALE_FEE_PERCENT: float = float(os.getenv("SECONDARY_SALE_FEE_PERCENT", "2.0"))

    # AI Services (mock by default)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")
    AI_IMAGE_MODEL: str = os.getenv("AI_IMAGE_MODEL", "mock")
    AI_CATALOG_MODEL: str = os.getenv("AI_CATALOG_MODEL", "mock")
    AI_PRICING_MODEL: str = os.getenv("AI_PRICING_MODEL", "mock")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    GOOGLE_CLOUD_API_KEY: Optional[str] = os.getenv("GOOGLE_CLOUD_API_KEY")

    # Blockchain
    BLOCKCHAIN_PROVIDER: str = os.getenv("BLOCKCHAIN_PROVIDER", "mock")
    BLOCKCHAIN_NETWORK: str = os.getenv("BLOCKCHAIN_NETWORK", "KALAA Testnet (Mock)")
    RPC_URL: str = os.getenv("RPC_URL", "http://localhost:8545")
    PRIVATE_KEY: str = os.getenv("PRIVATE_KEY", "")
    CONTRACT_ADDRESS: str = os.getenv("CONTRACT_ADDRESS", "")
    CHAIN_ID: int = int(os.getenv("CHAIN_ID", "1337"))

    # Storage
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local")
    LOCAL_STORAGE_PATH: str = os.getenv("LOCAL_STORAGE_PATH", "uploads")
    IPFS_GATEWAY: str = os.getenv("IPFS_GATEWAY", "https://ipfs.io")

    # Security
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", str(5 * 1024 * 1024)))
    ALLOWED_IMAGE_TYPES: set = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Demo Credentials
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@kalaamarket.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Admin@123")
    ARTISAN_EMAIL: str = os.getenv("ARTISAN_EMAIL", "artisan1@kalaamarket.com")
    ARTISAN_PASSWORD: str = os.getenv("ARTISAN_PASSWORD", "Artisan@123")
    BUYER_EMAIL: str = os.getenv("BUYER_EMAIL", "buyer1@kalaamarket.com")
    BUYER_PASSWORD: str = os.getenv("BUYER_PASSWORD", "Buyer@123")


    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    def is_mock_mode(self) -> bool:
        return (
            self.AI_PROVIDER == "mock"
            and self.BLOCKCHAIN_PROVIDER == "mock"
            and not self.OPENAI_API_KEY
            and not self.PRIVATE_KEY
        )


settings = Settings()
