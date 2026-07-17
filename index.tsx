import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// One-time cleanup: wipe all localStorage the first time a browser loads
// this version of the app. This clears out stale data left over from
// before recent fixes -- most importantly, older builds cached the real
// admin passcode in localStorage, which should never have been there.
// Guarded by a version marker so it only runs once per browser, not on
// every load (which would otherwise also wipe legitimate data like the
// "already redeemed on this device" record).
const STORAGE_PURGE_KEY = 'cissp_storage_purged_v1';
try {
  if (!localStorage.getItem(STORAGE_PURGE_KEY)) {
    localStorage.clear();
    localStorage.setItem(STORAGE_PURGE_KEY, 'true');
  }
} catch (e) {
  // localStorage may be unavailable (private browsing, disabled, etc.) --
  // not fatal, just skip the purge.
  console.warn('Could not perform one-time storage purge:', e);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);