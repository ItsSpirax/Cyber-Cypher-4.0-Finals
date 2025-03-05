import asyncio
import json
import os
import random
import tempfile
from typing import Dict

import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from twilio.rest import Client
from websockets import connect
import base64 as b64


load_dotenv()

app = FastAPI()
twilio_client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
speech_config = speechsdk.SpeechConfig(
    subscription=os.getenv("AZURE_SPEECH_KEY"), region=os.getenv("AZURE_SERVICE_REGION")
)
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client.estate_agent

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

indian_languages = {
    "en": {"Female": "en-US-AvaNeural", "Male": "en-US-AriaNeural"},
    "as": {"Female": "as-IN-YashicaNeural", "Male": "as-IN-PriyomNeural"},
    "bn": {"Female": "bn-IN-TanishaaNeural", "Male": "bn-IN-BashkarNeural"},
    "gu": {"Female": "gu-IN-DhwaniNeural", "Male": "gu-IN-NiranjanNeural"},
    "hi": {"Female": "hi-IN-AnanyaNeural", "Male": "hi-IN-AaravNeural"},
    "kn": {"Female": "kn-IN-SapnaNeural", "Male": "kn-IN-GaganNeural"},
    "ml": {"Female": "ml-IN-SobhanaNeural", "Male": "ml-IN-MidhunNeural"},
    "mr": {"Female": "mr-IN-AarohiNeural", "Male": "mr-IN-ManoharNeural"},
    "or": {"Female": "or-IN-SubhasiniNeural", "Male": "or-IN-SukantNeural"},
    "pa": {"Female": "pa-IN-VaaniNeural", "Male": "pa-IN-OjasNeural"},
    "ta": {"Female": "ta-IN-PallaviNeural", "Male": "ta-IN-ValluvarNeural"},
    "te": {"Female": "te-IN-ShrutiNeural", "Male": "te-IN-MohanNeural"},
    "ur": {"Female": "ur-IN-GulNeural", "Male": "ur-IN-SalmanNeural"},
    "en": {"Female": "en-IN-AashiNeural", "Male": "en-IN-AaravNeural"},
}


def tts(text, language, gender="Male"):
    speech_config.speech_synthesis_voice_name = indian_languages[language][gender]
    audio_format = speechsdk.SpeechSynthesisOutputFormat.Raw24Khz16BitMonoPcm
    audio_config = speechsdk.audio.AudioOutputConfig(filename=tempfile.mktemp())
    speech_config.set_speech_synthesis_output_format(audio_format)
    speech_synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config, audio_config=audio_config
    )
    result = speech_synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        return result.audio_data
    elif result.reason == speechsdk.ResultReason.Canceled:
        return None
    else:
        return None


@app.post("/register")
async def register(name: str, no: str, gender: str):
    otp = random.randint(100000, 999999)
    db.users.insert_one(
        {
            "name": name,
            "no": no,
            "gender": gender,
            "otp": otp,
            "verified": False,
            "role": "user",
        }
    )
    twilio_client.messages.create(
        to=f"whatsapp:+91{no}",
        from_=os.getenv("TWILIO_PHONE_NUMBER"),
        content_sid="HX229f5a04fd0510ce1b071852155d3e75",
        content_variables='{"1":"' + str(otp) + '"}',
    )
    return {"status": "success"}


@app.post("/verify")
async def verify(no: str, otp: int):
    user = db.users.find_one({"no": no})
    if user["otp"] == otp:
        db.users.update_one({"no": no}, {"$set": {"verified": True}})
        return {"status": "success"}
    return {"status": "failure"}


@app.post("/tts")
async def tts_endpoint(text: str, language: str, gender: str):
    filename = tts(text, language, gender)
    return {"filename": filename}


class GeminiConnection:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = "gemini-2.0-flash-exp"
        self.uri = (
            "wss://generativelanguage.googleapis.com/ws/"
            "google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent"
            f"?key={self.api_key}"
        )
        self.ws = None
        self.config = None

    async def connect(self):
        """Initialize connection to Gemini"""
        self.ws = await connect(
            self.uri, extra_headers={"Content-Type": "application/json"}
        )

        if not self.config:
            raise ValueError("Configuration must be set before connecting")

        # Send initial setup message with configuration
        setup_message = {
            "setup": {
                "model": f"models/{self.model}",
                "generation_config": {
                    "response_modalities": ["TEXT"],
                    "speech_config": {
                        "voice_config": {
                            "prebuilt_voice_config": {
                                "voice_name": self.config["voice"]
                            }
                        }
                    },
                },
                "system_instruction": {
                    "parts": [
                        {
                            "text": f"You are a translation agent. Whatever the user says, JUST TRANSLATE IT TO {self.config['language']}. Do NOT add anything else. Preserve the meaning of the sentences the user says. Do NOT repeat what the user says in the same language."
                        }
                    ]
                },
            }
        }
        await self.ws.send(json.dumps(setup_message))

        # Wait for setup completion
        setup_response = await self.ws.recv()
        return setup_response

    def set_config(self, config):
        """Set configuration for the connection"""
        self.config = config

    async def send_audio(self, audio_data: str):
        """Send audio data to Gemini"""
        realtime_input_msg = {
            "realtime_input": {
                "media_chunks": [{"data": audio_data, "mime_type": "audio/pcm"}]
            }
        }
        await self.ws.send(json.dumps(realtime_input_msg))

    async def receive(self):
        """Receive message from Gemini"""
        return await self.ws.recv()

    async def close(self):
        """Close the connection"""
        if self.ws:
            await self.ws.close()

    async def send_image(self, image_data: str):
        """Send image data to Gemini"""
        image_message = {
            "realtime_input": {
                "media_chunks": [{"data": image_data, "mime_type": "image/jpeg"}]
            }
        }
        await self.ws.send(json.dumps(image_message))

    async def send_text(self, text: str):
        """Send text message to Gemini"""
        text_message = {
            "client_content": {
                "turns": [{"role": "user", "parts": [{"text": text}]}],
                "turn_complete": True,
            }
        }
        await self.ws.send(json.dumps(text_message))


# Store active connections and their configurations
connections: Dict[str, Dict] = {}


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()

    try:
        # Create new Gemini connection for this client
        gemini = GeminiConnection()
        connections[client_id] = {"ws": websocket, "config": None}

        # Wait for initial configuration
        config_data = await websocket.receive_json()
        if config_data.get("type") != "config":
            raise ValueError("First message must be configuration")

        # Set the configuration
        config = config_data.get("config", {})
        gemini.set_config(config)
        connections[client_id]["config"] = config

        # Initialize Gemini connection
        await gemini.connect()

        # Handle bidirectional communication
        async def receive_from_client():
            try:
                while True:
                    try:
                        # Check if connection is closed
                        if websocket.client_state.value == 3:  # WebSocket.CLOSED
                            print("WebSocket connection closed by client")
                            return

                        message = await websocket.receive()

                        # Check for close message
                        if message["type"] == "websocket.disconnect":
                            print("Received disconnect message")
                            await gemini.close()
                            return

                        message_content = json.loads(message["text"])
                        msg_type = message_content["type"]
                        if msg_type == "audio":
                            await gemini.send_audio(message_content["data"])
                        elif msg_type == "image":
                            await gemini.send_image(message_content["data"])
                        elif msg_type == "text":
                            await gemini.send_text(message_content["data"])
                        else:
                            print(f"Unknown message type: {msg_type}")
                    except json.JSONDecodeError as e:
                        print(f"JSON decode error: {e}")
                        continue
                    except KeyError as e:
                        print(f"Key error in message: {e}")
                        continue
                    except Exception as e:
                        print(f"Error processing client message: {str(e)}")
                        if "disconnect message" in str(e):
                            return
                        continue

            except Exception as e:
                print(f"Fatal error in receive_from_client: {str(e)}")
                return

        async def receive_from_gemini():
            pending_task = None
            pending_text = ""
            try:
                while True:
                    if websocket.client_state.value == 3:  # WebSocket.CLOSED
                        print("WebSocket closed, stopping Gemini receiver")
                        return

                    msg = await gemini.receive()
                    response = json.loads(msg)

                    try:
                        parts = response["serverContent"]["modelTurn"]["parts"]

                        if any("inlineData" in p for p in parts):
                            for p in parts:
                                if "inlineData" in p:
                                    audio_data = p["inlineData"]["data"]
                                    print(audio_data)
                                    await websocket.send_json(
                                        {"type": "audio", "data": audio_data}
                                    )
                        else:
                            for p in parts:
                                if "text" in p:
                                    pending_text += p["text"]
                                    if pending_task is not None:
                                        pending_task.cancel()

                                    async def process_debounced_text():
                                        nonlocal pending_text, pending_task
                                        try:
                                            await asyncio.sleep(2)
                                            text_to_convert = pending_text
                                            pending_text = ""
                                            pending_task = None
                                            print("text_to_convert", text_to_convert)
                                            audio_data = tts(
                                                text_to_convert,
                                                gemini.config["language"],
                                            )
                                            if audio_data:
                                                for (
                                                    other_client_id,
                                                    other_conn,
                                                ) in connections.items():
                                                    print(other_client_id, other_conn)
                                                    if other_client_id != client_id:
                                                        other_language = other_conn[
                                                            "config"
                                                        ]["language"]
                                                        translated_audio = tts(
                                                            text_to_convert,
                                                            other_language,
                                                        )
                                                        if translated_audio:
                                                            encoded_translated_audio = (
                                                                b64.b64encode(
                                                                    translated_audio
                                                                ).decode("utf-8")
                                                            )
                                                            await other_conn[
                                                                "ws"
                                                            ].send_json(
                                                                {
                                                                    "type": "audio",
                                                                    "data": encoded_translated_audio,
                                                                }
                                                            )
                                                            await other_conn[
                                                                "ws"
                                                            ].send_json(
                                                                {
                                                                    "type": "text",
                                                                    "data": text_to_convert,
                                                                }
                                                            )
                                        except asyncio.CancelledError:
                                            return

                                    pending_task = asyncio.create_task(
                                        process_debounced_text()
                                    )
                    except KeyError:
                        pass

                    # Handle turn completion
                    try:
                        if response["serverContent"]["turnComplete"]:
                            await websocket.send_json(
                                {"type": "turn_complete", "data": True}
                            )
                    except KeyError:
                        pass
            except Exception as e:
                print(f"Error receiving from Gemini: {e}")

        # Run both receiving tasks concurrently
        async with asyncio.TaskGroup() as tg:
            tg.create_task(receive_from_client())
            tg.create_task(receive_from_gemini())

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Cleanup
        if client_id in connections:
            del connections[client_id]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
