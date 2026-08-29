import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Scrub sensitive data from error payloads
    if (event.request && typeof event.request.data === 'string') {
      try {
        const data = JSON.parse(event.request.data);
        if (data.password) data.password = "[Filtered]";
        if (data.token) data.token = "[Filtered]";
        event.request.data = JSON.stringify(data);
      } catch (e) {
        // Not JSON, ignore
      }
    }
    return event;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
