import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './components/app';
import { Toaster } from './components/elements/toaster';
import { createFetchDataProvider } from './dataFetch/dataFetch';
import { ClientQueriesProvider } from './hooks/useClientQueries';

const dataProvider = createFetchDataProvider();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <ClientQueriesProvider dataProvider={dataProvider}>
      <Toaster />
      <StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </StrictMode>
    </ClientQueriesProvider>
  </GoogleOAuthProvider>,
);
