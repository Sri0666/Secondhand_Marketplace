import OpenAI from "openai";

export function isAiConfigured() {
  return Boolean(process.env.CLASSGW_KEY && process.env.CLASSGW_BASE_URL && process.env.CLASSGW_MODEL);
}

export function getAiClient() {
  if (!isAiConfigured()) return null;
  return new OpenAI({ apiKey: process.env.CLASSGW_KEY, baseURL: process.env.CLASSGW_BASE_URL });
}

// Future model calls must be made only from server code (API routes/server actions).
// TODO: Semantic retrieval can later enhance catalogue search; do not add vectors yet.
