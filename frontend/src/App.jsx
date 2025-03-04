import { useState } from "react";
import GeminiVoiceChat from "./components/custom/gemini-playground";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <GeminiVoiceChat />
        </>
    );
}

export default App;
