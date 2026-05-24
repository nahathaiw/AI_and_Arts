import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { fileURLToPath } from "url";
import { getCompiledPrompt } from "./prompts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const ANALYSIS_MODEL =
  process.env.GEMINI_ANALYSIS_MODEL || "gemini-2.5-flash";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const FACE_ANALYSIS_FIELDS = [
  "jawline",
  "eyes",
  "nose",
  "smile",
  "hair",
  "marks"
];

const FACE_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: FACE_ANALYSIS_FIELDS.reduce((properties, field) => {
    properties[field] = { type: Type.STRING };
    return properties;
  }, {}),
  required: FACE_ANALYSIS_FIELDS,
  propertyOrdering: FACE_ANALYSIS_FIELDS
};

const IDENTITY_TITLES = {
  present: "The Present Self",
  childhood: "The Childhood Self",
  elderly: "The Elderly Self",
  professor: "The Professor Self",
  football: "The Football Player Self",
  gender: "The Gender-Switched Self",
  artist: "The Artist Self",
  business: "The Business Self"
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.json({
    message: "Many Lives of One Face Gemini backend is running."
  });
});

app.post("/api/analyze-face", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Missing GEMINI_API_KEY. Face analysis is unavailable."
      });
    }

    const imageData = parseImageDataUrl(req.body?.imageBase64);

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: "Please provide a PNG or JPEG imageBase64 data URL."
      });
    }

    const analysisPrompt = `Analyze only visible facial features useful for artistic likeness preservation.

Return ONLY this JSON object:
{
  "jawline": "description",
  "eyes": "description",
  "nose": "description",
  "smile": "description",
  "hair": "description",
  "marks": "description"
}

Rules:
- Do not identify the person.
- Do not infer race, ethnicity, nationality, ancestry, gender identity, age, attractiveness, health, or personality.
- If something is unclear, write "not clearly visible".
- Return only valid JSON.`;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: [
        { text: analysisPrompt },
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.base64Data
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: FACE_ANALYSIS_SCHEMA
      }
    });

    let parsedAnalysis;

    try {
      parsedAnalysis = JSON.parse(getResponseText(response));
    } catch (error) {
      console.error("Face analysis JSON parse error:", error);

      return res.status(502).json({
        success: false,
        error: "Face analysis response was not valid JSON."
      });
    }

    res.json({
      success: true,
      faceAnalysis: validateFaceAnalysis(parsedAnalysis)
    });
  } catch (error) {
    console.error("Gemini face analysis error:", error);

    res.status(500).json({
      success: false,
      error: "Face analysis failed. Please try another PNG or JPEG image."
    });
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const {
      identityId = "present",
      customAnalysis = null,
      referenceImageBase64 = null,
      uploadedFaceBase64 = null,
      genderOptions = null
    } = req.body || {};

    if (!identityId) {
      return res.status(400).json({
        success: false,
        error: "Missing identityId."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        fallback: true,
        error: "Missing GEMINI_API_KEY. Showing curated gallery image instead."
      });
    }

    const contents = [];
    const uploadedReferenceImage = parseImageDataUrl(
      referenceImageBase64 || uploadedFaceBase64
    );
    const effectiveCustomAnalysis = uploadedReferenceImage
      ? customAnalysis
      : null;
    const compiledPrompt = getCompiledPrompt(
      identityId,
      effectiveCustomAnalysis,
      {
        genderOptions
      }
    );

    if (uploadedReferenceImage) {
      contents.push({
        inlineData: {
          mimeType: uploadedReferenceImage.mimeType,
          data: uploadedReferenceImage.base64Data
        }
      });
    } else {
      const baseFacePath = path.join(__dirname, "base_face.png");

      if (!fs.existsSync(baseFacePath)) {
        return res.status(500).json({
          success: false,
          fallback: true,
          error: "Base face image not found in backend folder."
        });
      }

      const imageBuffer = fs.readFileSync(baseFacePath);
      const base64Image = imageBuffer.toString("base64");

      contents.push({
        inlineData: {
          mimeType: "image/png",
          data: base64Image
        }
      });
    }

    contents.push({ text: compiledPrompt });

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents,
      config: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    });

    const generatedImage = extractGeneratedImage(response);

    if (!generatedImage) {
      return res.status(500).json({
        success: false,
        fallback: true,
        error: "Gemini did not return an image part. Using fallback curated asset."
      });
    }

    res.json({
      success: true,
      provider: "gemini",
      model: IMAGE_MODEL,
      title: IDENTITY_TITLES[identityId] || IDENTITY_TITLES.present,
      promptUsed: compiledPrompt,
      imageUrl: generatedImage.imageUrl,
      image: generatedImage.imageUrl
    });

  } catch (error) {
    console.error("Gemini generation error:", error);

    res.status(500).json({
      success: false,
      fallback: true,
      error: "Live Gemini generation failed. Showing curated gallery image instead."
    });
  }
});

function parseImageDataUrl(imageBase64) {
  if (typeof imageBase64 !== "string") {
    return null;
  }

  const match = imageBase64.match(
    /^data:(image\/png|image\/jpeg);base64,([A-Za-z0-9+/=\s]+)$/i
  );

  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2].replace(/\s/g, "");

  const base64Pattern =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  if (!base64Data || !base64Pattern.test(base64Data)) {
    return null;
  }

  return {
    mimeType,
    base64Data
  };
}

function validateFaceAnalysis(value) {
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};

  return FACE_ANALYSIS_FIELDS.reduce((analysis, field) => {
    const fieldValue = source[field];
    const trimmedValue =
      typeof fieldValue === "string" ? fieldValue.trim() : "";

    analysis[field] = trimmedValue || "not clearly visible";

    return analysis;
  }, {});
}

function getResponseText(response) {
  if (typeof response?.text === "string") {
    return response.text.trim();
  }

  const parts = response?.candidates?.[0]?.content?.parts || [];

  return parts
    .map((part) => part.text || "")
    .join("")
    .trim();
}

function extractGeneratedImage(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (imagePart) {
    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const imageBase64 = imagePart.inlineData.data;

    return {
      imageUrl: `data:${mimeType};base64,${imageBase64}`
    };
  }

  const legacyImage = response?.data?.image;

  if (typeof legacyImage === "string" && legacyImage.startsWith("data:")) {
    return {
      imageUrl: legacyImage
    };
  }

  if (legacyImage?.data) {
    const mimeType = legacyImage.mimeType || "image/png";

    return {
      imageUrl: `data:${mimeType};base64,${legacyImage.data}`
    };
  }

  return null;
}

app.listen(PORT, () => {
  console.log(`Gemini backend running at http://localhost:${PORT}`);
});
