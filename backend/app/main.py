from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, init_db
from app.routers import (
    ai_router,
    auth_router,
    caresync_router,
    nutrition_router,
    users_router,
    wellness_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown events."""
    # If using SQLite locally, auto-create schema tables for quick development
    if "sqlite" in settings.DATABASE_URL:
        await init_db()
    yield
    # Gracefully dispose database connection pool on shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Aarogya360 AI is an integrated personal health and wellness platform. "
        "Modules include RakshakAI (daily wellness & trend analysis), Nutrition & Lifestyle "
        "(AI meal planning, hydration, habit tracking), CareSync (medications, prescriptions, "
        "appointments, caregiver access), and Aarogya AI Conversational Health Assistant."
    ),
    lifespan=lifespan,
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS configuration
origins = settings.BACKEND_CORS_ORIGINS
if "*" in origins:
    allow_origins = ["*"]
else:
    allow_origins = origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(wellness_router, prefix=settings.API_V1_STR)
app.include_router(nutrition_router, prefix=settings.API_V1_STR)
app.include_router(caresync_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health Check"])
async def root():
    """Root endpoint verifying API operational status."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health", tags=["Health Check"])
async def health():
    """Health check endpoint for container orchestrators and monitoring."""
    return {
        "status": "healthy",
        "gemini_configured": bool(
            settings.GEMINI_API_KEY
            and settings.GEMINI_API_KEY != "your_gemini_api_key_here"
        ),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
