import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './assets/index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const rootElement = document.getElementById('root');

if (rootElement) {
  const app = <App />;

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {app}
        </GoogleOAuthProvider>
      ) : (
        app
      )}
    </React.StrictMode>,
  );
}

