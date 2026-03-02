import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateAssistantReply(messageInEnglish) {
  if (!client) {
    return `Demo mode: I received your message - "${messageInEnglish}".`;
  }

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are LinguaAI, a concise and helpful multilingual assistant. Keep answers short and clear."
      },
      { role: "user", content: messageInEnglish }
    ],
    temperature: 0.6
  });

  return completion.choices[0]?.message?.content?.trim() || "I could not generate a response.";
}
