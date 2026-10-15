from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.wellness import router as wellness_router
from app.routers.nutrition import router as nutrition_router
from app.routers.caresync import router as caresync_router
from app.routers.ai import router as ai_router

__all__ = [
    "auth_router",
    "users_router",
    "wellness_router",
    "nutrition_router",
    "caresync_router",
    "ai_router",
]
