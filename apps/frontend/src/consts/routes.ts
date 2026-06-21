export const APP_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PORTFOLIO: '/portfolio',
  CHAT: '/chat',
  PROFILE: '/profile',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  STOCK_DETAILS: '/stock/:stockSymbol',
  RISK_TOLERANCE: '/onboarding/risk-tolerance',
  INTERESTS: '/onboarding/interests',
} as const;

export const buildAskAiHref = ({ symbol, prompt }: { symbol?: string; prompt?: string }) => {
  const params = new URLSearchParams();
  if (symbol) params.set('symbol', symbol);
  if (prompt) params.set('prompt', prompt);
  const query = params.toString();
  return query ? `${APP_ROUTES.CHAT}?${query}` : APP_ROUTES.CHAT;
};
