export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret_default',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
  },
} as const;
