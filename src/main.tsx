import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react"; // 1. Import Sentry

import './index.css'
import { registerLicense } from '@syncfusion/ej2-base';
import App from './App.tsx'

// 2. Initialize Sentry before everything else
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN, // Use an env variable for this too!
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// 3. Syncfusion License
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
