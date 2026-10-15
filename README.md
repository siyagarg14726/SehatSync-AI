# SehatSync-AI: Integrated Predictive Wellness & Connected Care Ecosystem

SehatSync AI is an integrated, AI-powered personal health platform bridging the gap between predictive wellness intelligence, personalized nutrition and lifestyle planning, and connected healthcare coordination.

## Architectural Layers
- **Backend**: FastAPI (Python 3.13) + Async SQLAlchemy + SQLite/PostgreSQL
- **AI Engine**: Google Gemini API via `google-genai` SDK with clinical heuristic fallbacks
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS (Healthcare Emerald/Teal Theme) + Recharts + Lucide Icons + TanStack Query
- **Architecture**: Modular Monorepo (`backend/` and `frontend/`)

## Modules
1. **RakshakAI**: Predictive wellness intelligence (stress, sleep, fatigue, mood tracking, biometrics trends & explainable AI recommendations).
2. **AI Nutrition & Lifestyle**: Personalized meal planning, hydration logger, habit tracking, and budget-aware recommendations.
3. **CareSync**: Healthcare management, medications, prescriptions, appointments, and caregiver consent management.
4. **Conversational Assistant (Aarogya)**: Empathic health guidance with transparent disclaimers.

## Project Structure
```
Aarogya360-AI/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── api/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```
