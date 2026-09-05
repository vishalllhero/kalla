from fastapi import APIRouter

from .routes.auth import router as auth_router
from .routes.artworks import router as artworks_router
from .routes.orders import router as orders_router
from .routes.admin import router as admin_router
from .routes.b2b import router as b2b_router
from .routes.verify import router as verify_router
from .routes.dashboard import router as dashboard_router
from .routes.categories import router as categories_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(artworks_router, prefix="/artworks", tags=["artworks"])
api_router.include_router(orders_router, prefix="/orders", tags=["orders"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
api_router.include_router(b2b_router, prefix="/b2b", tags=["b2b"])
api_router.include_router(verify_router, prefix="/verify", tags=["verification"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(categories_router, prefix="/categories", tags=["categories"])
