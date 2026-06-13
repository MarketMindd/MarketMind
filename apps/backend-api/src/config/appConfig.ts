import { parseBoolean } from '@market-mind/database';

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
  },
  newsApiKey: process.env.NEWSAPI_KEY ?? '',
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY ?? '',
  massiveApiKey: process.env.MASSIVE_API_KEY ?? '',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  llm: {
    provider: (process.env.LLM_PROVIDER as 'gemini' | 'gpt-oss') || 'gemini',
    gptOss: {
      baseUrl: process.env.LLM_BASE_URL ?? '',
      username: process.env.LLM_USERNAME ?? '',
      password: process.env.LLM_PASSWORD ?? '',
      model: process.env.LLM_MODEL ?? 'gpt-oss-120b',
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
