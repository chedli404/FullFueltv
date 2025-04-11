import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="459807581006-5kb6rg9s1dj6klua4icma8raoi0la55c.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
