const SUPPORTED_LANGUAGES = {
  en: "English",
  ne: "Nepali",
  hi: "Hindi"
};

const LANGUAGE_HINTS = {
  ne: ["छ", "तिमी", "कसरी", "नमस्ते", "हो", "गर्न"],
  hi: ["है", "नमस्ते", "कैसे", "क्या", "मैं", "आप"]
};

export function isSupportedLanguage(code) {
  return Object.hasOwn(SUPPORTED_LANGUAGES, code);
}

export function listSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

export function detectLanguage(text, fallback = "en") {
  const lowered = text.toLowerCase();

  for (const [language, hints] of Object.entries(LANGUAGE_HINTS)) {
    if (hints.some((hint) => lowered.includes(hint))) {
      return language;
    }
  }

  return fallback;
}

const translationMap = {
  "ne->en": {
    "नमस्ते": "hello",
    "तिमीलाई कस्तो छ": "how are you"
  },
  "hi->en": {
    "नमस्ते": "hello",
    "आप कैसे हैं": "how are you"
  }
};

export async function translateText(text, from, to) {
  if (from === to) return text;

  const directKey = `${from}->${to}`;
  const reverseKey = `${to}->${from}`;

  if (translationMap[directKey]?.[text]) {
    return translationMap[directKey][text];
  }

  const reverseEntry = Object.entries(translationMap[reverseKey] || {}).find(([, value]) => value === text);

  if (reverseEntry) {
    return reverseEntry[0];
  }

  return `[${to}] ${text}`;
}
