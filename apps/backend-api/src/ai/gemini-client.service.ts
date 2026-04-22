import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { aiResponseSchema, retry } from '@market-mind/common';
import { appConfig } from '../config/appConfig.js';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_RETRY_DELAYS_MS = [1000, 2000] as const;

@Injectable()
export class GeminiClientService {
  private readonly logger = new Logger(GeminiClientService.name);

  async generateRecommendation(prompt: string): Promise<string> {
    if (!appConfig.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const ai = new GoogleGenAI({ apiKey: appConfig.geminiApiKey });
    const responseSchema = z.toJSONSchema(aiResponseSchema);

    return retry(
      async () => {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema,
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error('Gemini returned an empty response');
        }
        return text;
      },
      {
        delaysMs: GEMINI_RETRY_DELAYS_MS,
        onRetry: (attempt, delayMs, error) => {
          this.logger.warn(
            `Gemini call failed (attempt ${attempt}); retrying in ${delayMs}ms: ${error instanceof Error ? error.message : String(error)}`,
          );
        },
      },
    );
  }
}
