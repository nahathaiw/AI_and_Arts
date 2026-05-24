# The Many Lives of One Face — Starter Code

This is a VS Code starter project for a hybrid AI art demo:

- Static curated gallery with 8 pre-generated portraits
- One live AI generation button using a backend API
- Safe fallback to curated images if live generation fails

## 1. Open in VS Code

Unzip this folder, then open the folder named:

```txt
many-lives-one-face-starter
```

in VS Code.

## 2. Install dependencies

Open the VS Code terminal and run:

```bash
npm install
npm run install:all
```

## 3. Add your API key

Go to:

```txt
backend/.env.example
```

Duplicate it and rename the copy to:

```txt
backend/.env
```

Then replace:

```env
OPENAI_API_KEY=replace_this_with_your_api_key
```

with your real API key.

Do not upload `.env` to GitHub.

## 4. Replace placeholder images

Replace the placeholder images inside:

```txt
frontend/public/images/
```

with your actual images:

```txt
base_face.png
01_present_self.png
02_childhood_self.png
03_elderly_self.png
04_professor_self.png
05_football_player_self.png
06_gender_switched_self.png
07_artist_self.png
08_business_self.png
```

Also replace this backend file with the same base face:

```txt
backend/base_face.png
```

## 5. Run the project

From the root folder, run:

```bash
npm run dev
```

You should see:

- Backend: http://localhost:5050
- Frontend: usually http://localhost:5173

Open the frontend URL in your browser.

## 6. How the demo works

1. Click one of the 8 identity buttons.
2. The curated portrait appears immediately.
3. Click **Generate New Version**.
4. The frontend sends the selected identity to the backend.
5. The backend sends the base face and prompt to the image API.
6. The generated image appears.
7. If generation fails, the app shows the curated image instead.

## 7. Files you will edit most

```txt
frontend/src/data/identities.js
backend/prompts.js
frontend/public/images/
backend/base_face.png
```

## 8. Presentation explanation

You can say:

> The gallery mode shows the curated final AI artworks. The live generation button demonstrates the real-time AI workflow. If the API is slow or fails, the website falls back to the curated version, because the final artwork depends on artistic selection, not only live generation.
