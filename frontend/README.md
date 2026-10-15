# Aarogya360 AI — Frontend

> **Integrated Personal Health & Clinical AI Platform**  
> Built with React 18, TypeScript, Tailwind CSS, Vite, TanStack Query v5, Zustand, Recharts, and Google Gemini AI Assistant.

---

## 🩺 Overview

**Aarogya360 AI** is a modern, responsive personal health cockpit designed to bridge preventative Ayurvedic lifestyles with clinical healthcare monitoring. It provides:

- **Dashboard (`/`)**: Today's wellness score, quick-actions, 7-day mood/stress trend area chart, upcoming appointments, and daily care plan adherence.
- **RakshakAI (`/wellness`)**: Daily physiological bio-tracking (stress, fatigue, mood, sleep hours, symptoms), automated Gemini AI clinical insights generation, and 30-day longitudinal biometric telemetry charts.
- **Nutrition & Diet (`/nutrition`)**: Dietary profile formulation by archetype (Vegetarian, Vegan, Jain, Eggetarian, etc.), daily INR budget allocation, weekly accordion meal plans, interactive 8-glass hydration tracker, and habit streak tracker.
- **CareSync (`/caresync`)**: 4-tab unified management for active medications (with daily intake toggling), prescription metadata archives, doctor appointment scheduling, and caregiver data consent controls.
- **AI Assistant (`/assistant`)**: Full conversational chat interface powered by Gemini with suggested health prompts, real-time response generation, and clinical disclaimers.
- **Profile (`/profile`)**: Manage personal verified patient credentials, age, gender, emergency phone, and preferred language dialects (English, Hindi, Marathi, etc.).

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18 + TypeScript** | Component architecture with strict type safety |
| **Vite** | Fast, modern frontend build tool and dev server |
| **Tailwind CSS** | Custom health-themed design system (teal, emerald, cyan, slate) |
| **TanStack Query (React Query v5)** | Declarative server-state caching, invalidation, and queries |
| **Zustand** | Global client state management with persistent JWT auth |
| **Axios** | HTTP client configured with JWT Bearer interceptor |
| **Recharts** | Interactive SVG visualizations (Area charts, Line biometrics) |
| **Lucide React** | Cohesive, accessible SVG iconography |
| **React Hot Toast** | Non-intrusive clinical alert notifications |

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.ts           # Axios client with base URL & JWT Bearer token interceptor
│   │   ├── auth.ts            # Authentication & profile endpoints (with offline fallback)
│   │   ├── wellness.ts        # RakshakAI check-ins, 30-day trends & Gemini AI insights
│   │   ├── nutrition.ts       # Meal planning, 8-glass hydration & habit tracking
│   │   ├── caresync.ts        # Medications, prescriptions, appointments & caregiver consent
│   │   └── ai.ts              # Gemini health assistant conversational endpoint
│   ├── components/
│   │   ├── common/
│   │   │   ├── ErrorMessage.tsx    # Styled error alerts with retry triggers
│   │   │   ├── LoadingSpinner.tsx  # Accessible spinning indicator
│   │   │   ├── SliderInput.tsx     # Custom tactile range slider with live feedback
│   │   │   └── StatCard.tsx        # KPI cards with health color themes & trend badges
│   │   └── layout/
│   │       ├── BottomNav.tsx       # Mobile bottom navigation bar
│   │       ├── Header.tsx          # Top bar with patient greeting, notifications & logout
│   │       ├── Layout.tsx          # Root shell coordinating desktop sidebar & mobile nav
│   │       └── Sidebar.tsx         # Desktop navigation sidebar with health status badge
│   ├── hooks/
│   │   └── useAuth.ts         # Authentication helper hook (login, register, logout, profile)
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx           # Sign-in form with 1-click Demo Fill
│   │   │   └── Register.tsx        # Registration with age, gender, name, email
│   │   ├── Assistant.tsx      # AI Assistant chat screen with quick prompt chips
│   │   ├── CareSync.tsx       # 4-tab clinical care hub (Meds, Rx, Appointments, Caregivers)
│   │   ├── Dashboard.tsx      # Central cockpit with telemetry, charts & quick actions
│   │   ├── Nutrition.tsx      # Weekly meal plans, hydration tracker & habit checklist
│   │   ├── Profile.tsx        # Patient demographics & health directive management
│   │   └── Wellness.tsx       # RakshakAI bio-logging, Gemini synthesis & 30-day biometrics
│   ├── store/
│   │   └── authStore.ts       # Zustand store with localStorage persistence
│   ├── types/
│   │   └── index.ts           # Strict TypeScript interfaces for all entities
│   ├── App.tsx                # React Router v6 routing, query client & protected route wrappers
│   ├── index.css              # Tailwind base, components, utilities & custom ranges
│   └── main.tsx               # Application bootstrap
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure [Node.js](https://nodejs.org/) (version 18+) is installed.

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Installation
Install dependencies:
```bash
npm install
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
```
The optimized bundle will be generated in the `dist/` directory.

---

## 🔒 Security & Privacy Notice
All patient biometric feeds and medication schedules are processed in accordance with digital healthcare confidentiality standards.
