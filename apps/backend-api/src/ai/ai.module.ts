import { Module } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { PromptBuilderService } from './prompt-builder.service.js';
import { GeminiClientService } from './gemini-client.service.js';
import { ResponseParserService } from './response-parser.service.js';

@Module({
  providers: [AiService, PromptBuilderService, GeminiClientService, ResponseParserService],
  exports: [AiService],
})
export class AiModule {}
