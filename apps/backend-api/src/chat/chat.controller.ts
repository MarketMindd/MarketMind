/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { createChatSessionSchema, sendMessageSchema } from '@market-mind/common';
import type { CreateChatSessionPayload, SendMessagePayload } from '@market-mind/common';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async getSessions(@Request() req: any) {
    return this.chatService.getSessions(req.user.id);
  }

  @Post('sessions')
  async createSession(
    @Request() req: any,
    @Body(new ZodValidationPipe(createChatSessionSchema)) body: CreateChatSessionPayload,
  ) {
    return this.chatService.createSession(req.user.id, body);
  }

  @Delete('sessions/:id')
  async deleteSession(@Request() req: any, @Param('id') sessionId: string) {
    return this.chatService.deleteSession(req.user.id, sessionId);
  }

  @Get('sessions/:id/messages')
  async getMessages(@Request() req: any, @Param('id') sessionId: string) {
    return this.chatService.getMessages(req.user.id, sessionId);
  }

  @Post('sessions/:id/messages')
  async sendMessage(
    @Request() req: any,
    @Param('id') sessionId: string,
    @Body(new ZodValidationPipe(sendMessageSchema)) body: SendMessagePayload,
  ) {
    return this.chatService.sendMessage(req.user.id, sessionId, body);
  }
}
