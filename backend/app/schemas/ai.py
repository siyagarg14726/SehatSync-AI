from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'model' / 'assistant'", examples=["user"])
    content: str = Field(..., min_length=1, examples=["What are some good ways to reduce cortisol levels?"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, examples=["How can I improve my sleep quality?"])
    conversation_history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    disclaimer: str = (
        "Aarogya is an AI health companion, not a licensed medical professional. "
        "Any advice provided is for informational and educational purposes only. "
        "Always consult a qualified healthcare provider for diagnosis or medical treatment."
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)
