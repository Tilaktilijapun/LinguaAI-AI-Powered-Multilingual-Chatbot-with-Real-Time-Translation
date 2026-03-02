# LinguaAI — AI Powered Multilingual Chatbot

LinguaAI is a full-stack multilingual chatbot project that supports **English, Nepali, and Hindi**. It demonstrates API chaining by detecting message language, translating to English, generating an AI response, and translating back to the original language.

## Tech stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **AI:** OpenAI API (with demo mode fallback if no key)
- **Translation:** Language service abstraction (can be replaced with external translation APIs)
- **Database:** MongoDB (optional), in-memory fallback if not configured

## Features implemented

- User selects language and sends message from chat UI (text or voice input where supported).
- Backend language detection and multilingual flow:
  1. Detect source language.
  2. Translate input to English.
  3. Send to AI model.
  4. Translate AI response back to source language.
- Chat history endpoint + persistence (MongoDB or in-memory fallback).
- Dark purple gradient chat UI with recent chat history panel.
- Optional voice reply (text-to-speech) for assistant responses.

## Project structure

- `frontend/` — React client
- `backend/` — Express API and services

## Quick start

### 1) Install dependencies

```bash
npm run install:all
```

### 2) Configure environment

Create `backend/.env` (optional but recommended):

```env
PORT=4000
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=linguaai
NODE_ENV=development
```

If `OPENAI_API_KEY` is missing, the app runs in demo mode with a placeholder AI response.
If `MONGODB_URI` is missing, chat history is stored in-memory.

### 3) Run backend + frontend

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## API endpoints

- `GET /api/languages` — supported language list
- `GET /api/history` — recent chat history
- `POST /api/chat` — multilingual chatbot flow

### POST `/api/chat` body

```json
{
  "message": "नमस्ते",
  "preferredLanguage": "ne"
}
```

## Resume booster concepts covered

- API chaining
- Middleware and centralized error handling
- Async orchestration across services
- Third-party API integration patterns
- Multi-language processing logic
- Optional DB logging
