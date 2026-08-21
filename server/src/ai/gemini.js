import { GoogleGenAI } from '@google/genai';

const getAi = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};
const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

async function withRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      const isRateLimit = err.message && (err.message.includes('503') || err.message.includes('429') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE') || err.message.includes('Resource has been exhausted'));
      if (isRateLimit && attempt < maxRetries) {
        console.log(`[AI Retry] Attempt ${attempt} failed with rate limit/503. Retrying in ${attempt * 2}s...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      } else {
        throw err;
      }
    }
  }
}

export async function generateWithImage(imageBase64, mimeType, textPrompt, responseSchema) {
  const response = await withRetry(() => getAi().models.generateContent({
    model,
    contents: [
      { inlineData: { mimeType, data: imageBase64 } },
      { text: textPrompt }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema
    }
  }));
  return JSON.parse(response.text);
}

export async function generateText(textPrompt, responseSchema) {
  const response = await withRetry(() => getAi().models.generateContent({
    model,
    contents: [{ text: textPrompt }],
    config: {
      responseMimeType: 'application/json',
      responseSchema
    }
  }));
  return JSON.parse(response.text);
}

export async function generateWithMultipleImages(images, textPrompt, responseSchema) {
  const contents = images.map(img => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 }
  }));
  contents.push({ text: textPrompt });
  
  const response = await withRetry(() => getAi().models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: 'application/json',
      responseSchema
    }
  }));
  return JSON.parse(response.text);
}

export { getAi as ai };
