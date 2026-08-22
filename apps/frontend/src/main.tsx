import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './components/app';
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
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </StrictMode>
    </ClientQueriesProvider>
  </GoogleOAuthProvider>,
);
