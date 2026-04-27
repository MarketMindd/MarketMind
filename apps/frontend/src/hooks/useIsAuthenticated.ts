import { ACCESS_TOKEN_KEY } from '@/dataFetch/dataFetch';
import { useState, useEffect } from 'react';

export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem(ACCESS_TOKEN_KEY)
  );

  useEffect(() => {
    // Handler to check token state
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem(ACCESS_TOKEN_KEY));
    };

    // The 'storage' event fires when localStorage changes in OTHER tabs
    window.addEventListener('storage', checkAuth);
    // Custom event fired by the HTTP interceptor when unauthorized
    window.addEventListener('auth:unauthorized', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth:unauthorized', checkAuth);
    };
  }, []);

  return isAuthenticated;
};
