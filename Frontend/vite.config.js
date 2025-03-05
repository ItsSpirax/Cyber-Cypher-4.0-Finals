import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig((mode) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        define: {
            "process.env.LIVE_URL": JSON.stringify(env.LIVE_URL),
            "process.env.SERVER_URL": JSON.stringify(env.SERVER_URL),
            "process.env.GOOGLE_AI_KEY": JSON.stringify(env.GOOGLE_AI_KEY),
        },
    };
});
