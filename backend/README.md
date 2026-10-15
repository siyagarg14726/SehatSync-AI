# Aarogya360 AI — FastAPI Backend

**Aarogya360 AI** is an integrated personal health and wellness platform built with Python 3.11+, FastAPI, async PostgreSQL (SQLAlchemy 2.0 + asyncpg), Alembic migrations, and Google Gemini AI.

---

## 🏗️ Architecture & Features

### 1. RakshakAI — Wellness Module
- **Daily Wellness Check-In**: Track stress (1–10), sleep hours, fatigue (1–10), mood (1–10), and personal notes with high-precision timestamps.
- **Trend Analysis**: `GET /api/v1/wellness/trends?days=7` or `days=30` returns rolling averages and daily trend coordinates for graphical charting.
- **Explainable AI Insights**: `POST /api/v1/wellness/insights` analyzes historical logs using Google Gemini AI with explainable wellness factors and actionable lifestyle recommendations.

### 2. Nutrition & Lifestyle Module
- **Dietary Profile**: Manage dietary habits (`veg`, `vegan`, `non-veg`), food allergies/intolerances, fitness goals (`weight-loss`, `muscle-gain`, `maintenance`), and daily budget.
- **AI Weekly Meal Plan**: `POST /api/v1/nutrition/meal-plans/generate` utilizes Gemini AI to design a 7-day budget-aware meal plan (breakfast, lunch, dinner, snacks, and grocery list).
- **Hydration Tracker**: Log glasses of water daily with dynamic targets and rolling intake history.
- **Habit Tracker**: Define wellness habits, mark daily completion, and track consecutive day streaks.

### 3. CareSync Module
- **Medications**: Track medicine regimens (dosage, frequency, start/end dates, reminder times, and special instructions).
- **Prescriptions**: Upload and organize prescription metadata (filename, doctor name, date, clinical notes, document URLs).
- **Appointments**: Schedule and manage consultations with doctors and specialists (date/time, clinic location, status tracking).
- **Caregivers**: Add trusted family members or caregivers by email with granular consent toggles.

### 4. Auth & User Profile
- **JWT Authentication**: Passwords hashed with bcrypt; stateless JWT bearer tokens.
- **User Profile**: Full name, age, gender, phone number, and preferred language (`en`, `hi`, `es`, etc.).

### 5. Aarogya AI Conversational Assistant
- **Empathetic Health Chat**: `POST /api/v1/ai/chat` powered by Google Gemini AI with conversational memory.
- **Medical Safety Guardrail**: Operates under strict system instructions:
  > *"You are Aarogya, a helpful health assistant for the Aarogya360 AI platform. Provide helpful, empathetic wellness guidance. Always clarify you are not a doctor and recommendations should be discussed with healthcare professionals."*
- **Offline / Zero-Key Fallback**: If `GEMINI_API_KEY` is not provided or API limits are reached, the system gracefully delivers heuristic wellness guidance without crashing.

---

## 📁 Directory Structure

```
backend/
├── alembic/
│   ├── versions/            # Database migration versions
│   ├── env.py               # Async Alembic environment configuration
│   └── script.py.mako       # Migration template
├── app/
│   ├── __init__.py
│   ├── config.py            # Pydantic-settings configuration (.env loader)
│   ├── database.py          # Async SQLAlchemy engine & session maker
│   ├── main.py              # FastAPI app, CORS middleware, routers
│   ├── models/              # SQLAlchemy 2.0 ORM models
│   │   ├── __init__.py
│   │   ├── user.py          # User, UserProfile
│   │   ├── wellness.py      # WellnessCheckIn
│   │   ├── nutrition.py     # DietaryProfile, MealPlan, HydrationLog, Habit, HabitLog
│   │   └── caresync.py      # Medication, Prescription, Appointment, Caregiver
│   ├── schemas/             # Pydantic v2 validation schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── wellness.py
│   │   ├── nutrition.py
│   │   ├── caresync.py
│   │   └── ai.py
│   ├── routers/             # API endpoint handlers
│   │   ├── __init__.py
│   │   ├── auth.py          # /auth/register, /auth/login
│   │   ├── users.py         # /users/me, /users/me/profile
│   │   ├── wellness.py      # /wellness/check-in, /wellness/trends, /wellness/insights
│   │   ├── nutrition.py     # /nutrition/profile, /nutrition/meal-plans, /nutrition/hydration, /nutrition/habits
│   │   ├── caresync.py      # /caresync/medications, /caresync/prescriptions, /caresync/appointments, /caresync/caregivers
│   │   └── ai.py            # /ai/chat
│   ├── services/            # Business logic and external integrations
│   │   ├── __init__.py
│   │   ├── auth_service.py  # JWT encoding/decoding, bcrypt password hashing
│   │   └── ai_service.py    # Google Gemini AI integration with heuristic fallbacks
│   └── utils/
│       ├── __init__.py
│       └── deps.py          # get_db, get_current_user dependencies
├── .env.example
├── alembic.ini              # Alembic root config
├── requirements.txt         # Production dependencies
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.11+
- PostgreSQL database (or SQLite for local lightweight testing)

### 2. Environment Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update the values in `.env`:
```env
PROJECT_NAME="Aarogya360 AI"
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/aarogya360
SECRET_KEY=your_generated_secret_key_here
GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
GEMINI_MODEL=gemini-1.5-flash
```

*(Note: For instant local testing without PostgreSQL, set `DATABASE_URL=sqlite+aiosqlite:///./aarogya360.db`)*

### 4. Database Migrations
Initialize database schema using Alembic:
```bash
# Create initial migration
alembic revision --autogenerate -m "Initial Aarogya360 schema"

# Apply migrations
alembic upgrade head
```

### 5. Run the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **Interactive Swagger UI**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **ReDoc Documentation**: [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user + profile | No |
| `POST` | `/api/v1/auth/login` | Login and obtain JWT token | No |
| `GET` | `/api/v1/users/me` | Current user & profile info | Yes |
| `PUT` | `/api/v1/users/me/profile` | Update profile information | Yes |
| `POST` | `/api/v1/wellness/check-in` | Record daily stress, sleep, fatigue, mood | Yes |
| `GET` | `/api/v1/wellness/check-ins` | List chronological check-ins | Yes |
| `GET` | `/api/v1/wellness/trends` | 7-day or 30-day wellness averages & chart data | Yes |
| `POST` | `/api/v1/wellness/insights` | AI-generated explainable wellness analysis | Yes |
| `GET` | `/api/v1/nutrition/profile` | Get dietary profile & goals | Yes |
| `POST` | `/api/v1/nutrition/profile` | Create or update dietary preferences & budget | Yes |
| `POST` | `/api/v1/nutrition/meal-plans/generate` | Generate weekly meal plan via Gemini AI | Yes |
| `GET` | `/api/v1/nutrition/meal-plans` | List saved meal plans | Yes |
| `POST` | `/api/v1/nutrition/hydration` | Log glasses of water consumed | Yes |
| `GET` | `/api/v1/nutrition/hydration/today` | Today's water intake status | Yes |
| `POST` | `/api/v1/nutrition/habits` | Create new wellness habit | Yes |
| `GET` | `/api/v1/nutrition/habits` | List habits with today's status & streaks | Yes |
| `POST` | `/api/v1/nutrition/habits/{id}/log` | Mark daily habit completion | Yes |
| `POST` | `/api/v1/caresync/medications` | Add medication & reminder schedule | Yes |
| `GET` | `/api/v1/caresync/medications` | List active medications | Yes |
| `POST` | `/api/v1/caresync/prescriptions` | Upload prescription metadata & notes | Yes |
| `GET` | `/api/v1/caresync/prescriptions` | List user prescriptions | Yes |
| `POST` | `/api/v1/caresync/appointments` | Schedule doctor appointment | Yes |
| `GET` | `/api/v1/caresync/appointments` | List appointments (scheduled/completed) | Yes |
| `POST` | `/api/v1/caresync/caregivers` | Add trusted caregiver with consent | Yes |
| `PATCH` | `/api/v1/caresync/caregivers/{id}/consent`| Toggle caregiver consent | Yes |
| `POST` | `/api/v1/ai/chat` | Conversational Aarogya AI companion | Yes |
