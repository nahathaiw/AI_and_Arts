
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

const analysisFields = [
  "jawline",
  "eyes",
  "nose",
  "smile",
  "hair",
  "marks"
];

const analysisFallbacks = {
  jawline: "natural visible face shape",
  eyes: "natural visible eye shape",
  nose: "natural visible nose shape",
  smile: "natural visible expression",
  hair: "natural visible hairstyle",
  marks: "no clearly visible distinct marks"
};

const dynamicPromptConcepts = {
  present:
    "A raw, unedited, high-resolution DSLR studio headshot of the uploaded person as their present self. Preserve the exact same face, same identity, same visible presentation, same natural complexion, and same facial structure. Neutral studio background, soft professional diffused lighting, natural skin texture.",

  childhood:
    "A nostalgic warm-toned childhood portrait of the uploaded person reimagined as a child version of the same person. Preserve recognizable identity cues from the uploaded face. Do not recast the person as a different child. Keep the same visible ancestry/complexion and facial identity. Only make age-related changes such as softer cheeks and younger proportions. Warm family album feeling, natural film grain.",

  elderly:
    "A realistic elderly portrait of the uploaded person. Preserve the same skull proportions, eyes, nose, face shape, natural complexion, and distinct marks. Only add natural aging details such as wrinkles, mature facial texture, and aged hair. Elegant studio portrait lighting.",

  professor:
    "A professional university professor portrait of the uploaded person. Preserve the same face, visible presentation, natural complexion, and identity. Only change clothing, glasses if appropriate, lighting, and academic office setting.",

  football:
    "An intense athletic football player portrait of the uploaded person. Preserve the same face, visible presentation, natural complexion, and identity. Only change clothing, expression intensity, stadium lighting, and sports setting.",

  gender:
    "A respectful alternate gender-presentation portrait of the uploaded person. This is the only identity allowed to alter gender presentation. Do not claim or infer actual gender identity. Preserve the underlying face structure, natural complexion, eyes, nose, jawline, and identity marks. Natural, realistic, respectful studio portrait.",

  artist:
    "A documentary-style creative painter portrait of the uploaded person. Preserve the same face, visible presentation, natural complexion, and identity. Only change clothing, art studio setting, lighting, and creative styling.",

  business:
    "A premium corporate portrait of the uploaded person. Preserve the same face, visible presentation, natural complexion, and identity. Only change suit/clothing, office setting, and lighting."
};

const dynamicIdentityAnchor = `Use the uploaded reference image as the primary identity anchor.
Preserve the exact same person from the uploaded reference image.
Do not replace the face with a new person.
Do not change the core facial structure.
Do not change the person's visible racial or ethnic appearance.
Do not change the person's natural complexion.
Do not change the person's visible gender presentation, except only for the gender identity card.
Preserve the same recognizable eyes, nose, jawline, facial proportions, hairstyle family, and distinct marks.
Only transform age, clothing, lighting, setting, mood, and persona.
Photorealistic portrait.
Natural skin texture.
No cartoon, no anime, no exaggerated beautification.
No face replacement.
No random new person.`;

export function getCompiledPrompt(identityId, customAnalysis = null) {
  const selectedIdentityId = identityPrompts[identityId] ? identityId : "present";

  if (!hasValidCustomAnalysis(customAnalysis)) {
    return identityPrompts[selectedIdentityId].prompt;
  }

  const analysis = sanitizeAnalysis(customAnalysis);
  const concept = dynamicPromptConcepts[selectedIdentityId];

  return `${concept}

${dynamicIdentityAnchor}

Uploaded face analysis:
Jawline / face shape: ${analysis.jawline}
Eyes: ${analysis.eyes}
Nose: ${analysis.nose}
Smile / expression: ${analysis.smile}
Hair: ${analysis.hair}
Distinct marks: ${analysis.marks}`;
}

function hasValidCustomAnalysis(customAnalysis) {
  if (
    !customAnalysis ||
    typeof customAnalysis !== "object" ||
    Array.isArray(customAnalysis)
  ) {
    return false;
  }

  return analysisFields.some((field) => {
    const value = customAnalysis[field];

    if (typeof value !== "string") {
      return false;
    }

    return sanitizeAnalysisValue(value).length > 0;
  });
}

function sanitizeAnalysis(customAnalysis) {
  return analysisFields.reduce((analysis, field) => {
    const value = customAnalysis[field];
    const sanitizedValue =
      typeof value === "string" ? sanitizeAnalysisValue(value) : "";

    analysis[field] = sanitizedValue || analysisFallbacks[field];

    return analysis;
  }, {});
}

function sanitizeAnalysisValue(value) {
  return value.replace(/[{}<>]/g, "").trim().slice(0, 240);
}
