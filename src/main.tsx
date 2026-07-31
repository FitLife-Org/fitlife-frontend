import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import "./styles/index.css";

const rootElement =
    document.getElementById("root");

if (!rootElement) {
    throw new Error(
        "Root element #root was not found",
    );
}

const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

if (!googleClientId) {
    throw new Error(
        "Missing VITE_GOOGLE_CLIENT_ID. " +
        "Please configure it in .env.local.",
    );
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <GoogleOAuthProvider
            clientId={googleClientId}
        >
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
);