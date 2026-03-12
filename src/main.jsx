import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Import App thật từ file App.jsx
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Lấy Client ID từ file .env của Vite
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            {/* Bọc toàn bộ ứng dụng bằng Provider của Google */}
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <App />
            </GoogleOAuthProvider>
        </React.StrictMode>,
    );
}