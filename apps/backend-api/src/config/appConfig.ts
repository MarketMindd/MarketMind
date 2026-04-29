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
  jwt: {
    secret: getJwtSecret('supersecret_default'),
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
    refreshSecret: process.env.JWT_REFRESH_SECRET || getJwtSecret('refresh_supersecret_default'),
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10),
  },
  auth: {
    maxActiveSessions: parseInt(process.env.MAX_ACTIVE_SESSIONS || '5', 10),
  },
  newsApiKey: process.env.NEWSAPI_KEY ?? 'empty',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  stock: {
    maxStocksCount: !!process.env.MAX_STOCKS_COUNT && !isNaN(+process.env.MAX_STOCKS_COUNT)
      ? +process.env.MAX_STOCKS_COUNT
      : 9,
  },
} as const;
