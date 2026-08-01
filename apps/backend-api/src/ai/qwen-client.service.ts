import { Injectable, Logger } from '@nestjs/common';
import { retry } from '@market-mind/common';
import { appConfig } from '../config/appConfig';
import { LlmClient } from './llm-client.interface';

const QWEN_RETRY_DELAYS_MS = [1000, 2000] as const;

const JSON_SYSTEM_PROMPT =
  'You are a JSON API. Respond with a single valid JSON object only, with no markdown fences or commentary.';

@Injectable()
export class QwenClientService implements LlmClient {
  private readonly logger = new Logger(QwenClientService.name);

  async generateContent(prompt: string): Promise<string> {
    const { baseUrl, username, password, model, maxTokens } = appConfig.llm.qwen;
    if (!baseUrl || !username || !password) {
      throw new Error(
        'Qwen LLM service is not configured (LLM_BASE_URL/LLM_USERNAME/LLM_PASSWORD)',
      );
    }

    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    const url = `${baseUrl.replace(/\/$/, '')}/v1/chat/completions`;

    return retry(
      async () => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: authHeader },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: JSON_SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            temperature: 0.2,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
            reasoning_effort: 'none',
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => '');
          throw new Error(
            `LLM service error ${res.status} ${res.statusText}: ${detail.slice(0, 200)}`,
          );
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('LLM service returned an empty response');
        }
        return content;
      },
      {
        delaysMs: QWEN_RETRY_DELAYS_MS,
        onRetry: (attempt, delayMs, error) => {
          this.logger.warn(
            `LLM call failed (attempt ${attempt}); retrying in ${delayMs}ms: ${error instanceof Error ? error.message : String(error)}`,
          );
        },
      },
    );
  }
}
