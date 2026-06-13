import { Module, Provider } from '@nestjs/common';
import { appConfig } from '../config/appConfig';
import { AiService } from './ai.service';
import { GeminiClientService } from './gemini-client.service';
import { GptOssClientService } from './gpt-oss-client.service';
import { LLM_CLIENT } from './llm-client.interface';
import { PromptBuilderService } from './prompt-builder.service';
import { ResponseParserService } from './response-parser.service';

const llmClientProvider: Provider = {
  provide: LLM_CLIENT,
  useFactory: (gemini: GeminiClientService, gptOss: GptOssClientService) =>
    appConfig.llm.provider === 'gpt-oss' ? gptOss : gemini,
  inject: [GeminiClientService, GptOssClientService],
};

@Module({
  providers: [
    AiService,
    PromptBuilderService,
    GeminiClientService,
    GptOssClientService,
    ResponseParserService,
    llmClientProvider,
  ],
  exports: [AiService, PromptBuilderService, GeminiClientService, LLM_CLIENT],
})
export class AiModule {}
