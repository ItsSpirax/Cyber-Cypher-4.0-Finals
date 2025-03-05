import "@/i18n"; // ensure i18n is imported before rendering any component
import Meet from "./pages/Meet";
import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "./pages/Home";
import { ToastProvider } from "@/components/ui/toast";
import Register from "@/pages/Register";
import Agent from "./pages/Agent";
import Agreement from "./pages/Agreement";
import { AIChat } from "./components/ai-chat";

function App() {
    return (
        <ThemeProvider defaultTheme="dark">
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route index element={<HomePage />} />
                        <Route path="/meet" element={<Meet />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/agreement" element={<Agreement />} />
                        <Route path="/agent" element={<Agent />} />
                    </Routes>
                </BrowserRouter>
                <AIChat />
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
