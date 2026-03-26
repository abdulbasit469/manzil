# AI Career Counselor (FYP — NLP layer)

## Behavior

1. **FAQ + keywords** — Fast, accurate answers for common questions.
2. **Token overlap (Jaccard)** — Light-weight NLP when keywords are weak; supports mixed English / Roman Urdu tokens.
3. **Google Gemini** — When no good FAQ match and `GEMINI_API_KEY` is set, the model answers using `chatbotKnowledgeBase.js` as grounded context (no invented merit lists or fees).

## Environment

Add to project **root** `.env` (same file as `npm run dev` uses):

```env
GEMINI_API_KEY=your_api_key
# Optional override if a model name changes:
# GEMINI_MODEL=gemini-1.5-flash
```

Aliases also accepted: `GOOGLE_AI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`.

## API

- `GET /api/chatbot/faq` — includes `aiCounselorEnabled: boolean`
- `GET /api/chatbot/status` — same flag
- `POST /api/chatbot/ask` — response includes `source`: `faq` | `ai` | `fallback`, and `aiAvailable`

## Files

- `backend/services/careerCounselorAI.js` — Gemini client
- `backend/data/chatbotKnowledgeBase.js` — RAG-style Manzil context
- `backend/data/chatbotFAQ.js` — FAQ + `getAnswerWithMeta`
- `backend/controllers/chatbotController.js` — pipeline
