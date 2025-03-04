import "@/i18n"; // ensure i18n is imported before rendering any component
import Meet from "./pages/Meet";
import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "./pages/Home";

function App() {
    return (
        <ThemeProvider defaultTheme="dark">
            <BrowserRouter>
                <Routes>
                    <Route index element={<HomePage />} />
                    <Route path="/meet" element={<Meet />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
