# The Many Lives of One Face

An interactive AI art project that uses one face as the anchor for eight imagined lives. The gallery combines curated portrait images with live Gemini generation, allowing the viewer to move between a stable final artwork and newly generated variations.

The project was built for an AI and art final project by Yang Yu-An, 111006211.

## Project Concept

The Many Lives of One Face explores how identity can shift across time, memory, profession, gender presentation, ambition, and creative self-image while still remaining connected to one recognizable visual source.

Instead of treating the face as a fixed identity, the app uses it as a starting point. A viewer can select a persona, compare it against the reference portrait, generate a new AI version, upload their own face, and save temporary results during the session.

## Features

- Eight identity personas with curated portrait artwork
- Live Gemini image generation through a Node/Express backend
- Optional face upload with Gemini-based likeness analysis
- Reference image support for uploaded-face generation
- Gender-switched target look toggle for masculine or feminine versions
- Compare view for reference portrait and transformed portrait
- Session history for saved portraits
- Portrait download button
- Fallback behavior that shows curated images when live generation fails
- Deployment-ready frontend/backend environment configuration

## Identity Personas

1. Present Self
2. Childhood Self
3. Elderly Self
4. Professor Self
5. Football Player Self
6. Gender-Switched Self
7. Artist Self
8. Business Self

## Tech Stack

- Frontend: React, Vite, Axios
- Backend: Node.js, Express
- AI API: Gemini through `@google/genai`
- Styling: Plain CSS in `frontend/src/styles.css`

## Project Structure

```text
.
├── backend/
│   ├── server.js              # Express API and Gemini integration
│   ├── prompts.js             # Persona prompts and prompt compilation
│   ├── base_face.png          # Default backend reference image
│   ├── .env.example           # Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app state and API calls
│   │   ├── main.jsx           # React entry point
│   │   ├── styles.css         # Plain CSS styling
│   │   ├── data/
│   │   │   └── identities.js  # Identity metadata and curated image paths
│   │   └── components/
│   │       ├── Gallery.jsx
│   │       └── IdentityCard.jsx
│   ├── public/
│   │   ├── images/            # Curated portraits and base face
│   │   ├── manifest.webmanifest
│   │   └── sw.js
│   └── package.json
├── package.json               # Root scripts for both apps
├── STARTUP.md                 # Short startup guide
└── README.md
```

## First-Time Setup

Install root, frontend, and backend dependencies:

```bash
npm install
npm run install:all
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_ANALYSIS_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
FRONTEND_URL=http://localhost:5173
PORT=5050
```

## Running Locally

Start frontend and backend together:

```bash
npm run dev
```

The app will run at:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5050`
- Health check: `http://localhost:5050/api/health`

You can also start each app separately:

```bash
npm run backend
npm run frontend
```

Or use the helper scripts:

```bash
./start-dev.sh
start-dev.bat
```

## How to Use the App

1. Open the frontend at `http://localhost:5173`.
2. Choose one of the eight identity personas.
3. Use the curated portrait as the stable artwork.
4. Click `Generate` to create a new Gemini version.
5. Optionally upload a PNG or JPEG face image to generate from a custom reference.
6. Use Compare View to see the base face and transformed face side by side.
7. Download the current portrait or save it to the session history.

Uploaded images are sent to the backend as `referenceImageBase64` for generation. The backend also analyzes uploaded faces through `/api/analyze-face` and only keeps feature descriptors needed for likeness preservation.

## API Endpoints

### `GET /`

Basic backend status endpoint.

```json
{
  "message": "Many Lives of One Face Gemini backend is running."
}
```

### `GET /api/health`

Deployment and local health check.

```json
{
  "success": true,
  "message": "Backend is running"
}
```

### `POST /api/analyze-face`

Analyzes an uploaded face image for visual features used in prompt compilation.

Request:

```json
{
  "imageBase64": "data:image/png;base64,..."
}
```

Successful response:

```json
{
  "success": true,
  "faceAnalysis": {
    "jawline": "...",
    "eyes": "...",
    "nose": "...",
    "smile": "...",
    "hair": "...",
    "marks": "..."
  }
}
```

### `POST /api/generate`

Generates a portrait for the selected identity.

Request:

```json
{
  "identityId": "professor",
  "customAnalysis": null,
  "referenceImageBase64": null,
  "genderOptions": null
}
```

Successful response:

```json
{
  "success": true,
  "provider": "gemini",
  "model": "gemini-2.5-flash-image",
  "title": "The Professor Self",
  "promptUsed": "...",
  "image": "data:image/png;base64,..."
}
```

Fallback response:

```json
{
  "success": false,
  "fallback": true,
  "error": "Live Gemini generation failed. Showing curated gallery image instead."
}
```

## Deployment

### Backend on Render

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_ANALYSIS_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
FRONTEND_URL=https://your-frontend.vercel.app
PORT=5050
```

### Frontend on Vercel

- Root Directory: `frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

If `VITE_API_BASE_URL` is not set, the frontend uses `http://localhost:5050` on localhost and the configured Render backend in deployed environments.

## Important Development Notes

- Do not rewrite the existing base-face prompts in `backend/prompts.js`.
- If `customAnalysis` is `null`, `getCompiledPrompt()` must return the original prompt exactly.
- `customAnalysis` must only contain `jawline`, `eyes`, `nose`, `smile`, `hair`, and `marks`.
- Do not add `skinTone`, `gender`, or `presentation` to `customAnalysis`.
- Uploaded-face generation must send the uploaded image as `referenceImageBase64`.
- Do not add Tailwind CSS unless it is already configured.
- Keep styling in `frontend/src/styles.css`.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `GEMINI_API_KEY` missing | Copy `backend/.env.example` to `backend/.env` and add your key |
| Frontend cannot reach backend | Make sure the backend is running on `http://localhost:5050` |
| Uploaded image is rejected | Use a PNG or JPEG under 8MB |
| Live generation fails | Check the Gemini key/model values; the app will show curated fallback art |
| CORS error in deployment | Set `FRONTEND_URL` to the deployed frontend URL |
| Images do not load | Confirm files exist in `frontend/public/images/` and `backend/base_face.png` |

## Presentation Notes

For a class demo, start with the curated gallery as the finished artwork. Then show live generation as an interactive extension of the concept:

1. Select one persona and explain what identity shift it represents.
2. Toggle Compare View to show the relationship between reference and transformation.
3. Generate a new version to demonstrate the AI pipeline.
4. Upload a different face if you want to show how the project can adapt to another participant.
5. Save or download a result to show the session archive workflow.

## License

This project is for educational use. If you use a real person's face, make sure you have permission to use and transform that image.
