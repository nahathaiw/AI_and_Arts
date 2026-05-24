import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
// 1. Swap OpenAI import for the official Google Gen AI SDK
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";
import { identityPrompts } from "./prompts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
// Increased JSON limit to accommodate larger base64 exchanges safely
app.use(express.json({ limit: "20mb" }));

// 2. Instantiate the correct Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.json({
    message: "Many Lives of One Face Gemini backend is running."
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { identityId } = req.body;

    if (!identityId) {
      return res.status(400).json({
        success: false,
        error: "Missing identityId."
      });
    }

    const selectedIdentity = identityPrompts[identityId];

    if (!selectedIdentity) {
      return res.status(404).json({
        success: false,
        error: "Identity concept not found."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        fallback: true,
        error: "Missing GEMINI_API_KEY. Showing curated gallery image instead."
      });
    }

    const baseFacePath = path.join(__dirname, "base_face.png");

    if (!fs.existsSync(baseFacePath)) {
      return res.status(500).json({
        success: false,
        fallback: true,
        error: "Base face image not found in backend folder."
      });
    }

    // 1. Read the base face image file and extract raw base64 data
    const imageBuffer = fs.readFileSync(baseFacePath);
    const base64Image = imageBuffer.toString("base64");

    // 2. Build the instruction prompt
    const finalPrompt = `
      You are an artistic AI collaborator. Create a polished, high-quality digital art portrait based on this concept:
      
      "${selectedIdentity.prompt}"
      
      Visual reference instructions:
      - Use the attached face image as the visual reference to guide the core facial bone structure, proportions, and identity.
      - Transform the medium, clothing, background, and expression to fully match the concept.
      - Ensure the composition remains a centered portrait suitable for a unified art gallery series.
    `;

    // 3. Initialize the Google Gen AI SDK client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    // 4. Use generateContent with IMAGE response modalities
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
      contents: [
        { text: finalPrompt },
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image
          }
        }
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    });

    // 5. Extract the generated image item parts correctly
    const parts = response?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part) => part.inlineData?.data);

    if (!imagePart) {
      return res.status(500).json({
        success: false,
        fallback: true,
        error: "Gemini did not return an image part. Using fallback curated asset."
      });
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const imageBase64 = imagePart.inlineData.data;

    // 6. Return the data payload exactly how the frontend expects it
    res.json({
      success: true,
      provider: "gemini",
      model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
      title: selectedIdentity.title,
      promptUsed: finalPrompt,
      image: `data:${mimeType};base64,${imageBase64}`
    });

  } catch (error) {
    console.error("Gemini generation error:", error);

    res.status(500).json({
      success: false,
      fallback: true,
      error: "Live Gemini generation failed. Showing curated gallery image instead."
    });
  }
}); // <--- End of app.post

// =========================================================
//  FIX: Added server listener to keep process alive!
// =========================================================
app.listen(PORT, () => {
  console.log(`Gemini backend running at http://localhost:${PORT}`);
});