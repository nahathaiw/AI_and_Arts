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
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp"
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
// Increased JSON limit to accommodate larger base64 exchanges safely
app.use(express.json({ limit: "20mb" }));

// 2. Instantiate the correct Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

function getBase64Size(base64Data) {
  const normalizedData = base64Data.replace(/\s/g, "");
  const padding = normalizedData.endsWith("==")
    ? 2
    : normalizedData.endsWith("=")
      ? 1
      : 0;

  return Math.floor((normalizedData.length * 3) / 4) - padding;
}

function parseImageDataUrl(imageDataUrl) {
  if (typeof imageDataUrl !== "string") {
    throw new Error("Missing uploaded image.");
  }

  const match = imageDataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([a-zA-Z0-9+/=\s]+)$/);

  if (!match) {
    throw new Error("Upload must be a PNG, JPEG, or WebP data URL.");
  }

  const [, mimeType, rawBase64Data] = match;
  const data = rawBase64Data.replace(/\s/g, "");

  if (!SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error("Unsupported image type.");
  }

  if (getBase64Size(data) > MAX_UPLOAD_BYTES) {
    throw new Error("Uploaded image is larger than 8MB.");
  }

  return {
    mimeType,
    data,
    imageBase64: `data:${mimeType};base64,${data}`
  };
}

function getDefaultReferenceImage() {
  const baseFacePath = path.join(__dirname, "base_face.png");

  if (!fs.existsSync(baseFacePath)) {
    throw new Error("Base face image not found in backend folder.");
  }

  const imageBuffer = fs.readFileSync(baseFacePath);

  return {
    mimeType: "image/png",
    data: imageBuffer.toString("base64"),
    source: "default"
  };
}

function getReferenceImage(customAnalysis) {
  if (customAnalysis?.imageBase64) {
    return {
      ...parseImageDataUrl(customAnalysis.imageBase64),
      source: "upload"
    };
  }

  return getDefaultReferenceImage();
}

app.get("/", (req, res) => {
  res.json({
    message: "Many Lives of One Face Gemini backend is running."
  });
});

app.post("/api/analyze-face", (req, res) => {
  try {
    const referenceImage = parseImageDataUrl(req.body.imageBase64);

    res.json({
      success: true,
      faceAnalysis: {
        imageBase64: referenceImage.imageBase64,
        mimeType: referenceImage.mimeType,
        source: "upload"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Could not read uploaded image."
    });
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const { identityId, customAnalysis } = req.body;

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

    let referenceImage;

    try {
      referenceImage = getReferenceImage(customAnalysis);
    } catch (error) {
      return res.status(500).json({
        success: false,
        fallback: true,
        error: error.message || "Could not load the reference face image."
      });
    }

    // 2. Build the instruction prompt
    const finalPrompt = `
      You are an artistic AI collaborator. Create a polished, high-quality digital art portrait based on this concept:
      
      "${selectedIdentity.prompt}"
      
      Visual reference instructions:
      - Use the attached face image as the visual reference to guide the core facial bone structure, proportions, and identity.
      - If the concept prompt describes demographic details, hair, marks, or facial features that conflict with the attached image, treat the attached image as the source of truth.
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
            mimeType: referenceImage.mimeType,
            data: referenceImage.data
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
      referenceSource: referenceImage.source,
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
