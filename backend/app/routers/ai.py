from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import AIService
from app.utils.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["Aarogya AI Assistant"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with Aarogya AI health assistant",
)
async def chat_with_aarogya(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """Conversational endpoint with Aarogya AI persona.

    Accepts the user message and optional conversation history, evaluates context,
    and returns empathetic health and wellness guidance with medical disclaimer.
    """
    history_dicts = [
        {"role": m.role, "content": m.content}
        for m in payload.conversation_history
    ]

    user_name = current_user.profile.full_name if current_user.profile else "Valued Member"
    reply = await AIService.chat(
        message=payload.message,
        conversation_history=history_dicts,
        user_name=user_name,
    )

    return ChatResponse(
        reply=reply,
        timestamp=datetime.now(timezone.utc),
    )
