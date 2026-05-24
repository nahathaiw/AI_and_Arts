# The Many Lives of One Face

**AI + Art Final Project** — An interactive web gallery showcasing one person's identity through eight different transformations using AI-generated portraiture.

## Project Overview

This project explores identity and multiplicity by transforming a single base face image into eight distinct personas using AI image generation. The gallery features:

- **Curated Gallery**: 8 pre-generated AI portraits representing different identity concepts
- **Live Generation Button**: Real-time Gemini API integration for on-demand generation
- **Fallback Logic**: Graceful degradation to curated images if live generation fails
- **Gemini Backend**: Secure API key management and base64 image processing

### The Eight Identities

1. **Present Self** — You as you are now
2. **Childhood Self** — Your younger self
3. **Elderly Self** — Your future at age 75+
4. **Professor Self** — You as an academic
5. **Football Player Self** — You as an athlete
6. **Gender-Switched Self** — An alternate gender presentation
7. **Artist Self** — You as a creative practitioner
8. **Business Self** — You as a business professional

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Google Gemini API key (free tier available at [ai.google.dev](https://ai.google.dev))

## Running the Project

### Option 1: npm script (easiest)
```bash
npm run dev
```
This starts both frontend and backend simultaneously using `concurrently`.

**Output you'll see:**
```
Frontend: http://localhost:5173
Backend:  http://localhost:5050
```

### Option 2: Standalone shell scripts

**macOS/Linux:**
```bash
./start-dev.sh
```

**Windows:**
```batch
start-dev.bat
```

These scripts will:
- Check for missing dependencies and install them
- Verify that `backend/.env` exists
- Start both servers in parallel

### Option 3: Manual (separate terminals)

**Terminal 1 — Backend:**
```bash
npm run backend
```

**Terminal 2 — Frontend:**
```bash
npm run frontend
```

### Option 4: Individual manual setup

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
npm run dev
```

### First-time setup

1. **Install all dependencies:**
   ```bash
   npm install
   npm run install:all
   ```

2. **Configure your API key:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Then edit `backend/.env` and add your real Gemini API key.

3. **Start development servers:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5050 (API only)

## Project Structure

```
.
├── backend/
│   ├── server.js           # Express + Gemini API integration
│   ├── prompts.js          # 8 identity-specific prompts
│   ├── base_face.png       # Reference image for generation
│   ├── .env                # Gemini API key (not in git)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main state & API orchestration
│   │   ├── main.jsx        # React entry point
│   │   ├── styles.css      # Gallery styling
│   │   ├── data/
│   │   │   └── identities.js    # 8 identities + descriptions
│   │   └── components/
│   │       ├── Gallery.jsx      # Main UI layout
│   │       └── IdentityCard.jsx # Identity button component
│   ├── public/
│   │   └── images/         # 8 curated portraits + base face
│   └── package.json
│
├── package.json            # Root workspace config
└── README.md
```

## Deployment

### Local development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend falls back to `http://localhost:5050` when `VITE_API_BASE_URL` is not set.

### Render backend settings

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment variables:**
```bash
GEMINI_API_KEY=...
GEMINI_ANALYSIS_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
FRONTEND_URL=https://your-frontend.vercel.app
```

### Vercel frontend settings

- **Root Directory:** `frontend`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

**Environment variable:**
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
```

### Deployment testing checklist

- Open the backend health route: `https://your-backend.onrender.com/api/health`
- Open the frontend Vercel URL
- Upload face
- Analyze face
- Generate portrait
- Test Gender-Switched Self toggle
- Save / Compare / Download

## How It Works

### User Workflow

1. **View Gallery** — Open the app, see the base face and all 8 identity buttons
2. **Select Identity** — Click an identity card to see its curated portrait
3. **Generate Live Version** — Click "Generate New Version" to call the Gemini API
4. **View Result** — See the newly generated image or fallback to curated version

### Technical Flow

```
Frontend (React)
    ↓
[User clicks "Generate New Version"]
    ↓
axios POST /api/generate { identityId: "professor" }
    ↓
Backend (Express)
    ├─ Load backend/base_face.png
    ├─ Find prompt for identity
    ├─ Call Gemini API with:
    │  - Detailed artistic prompt
    │  - Base face image as reference
    └─ Return base64 image or error
    ↓
Frontend Display
    ├─ Success? Show generated image
    └─ Failed? Show curated backup + error message
```

## Key Files to Customize

### 1. Update Identity Descriptions
**File:** `frontend/src/data/identities.js`

```javascript
{
  id: "present",
  title: "The Present Self",
  image: "/images/01_present_self.png",
  description: "Your own description here"
}
```

### 2. Refine Generation Prompts
**File:** `backend/prompts.js`

Each identity has a detailed prompt that guides Gemini:
```javascript
present: {
  title: "The Present Self",
  prompt: "Your custom prompt emphasizing what this identity means..."
}
```

### 3. Add Your Images

Replace all placeholder images:
- `frontend/public/images/base_face.png`
- `frontend/public/images/01_present_self.png` through `08_business_self.png`
- `backend/base_face.png` (same as base_face.png)



## Troubleshooting

| Issue | Solution |
|-------|----------|
| `GEMINI_API_KEY not found` | Check that `backend/.env` exists with your actual API key |
| `Cannot find module @google/genai` | Run `npm install` in backend folder |
| `Base face image not found` | Ensure `backend/base_face.png` exists |
| `Frontend can't connect to backend` | Check that backend is running on port 5050 |
| `Gemini returns text instead of image` | Verify model name in `.env`; try `gemini-2.5-flash-image` |
| `CORS errors` | Backend has CORS enabled; ensure frontend URL is trusted |
| `Live generation is slow` | Expected during heavy API load; fallback ensures stability |

## Presentation Tips

### Demo Script

> *"This project explores how a single identity can be multiplied into different possible selves. I started with a base face—my own—and used AI to imagine eight different versions: how I looked as a child, how I might look as an elder, how I appear in different professional contexts. The static gallery shows the curated final artworks that comprise the project. The 'Generate New Version' button demonstrates the real-time Gemini API workflow, showing how AI can remix the same face into new contexts. If live generation is slow or fails, the app gracefully falls back to the curated version, because the artwork prioritizes artistic curation over unpredictable live generation."*

### What to Highlight

1. **Curated vs. Live** — Explain that the gallery is the final artwork; live generation is a bonus demo
2. **Artistic Choice** — Emphasize that you selected the best versions, not just the first AI output
3. **Respecting Consent** — If using a real person's face, note that you have their permission
4. **Technical Integration** — Show the fallback mechanism and error handling
5. **Conceptual Vision** — Connect the eight identities to your personal narrative or artistic statement

## Technology Stack

- **Frontend**: React 18, Vite, Axios
- **Backend**: Node.js, Express, Google GenAI SDK
- **APIs**: Google Gemini Image Generation
- **Styling**: CSS (no frameworks)

## System Requirements

- **Node.js**: 16.x or higher
- **npm**: 7.x or higher
- **Gemini API Key**: Free tier available
- **Browser**: Modern browser with ES6 support
- **RAM**: 512MB+ (for image processing)

## API Endpoints

### GET `/api/health`
Backend health check endpoint for deployment testing.

**Response:**
```json
{
  "success": true,
  "message": "Backend is running"
}
```

### GET `/`
Health check endpoint.

**Response:**
```json
{
  "message": "Many Lives of One Face Gemini backend is running."
}
```

### POST `/api/generate`
Generate a new portrait for the selected identity.

**Request:**
```json
{
  "identityId": "professor"
}
```

**Success Response (200):**
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

**Fallback Response (500):**
```json
{
  "success": false,
  "fallback": true,
  "error": "Live Gemini generation failed. Showing curated gallery image instead."
}
```

## Notes

- The base face image should be a clear, well-lit portrait (ideally a professional headshot)
- Prompts are designed to maintain facial identity while transforming context
- Live generation typically takes 2-10 seconds depending on API load
- The curated gallery is fast (pre-generated images load instantly)

## License

This project is for educational purposes. Please respect copyright and obtain proper permissions before using real people's faces.

## Credits

- **Concept & Design**: Student Project
- **AI Technology**: Google Gemini API
- **Framework**: React + Express 
