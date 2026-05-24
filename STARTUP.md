# 🚀 How to Start the Project

## The Quick Way (Recommended)

### macOS/Linux/WSL:
```bash
./start-dev.sh
```

### Windows:
```batch
start-dev.bat
```

Or simply:
```bash
npm run dev
```

---

## Available Commands

### Start Both (Recommended)
```bash
npm run dev
```
- Starts backend on `http://localhost:5050`
- Starts frontend on `http://localhost:5173`

### Start Only Backend
```bash
npm run backend
```

### Start Only Frontend
```bash
npm run frontend
```

### Install Dependencies (First Time)
```bash
npm install
npm run install:all
```

---

## First-Time Setup Checklist

- [ ] Run `npm install && npm run install:all`
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Add your Gemini API key to `backend/.env`
- [ ] Replace images in `frontend/public/images/`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173 in your browser

---

## Troubleshooting

### Port 5050 or 5173 already in use?
Edit `backend/.env`:
```env
PORT=5051  # Change to a free port
```

### Module not found?
```bash
npm install
npm run install:all
```

### Backend not responding?
Make sure you see:
```
Gemini backend running at http://localhost:5050
```

### Images not loading?
Check that all files exist:
- `frontend/public/images/base_face.png`
- `frontend/public/images/0[1-8]_*.png`
- `backend/base_face.png`

### API errors?
Check your `backend/.env`:
```env
GEMINI_API_KEY=your_actual_key_here
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

---

## Project URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5050
- **API Test**: http://localhost:5050/ (should return JSON)

---

## Keyboard Shortcuts

While running:
- `Ctrl+C` — Stop servers
- `Ctrl+Shift+C` — Stop in Windows batch script

---

Happy developing! 🎨
