const getJwtSecret = (defaultSecret: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'JWT_SECRET environment variable is not set in production',
      );
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
  },
  newsApiKey: process.env.NEWSAPI_KEY ?? '',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
} as const;
