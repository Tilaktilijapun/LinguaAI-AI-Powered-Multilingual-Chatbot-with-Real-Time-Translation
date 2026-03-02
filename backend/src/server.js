import "dotenv/config";
import cors from "cors";
import express from "express";
import { initChatStore, listChatHistory, saveChat } from "./db/chatStore.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generateAssistantReply } from "./services/aiService.js";
import {
  detectLanguage,
  isSupportedLanguage,
  listSupportedLanguages,
  translateText
} from "./services/languageService.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/languages", (_req, res) => {
  res.json({ languages: listSupportedLanguages() });
});

app.get("/api/history", async (_req, res, next) => {
  try {
    const history = await listChatHistory(30);
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

app.post("/api/chat", async (req, res, next) => {
  try {
    const { message, preferredLanguage } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const detectedLanguage = detectLanguage(message, preferredLanguage || "en");
    const sourceLanguage = isSupportedLanguage(detectedLanguage) ? detectedLanguage : "en";

    const messageInEnglish = await translateText(message, sourceLanguage, "en");
    const assistantReplyInEnglish = await generateAssistantReply(messageInEnglish);
    const assistantReply = await translateText(assistantReplyInEnglish, "en", sourceLanguage);

    const payload = {
      userMessage: message,
      sourceLanguage,
      normalizedMessage: messageInEnglish,
      assistantReply,
      assistantReplyInEnglish,
      createdAt: new Date()
    };

    await saveChat(payload);

    res.json({
      sourceLanguage,
      translatedToEnglish: messageInEnglish,
      assistantReplyInEnglish,
      assistantReply
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

initChatStore()
  .catch((error) => {
    console.error("Failed to initialize chat store", error);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`LinguaAI backend running on port ${PORT}`);
    });
  });
