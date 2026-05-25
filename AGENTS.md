# AGENTS.md

## Project

This repository contains an interactive AI art project called **The Many Lives of One Face**.

The app presents one face across eight imagined identities. It combines curated portrait assets with live Gemini image generation, optional uploaded-face analysis, compare view, session history, and portrait downloads.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- AI API: Gemini via `@google/genai`
- Styling: Plain CSS in `frontend/src/styles.css`

## Repository Layout

- `frontend/src/App.jsx` contains the main UI state and API orchestration.
- `frontend/src/data/identities.js` defines the eight identity personas and curated image paths.
- `frontend/src/styles.css` contains the app styling.
- `frontend/public/images/` contains the curated portraits and default base face.
- `backend/server.js` defines the Express API, Gemini calls, upload parsing, and CORS config.
- `backend/prompts.js` defines base prompts and prompt compilation.
- `backend/base_face.png` is the default backend reference image for generation.
- `backend/.env.example` documents the required backend environment variables.

## Important Rules

- Do not rewrite existing base-face prompts in `backend/prompts.js` unless explicitly asked.
- If `customAnalysis` is `null`, `getCompiledPrompt()` must return the original prompt exactly.
- Do not add `skinTone`, `gender`, or `presentation` to `customAnalysis`.
- `customAnalysis` must only use `jawline`, `eyes`, `nose`, `smile`, `hair`, and `marks`.
- Uploaded-face generation must send the uploaded image as `referenceImageBase64` to the backend.
- Keep uploaded-face analysis focused on visual likeness preservation only.
- Do not infer or store sensitive attributes from uploaded faces.
- Do not use Tailwind unless it is already configured.
- Use plain CSS in `frontend/src/styles.css`.
- Keep edits scoped; avoid unrelated redesigns or prompt rewrites.

## Commands

Install dependencies from the repository root:

```bash
npm install
npm run install:all
```

Run frontend and backend together from the repository root:

```bash
npm run dev
```

Run only the backend from the repository root:

```bash
npm run backend
```

Run only the frontend from the repository root:

```bash
npm run frontend
```

Run backend directly:

```bash
cd backend
npm run dev
```

Run frontend directly:

```bash
cd frontend
npm run dev
```

Build the frontend:

```bash
cd frontend
npm run build
```

## Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5050`
- Health check: `http://localhost:5050/api/health`

## Environment

Create `backend/.env` from `backend/.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_ANALYSIS_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
FRONTEND_URL=http://localhost:5173
PORT=5050
```

For deployed frontend builds, set:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

## API Notes

- `GET /` returns a basic backend status message.
- `GET /api/health` returns JSON health status.
- `POST /api/analyze-face` accepts `imageBase64` as a PNG or JPEG data URL and returns only `jawline`, `eyes`, `nose`, `smile`, `hair`, and `marks`.
- `POST /api/generate` accepts `identityId`, optional `customAnalysis`, optional `referenceImageBase64`, and optional `genderOptions`.
- Generation should gracefully fall back to curated frontend images when Gemini fails.

## Verification Checklist

After code changes, verify the relevant parts:

- Frontend starts with `npm run frontend` or `npm run dev`.
- Backend starts with `npm run backend` or `npm run dev`.
- `http://localhost:5050/api/health` returns success.
- Identity selection swaps the displayed curated portrait.
- `Generate` calls the backend and either displays a generated image or a curated fallback.
- Face upload accepts PNG/JPEG files under 8MB and rejects other inputs.
- Uploaded-face generation sends `referenceImageBase64`.
- Gender-Switched Self target toggle still works.
- Compare View, Download Portrait, and Save to History still work.

## Deployment Notes

Backend deployment is expected to use the `backend` folder as the service root. Frontend deployment is expected to use the `frontend` folder as the Vite app root.

Set backend `FRONTEND_URL` to the deployed frontend origin to avoid CORS issues. Set frontend `VITE_API_BASE_URL` to the deployed backend URL.
