import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Debug from './Debug.tsx';
import './index.css';

// Determine if we're in debug mode (URL has ?debug=password)
const urlParams = new URLSearchParams(window.location.search);
const debugPassword = import.meta.env.VITE_DEBUG_PASSWORD || 'wnyai_admin';
const providedPassword = urlParams.get('debug');
const isDebugMode = providedPassword === debugPassword;

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {isDebugMode ? <Debug /> : <App />}
    </StrictMode>
  );
} catch (error) {
  console.error('Error rendering application:', error);
}