import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { aiResponseSchema, retry } from '@market-mind/common';
import { appConfig } from '../config/appConfig';
import { LlmClient } from './llm-client.interface';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_RETRY_DELAYS_MS = [1000, 2000] as const;

@Injectable()
export class GeminiClientService implements LlmClient {
  private readonly logger = new Logger(GeminiClientService.name);

  async generateContent(prompt: string, customSchema?: Record<string, unknown>): Promise<string> {
    const apiKeys = appConfig.geminiApiKeys;
    if (apiKeys.length === 0) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let lastError: unknown;
    for (const apiKey of apiKeys) {
      try {
        return await this.generateWithKey(apiKey, prompt, customSchema);
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Gemini key ...${apiKey.slice(-4)} failed, rotating: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    throw lastError instanceof Error ? lastError : new Error('All Gemini API keys exhausted');
  }

  private async generateWithKey(
    apiKey: string,
    prompt: string,
    customSchema?: Record<string, unknown>,
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });
    const responseSchema = customSchema || z.toJSONSchema(aiResponseSchema);

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
