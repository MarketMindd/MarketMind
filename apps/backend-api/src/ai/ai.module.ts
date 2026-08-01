import { Module, Provider } from '@nestjs/common';
import { LlmProvider } from '@market-mind/common';
import { appConfig } from '../config/appConfig';
import { AiService } from './ai.service';
import { GeminiClientService } from './gemini-client.service';
import { LLM_CLIENT } from './llm-client.interface';
import { PromptBuilderService } from './prompt-builder.service';
import { QwenClientService } from './qwen-client.service';
import { ResponseParserService } from './response-parser.service';

const llmClientProvider: Provider = {
  provide: LLM_CLIENT,
  useFactory: (gemini: GeminiClientService, qwen: QwenClientService) =>
    appConfig.llm.provider === LlmProvider.Qwen ? qwen : gemini,
  inject: [GeminiClientService, QwenClientService],
};

@Module({
  providers: [
    AiService,
    PromptBuilderService,
    GeminiClientService,
    QwenClientService,
    ResponseParserService,
    llmClientProvider,
  ],
  exports: [AiService, PromptBuilderService, GeminiClientService, LLM_CLIENT],
})
export class AiModule {}
