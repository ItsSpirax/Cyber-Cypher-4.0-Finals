# Cyber Cypher 4.0 Round 2 - AI-Powered Real Estate Helper

## Description

This project is an AI-powered real estate helper application designed for Cyber Cypher 4.0 Round 2. It allows users to find properties based on their natural language queries, leveraging AI for understanding user needs and providing relevant property recommendations. The application features a multi-lingual chatbot for property search, voice interaction, document translation, and user registration.

## Key Features

*   **Voice Interaction:** Integrates Azure Cognitive Services for Speech-to-Text and Text-to-Speech, allowing for voice-based interaction with the Real Estate Agent.
*   **Intelligent Property Search:** Employs vector-based retrieval to search a property database (SQLite) and find listings that match user requirements.
*   **Document Translation:** Offers PDF document translation into various Indian languages, delivered via email using Gemini API and Resend.
*   **Multi-Lingual Support:** Supports communication in over 100 languages, enabling users to interact in their preferred language.
*   **AI-Powered Chatbot:**  Utilizes Google Gemini API for understanding user queries and generating responses in natural language.
*   **User Registration & Verification:** Implements user registration with OTP verification sent via WhatsApp using Twilio API.
*   **Modern Frontend:** Built using React and Shadcn UI, providing a responsive and user-friendly interface with support for multiple Indian languages.
*   **Property Recommendations:** An AI agent can provide personalized property recommendations to users based on their conversation and extracted preferences.

## Tech Stack

**Frontend:**

*   React
*   Vite
*   Shadcn UI
*   Tailwind CSS
*   Framer Motion
*   Lucide React
*   React Router
*   i18next (for internationalization)

**Backend:**

*   Python (3.13)
*   FastAPI
*   Google Gemini API
*   Azure Cognitive Services (Speech-to-Text, Text-to-Speech)
*   Twilio API (WhatsApp OTP)
*   Resend (Email)
*   MongoDB
*   SQLite
*   Pymongo
*   Pymupdf
*   deep-translator
*   faiss-cpu

**Infrastructure:**

*   Docker
*   Docker Compose


## Setup Instructions

To run the application locally, you need Docker and Docker Compose installed.

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd itsspirax-cyber-cypher-4.0-finals
    ```

2.  **Set up environment variables:**

    *   Copy `.Backend/.env.example` to `.Backend/.env` and fill in the required environment variables.
    *   Copy `Frontend/.env.example` to `Frontend/.env` and fill in the required environment variables.

    **Backend `.env` variables:**

    ```
    AZURE_SPEECH_KEY= # Azure Speech API Key
    AZURE_SERVICE_REGION= # Azure Service Region
    GEMINI_API_KEY= # Gemini API Key
    MONGO_URI= # MongoDB Connection URI
    TWILIO_ACCOUNT_SID= # Twilio Account SID
    TWILIO_AUTH_TOKEN= # Twilio Auth Token
    TWILIO_PHONE_NUMBER= # Twilio Phone Number
    FRONTEND_URL= # URL of your frontend application (e.g., http://localhost:5173)
    RESEND_EMAIL= # Resend Email Address
    RESEND_API_KEY= # Resend API Key
    ```

    **Frontend `.env` variables:**

    ```
    LIVE_URL=ws://localhost:8000/ws # WebSocket URL for backend
    SERVER_URL=http://localhost:8000 # HTTP URL for backend
    GOOGLE_AI_KEY= # Gemini API Key (optional, if needed in frontend)
    ```

3.  **Run Docker Compose:**

    ```bash
    docker-compose up --build
    ```

4.  **Access the application:**

    *   Frontend: `http://localhost:5173` (or the port specified in your Vite configuration)
    *   Backend: `http://localhost:8000`

## Environment Variables

The application relies on environment variables for API keys, database connections, and service configurations. Example `.env.example` files are provided in both the `Backend` and `Frontend` directories. You must configure these variables with your actual credentials and settings for the application to function correctly.

**Note:** Ensure you have all the necessary API keys and services set up (Azure, Gemini, Twilio, MongoDB, Resend) before running the application.

## Credits

This project was developed for Cyber Cypher 4.0 Round 2.
