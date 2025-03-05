import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@/i18n";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
        <Toaster position="top-center" richColors />
    </StrictMode>,
);
