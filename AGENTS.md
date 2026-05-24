# AGENTS.md

## Project
This is an interactive AI art project called "The Many Lives of One Face."

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- AI API: Gemini via @google/genai

## Important Rules
- Do not rewrite existing base-face prompts in backend/prompts.js.
- If customAnalysis is null, getCompiledPrompt() must return the original prompt exactly.
- Do not add skinTone, gender, or presentation to customAnalysis.
- customAnalysis must only use jawline, eyes, nose, smile, hair, and marks.
- Uploaded-face generation must send the uploaded image as referenceImageBase64 to the backend.
- Do not use Tailwind unless it is already configured.
- Use plain CSS in src/styles.css.

## Commands
Frontend:
npm run dev

Backend:
npm run dev
