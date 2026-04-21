import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './components/app';
import { createFetchDataProvider } from './dataFetch/dataFetch';
import { ClientQueriesProvider } from './hooks/useClientQueries';
import { Toaster } from './components/elements/toaster';

const dataProvider = createFetchDataProvider();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <ClientQueriesProvider dataProvider={dataProvider}>
    <Toaster />
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </ClientQueriesProvider>,
);
