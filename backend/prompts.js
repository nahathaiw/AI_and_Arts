
export const identityPrompts = {
  present: {
    title: "The Present Self",
    prompt:
      "A raw, unedited, high-resolution DSLR studio headshot of the exact same young East Asian man in the reference photo. Do not change his face. Meticulously preserve his physical appearance: his lean jawline, the exact shape of his warm brown eyes with double eyelids, his natural straight nose, his friendly closed-mouth smile, his thick black hair with textured bangs sweeping down across his forehead, and the distinct small dark mole on his lower right cheek near the jawline. Captured with an 85mm f/2.8 prime lens. Neutral studio grey background, soft, professional diffused key lighting, showing organic skin pores and natural, un-airbrushed facial textures."
  },

  childhood: {
    title: "The Childhood Self",
    prompt:
      "A nostalgic, warm color-toned vintage film photograph from the late 1990s, depicting the exact same East Asian individual from the reference image, reimagined as a 6-year-old child. Meticulously preserve the core facial structure, the shape of the double-eyelid eyes, and the nose bridge from the base image. Adjust his cheeks to be softer and rounder for childhood, and style his thick black hair into a natural, slightly messy childhood bowl cut with soft bangs. He is wearing a casual, simple 90s cotton t-shirt, smiling warmly at the camera. Soft natural lighting, authentic organic film grain, looking like a real scanned family album photograph."
  },

  elderly: {
    title: "The Elderly Self",
    prompt:
      "A highly dignified, intimate close-up photographic portrait of the exact same East Asian man from the reference photo, realistically aged to 78 years old. Meticulously preserve his underlying facial identity: keep his exact skull proportions, nose bridge shape, jawline structure, and the small dark mole on his lower right cheek. Render realistic, elegant aging details—delicate wrinkles around his eyes and brow, soft silver-white hair and eyebrows, and thin smile lines around his lips. Dressed in a simple, high-quality knitted neutral-colored sweater. Studio portrait lighting, shallow depth of field, sharp focus on his wise, weathered eyes, completely photorealistic."
  },

  professor: {
    title: "The Professor Self",
    prompt:
      "A professional editorial portrait photograph of the exact same East Asian man from the reference image, appearing in his late 30s as a university professor. Meticulously preserve his facial proportions, his double-eyelid eyes, his friendly smile, his neat black bangs, and the distinct small mole on his lower right cheek. He is wearing thin, stylish dark-rimmed glasses and a tailored charcoal tweed blazer over a light-colored collar shirt. Set inside a naturally lit, softly out-of-focus academic office with bookshelves in the background. Natural window side-lighting, professional corporate photography style, sharp focus on his eyes."
  },

  football: {
    title: "The Football Player Self",
    prompt:
      "An intense, athletic close-up portrait photograph of the exact same East Asian man from the reference photo, reimagined as a professional football player. Meticulously lock and preserve his exact facial bone structure, jawline, eye shape, and the small mole on his lower right cheek. His expression is focused and determined, with his textured black bangs slightly damp with sweat. He is wearing a dark, professional athletic jersey. Shot on a stadium training field at night under brilliant floodlights, high-contrast dramatic sports photography style with a shallow depth of field."
  },

  gender: {
    title: "The Gender-Switched Self",
    prompt:
      "A clean, respectful, and completely natural photographic portrait of an alternate gender presentation of the exact same East Asian individual from the reference image. Meticulously preserve the underlying bone structure, the jawline, the straight nose, and the exact double-eyelid eye shape from the reference face, but adapt his features with long, softly layered, natural black hair. Dressed in a simple, high-quality white crewneck sweater. Captured in a bright studio with soft, diffused daytime lighting, showcasing natural skin texture without any heavy makeup or airbrushing."
  },

  artist: {
    title: "The Artist Self",
    prompt:
      "A documentary-style cinematic portrait photograph of the exact same East Asian man from the reference image working as an independent creative painter. Meticulously preserve his distinct facial features, his jawline, his thick black bangs, and the small mole on his lower right cheek. He is wearing a comfortable, dark canvas work shirt with subtle, organic paint smudges. Shot inside a bright, sunlit art studio with canvases and brushes softly out of focus in the background. Natural warm side-lighting, organic and realistic human skin texture."
  },

  business: {
    title: "The Business Self",
    prompt:
      "A premium, professional corporate headshot photograph of the exact same East Asian man from the reference photo, appearing as a confident young business executive. Meticulously preserve his facial identity, his double eyelids, his neat black hair with textured bangs, and the small mole on his lower right cheek. He is wearing a custom-tailored dark navy business suit with a crisp white shirt. Shot inside a modern office with floor-to-ceiling windows showing a softly blurred city skyline. Sharp, professional studio lighting, realistic and high-resolution skin details."
  }
};

export const identityConcepts = {
  present: "raw realistic present-day studio portrait",
  childhood: "nostalgic late-1990s childhood family album portrait",
  elderly: "dignified elderly close-up portrait with realistic aging",
  professor: "late-30s university professor editorial portrait",
  football: "professional football player dramatic sports portrait",
  gender: "alternate visible gender presentation studio portrait",
  artist: "independent creative painter documentary studio portrait",
  business: "young business executive professional corporate portrait"
};

const ANALYSIS_FIELDS = [
  "jawline",
  "eyes",
  "nose",
  "smile",
  "hair",
  "skinTone",
  "presentation",
  "marks"
];

const ANALYSIS_FALLBACKS = {
  jawline: "not clearly visible",
  eyes: "not clearly visible",
  nose: "not clearly visible",
  smile: "not clearly visible",
  hair: "not clearly visible",
  skinTone: "natural visible skin tone from the reference image",
  presentation: "neutral visible presentation",
  marks: "no clearly visible distinguishing marks"
};

function cleanAnalysisValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[{}<>]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240)
    .trim();
}

export function hasValidCustomAnalysis(customAnalysis) {
  if (!customAnalysis || typeof customAnalysis !== "object") {
    return false;
  }

  return ANALYSIS_FIELDS.some((field) => cleanAnalysisValue(customAnalysis[field]).length > 0);
}

export function sanitizeAnalysis(customAnalysis = {}) {
  return ANALYSIS_FIELDS.reduce((analysis, field) => {
    const sanitizedValue = cleanAnalysisValue(customAnalysis[field]);

    analysis[field] = sanitizedValue || ANALYSIS_FALLBACKS[field];

    return analysis;
  }, {});
}

export function getCompiledPrompt(identityId, customAnalysis) {
  const selectedIdentity = identityPrompts[identityId];

  if (!selectedIdentity) {
    return "";
  }

  if (!hasValidCustomAnalysis(customAnalysis)) {
    return selectedIdentity.prompt;
  }

  const concept = identityConcepts[identityId] || selectedIdentity.title;
  const analysis = sanitizeAnalysis(customAnalysis);

  return [
    `Create a polished, high-quality photographic portrait for the AI art project "The Many Lives of One Face."`,
    `Identity concept: ${concept}.`,
    "Use the attached face image as the visual source of truth and preserve the same person's visible facial identity.",
    "User-provided visible feature analysis to preserve:",
    `- Jawline / face shape: ${analysis.jawline}`,
    `- Eyes: ${analysis.eyes}`,
    `- Nose: ${analysis.nose}`,
    `- Smile / mouth: ${analysis.smile}`,
    `- Hair: ${analysis.hair}`,
    `- Visible skin tone and texture: ${analysis.skinTone}`,
    `- Visible styling presentation only: ${analysis.presentation}`,
    `- Distinguishing visible marks: ${analysis.marks}`,
    "Safety and representation rules:",
    "- The presentation field describes only visible styling such as masculine, feminine, androgynous, neutral, or not clearly visible.",
    "- Never infer or state actual gender identity, race, ethnicity, nationality, ancestry, or other protected identity traits from the image.",
    "- If a requested concept conflicts with the uploaded face, preserve the uploaded face and only transform clothing, setting, age styling, lighting, expression, and art direction.",
    "- Keep the result respectful, natural, photorealistic, centered as a portrait, and consistent with a unified gallery series."
  ].join("\n");
}
