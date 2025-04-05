import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Debug from './Debug.tsx';
import './index.css';

// Debug log to help with blank page troubleshooting
console.log('Application starting...');
console.log('Environment variables check:', {
  hasAirtableKey: !!import.meta.env.VITE_AIRTABLE_API_KEY ? 'Yes' : 'No',
  hasBaseId: !!import.meta.env.VITE_AIRTABLE_BASE_ID ? 'Yes' : 'No',
  hasSubscribersTable: !!import.meta.env.VITE_AIRTABLE_SUBSCRIBERS_TABLE ? 'Yes' : 'No',
  hasEventsTable: !!import.meta.env.VITE_AIRTABLE_EVENTS_TABLE ? 'Yes' : 'No',
  hasContentTable: !!import.meta.env.VITE_AIRTABLE_CONTENT_TABLE ? 'Yes' : 'No',
});

// Determine if we're in debug mode (URL has ?debug=true)
const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.get('debug') === 'true';

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {isDebugMode ? <Debug /> : <App />}
    </StrictMode>
  );
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Error rendering application:', error);
}