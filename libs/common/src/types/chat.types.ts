import { z } from 'zod';

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: Date | string;
}

export interface CreateChatSessionPayload {
  title?: string;
  symbol?: string;
}

export interface SendMessagePayload {
  content: string;
}

export const createChatSessionSchema = z.object({
  title: z.string().max(255).optional(),
  symbol: z.string().max(20).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});
