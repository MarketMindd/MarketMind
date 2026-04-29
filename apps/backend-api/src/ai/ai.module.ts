import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeminiClientService } from './gemini-client.service';
import { PromptBuilderService } from './prompt-builder.service';
import { ResponseParserService } from './response-parser.service';

@Module({
  providers: [AiService, PromptBuilderService, GeminiClientService, ResponseParserService],
  exports: [AiService],
})
export class AiModule {}
