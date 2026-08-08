import { LlmProvider } from '@market-mind/common';
import { parseBoolean } from '@market-mind/database';

const parseLlmProvider = (value?: string): LlmProvider =>
  Object.values(LlmProvider).find((provider) => provider === value) ?? LlmProvider.Qwen;

const parseApiKeys = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);

const getJwtSecret = (defaultSecret: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is not set in production');
    }
    return defaultSecret;
  }
  return secret;
};

export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
  email: {
    smtpHost: process.env.SMTP_HOST ?? '',
    smtpPort: parseInt(process.env.SMTP_PORT || '465', 10),
    smtpSecure: parseBoolean(process.env.SMTP_SECURE, true),
    smtpAllowSelfSigned: parseBoolean(process.env.SMTP_ALLOW_SELF_SIGNED, false),
    smtpUser: process.env.SMTP_USER ?? '',
    smtpPass: process.env.SMTP_PASS ?? '',
    from: process.env.EMAIL_FROM ?? '',
  },
  jwt: {
    secret: getJwtSecret('supersecret_default'),
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
    refreshSecret: process.env.JWT_REFRESH_SECRET || getJwtSecret('refresh_supersecret_default'),
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10),
  },
  auth: {
    maxActiveSessions: parseInt(process.env.MAX_ACTIVE_SESSIONS || '5', 10),
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  },
  newsApiKeys: parseApiKeys(process.env.NEWSAPI_KEY),
  alphaVantageApiKeys: parseApiKeys(process.env.ALPHA_VANTAGE_API_KEY),
  massiveApiKeys: parseApiKeys(process.env.MASSIVE_API_KEY),
  geminiApiKeys: parseApiKeys(process.env.GEMINI_API_KEY),
  llm: {
    provider: parseLlmProvider(process.env.LLM_PROVIDER),
    qwen: {
      baseUrl: process.env.LLM_BASE_URL ?? '',
      username: process.env.LLM_USERNAME ?? '',
      password: process.env.LLM_PASSWORD ?? '',
      model: process.env.LLM_MODEL ?? 'qwen3.6:27b',
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4096', 10),
    },
  },
  stock: {
    maxStocksCount:
      !!process.env.MAX_STOCKS_COUNT && !isNaN(+process.env.MAX_STOCKS_COUNT)
        ? +process.env.MAX_STOCKS_COUNT
        : 9,
  },
} as const;
