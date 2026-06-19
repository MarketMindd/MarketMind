export const LLM_CLIENT = Symbol('LLM_CLIENT');

export interface LlmClient {
  generateContent(prompt: string, customSchema?: Record<string, unknown>): Promise<string>;
}
