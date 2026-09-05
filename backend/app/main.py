from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os

from .core.config import settings
from .core.database import init_db
from .models import *

logging.basicConfig(level=logging.INFO if settings.DEBUG else logging.WARNING)
logger = logging.getLogger("kalaabackend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting KALAA backend...")
    init_db()
    from app.services.ai import AIServiceFactory
    from app.services.blockchain import get_blockchain_service
    from app.services.payments import get_payment_service
    logger.info(f"AI Provider: {AIServiceFactory.is_mock_mode() and 'mock' or settings.AI_PROVIDER}")
    logger.info(f"Blockchain: {get_blockchain_service().get_network_name()}")
    logger.info(f"Payment Provider: {get_payment_service().get_provider()}")
    logger.info("KALAA backend started successfully.")
    yield
    logger.info("Shutting down KALAA backend...")


app = FastAPI(
    title="KALAA - AI-Powered Artisan Marketplace",
    description="AI-powered marketplace for Indian artisans and handmade physical artworks.",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else [settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

import sys
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.makedirs(os.path.join(backend_dir, "uploads"), exist_ok=True)
_static_dir = os.path.join(backend_dir, "uploads")
app.mount("/uploads", StaticFiles(directory=_static_dir), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}

@app.get(f"{settings.API_V1_STR}")
async def api_info():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI-powered marketplace for Indian artisans",
        "endpoints": {
            "auth": f"{settings.API_V1_STR}/auth",
            "artworks": f"{settings.API_V1_STR}/artworks",
            "orders": f"{settings.API_V1_STR}/orders",
            "admin": f"{settings.API_V1_STR}/admin",
            "b2b": f"{settings.API_V1_STR}/b2b",
            "dashboard": f"{settings.API_V1_STR}/dashboard",
            "verify": f"{settings.API_V1_STR}/verify",
            "categories": f"{settings.API_V1_STR}/categories",
        },
        "blockchain": "mock" if settings.BLOCKCHAIN_PROVIDER == "mock" else settings.BLOCKCHAIN_PROVIDER,
        "ai": "mock" if settings.AI_PROVIDER == "mock" else settings.AI_PROVIDER,
    }
