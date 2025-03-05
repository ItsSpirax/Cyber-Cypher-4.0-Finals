import React, { useState, useRef, useEffect } from "react";
import {
    Mic,
    StopCircle,
    Sparkles,
    MessageSquare,
    Settings,
    Video,
    VideoOff,
    User,
    Pin,
    MoreVertical,
    Volume2,
    VolumeX,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { base64ToFloat32Array, float32ToPcm16 } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const Meet = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const [config, setConfig] = useState({
        voice: "Puck",
        googleSearch: true,
        allowInterruptions: false,
        language: navigator.language || navigator.userLanguage,
        role: "user",
    });
    const [isConnected, setIsConnected] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [geminiSpeaking, setGeminiSpeaking] = useState(false);
    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const audioInputRef = useRef(null);
    const clientId = useRef(crypto.randomUUID());
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([]);
    const chatEndRef = useRef(null);

    let audioBuffer = [];
    let isPlaying = false;

    const detectAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average =
            dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const normalizedLevel = Math.min(1, average / 128);

        setUserSpeaking(normalizedLevel > 0.1);
        console.log(normalizedLevel);

        animationFrameRef.current = requestAnimationFrame(detectAudioLevel);
    };

    useEffect(() => {
        console.log(text);
    }, [text]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const startStream = async () => {
        wsRef.current = new WebSocket(
            `${process.env.LIVE_URL}/${clientId.current}`,
        );

        wsRef.current.onopen = async () => {
            wsRef.current.send(
                JSON.stringify({
                    type: "config",
                    config: config,
                }),
            );

            await startAudioStream();
            setIsStreaming(true);
            setIsConnected(true);

            animationFrameRef.current = requestAnimationFrame(detectAudioLevel);
        };

        wsRef.current.onmessage = async (event) => {
            const response = JSON.parse(event.data);
            if (response.type === "audio") {
                const audioData = base64ToFloat32Array(response.data);
                setGeminiSpeaking(true);
                playAudioData(audioData);
            } else if (response.type === "text") {
                setText((prev) => prev + response.data + "\n");
                setMessages(prev => [
                    ...prev, 
                    { 
                        content: response.data, 
                        sender: geminiSpeaking ? "gemini" : "user",
                        timestamp: new Date().toISOString()
                    }
                ]);
            }
        };

        wsRef.current.onerror = (error) => {
            setError("WebSocket error: " + error.message);
            setIsStreaming(false);
        };

        wsRef.current.onclose = () => {
            setIsStreaming(false);
        };
    };

    const startAudioStream = async () => {
        try {
            audioContextRef.current = new (window.AudioContext ||
                window.webkitAudioContext)({
                sampleRate: 16000,
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            const source =
                audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;

            const processor = audioContextRef.current.createScriptProcessor(
                512,
                1,
                1,
            );

            source.connect(analyserRef.current);
            analyserRef.current.connect(processor);
            processor.connect(audioContextRef.current.destination);

            processor.onaudioprocess = (e) => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmData = float32ToPcm16(inputData);
                    const base64Data = btoa(
                        String.fromCharCode(...new Uint8Array(pcmData.buffer)),
                    );
                    wsRef.current.send(
                        JSON.stringify({
                            type: "audio",
                            data: base64Data,
                        }),
                    );
                }
            };

            audioInputRef.current = { source, processor, stream };
            setIsStreaming(true);
        } catch (err) {
            setError("Failed to access microphone: " + err.message);
        }
    };

    const stopStream = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        setUserSpeaking(false);
        setGeminiSpeaking(false);

        if (audioInputRef.current) {
            const { source, processor, stream } = audioInputRef.current;
            source.disconnect();
            processor.disconnect();
            stream.getTracks().forEach((track) => track.stop());
            audioInputRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsStreaming(false);
        setIsConnected(false);
    };

    const playAudioData = async (audioData) => {
        audioBuffer.push(audioData);
        if (!isPlaying) {
            playNextInQueue();
        }
    };

    const playNextInQueue = async () => {
        if (!audioContextRef.current || audioBuffer.length == 0) {
            isPlaying = false;
            return;
        }

        isPlaying = true;
        const audioData = audioBuffer.shift();

        const buffer = audioContextRef.current.createBuffer(
            1,
            audioData.length,
            24000,
        );
        buffer.copyToChannel(audioData, 0);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
            if (audioBuffer.length === 0) {
                setGeminiSpeaking(false);
            }
            playNextInQueue();
        };
        source.start();
    };

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            if (audioInputRef.current) {
                const { source, processor, stream } = audioInputRef.current;
                source.disconnect();
                processor.disconnect();
                stream.getTracks().forEach((track) => track.stop());
            }

            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return (
        <div className="container-fluid h-screen max-h-screen flex flex-col overflow-hidden dark">
            <div className="flex justify-between items-center p-4 border-b border-border/40 bg-background/90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                        Gemini Voice Chat
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="py-1.5">
                        <span className="relative flex h-2 w-2 mr-1.5">
                            <span
                                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                                    isConnected ? "bg-green-400" : "bg-gray-400"
                                } opacity-75`}
                            ></span>
                            <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${
                                    isConnected ? "bg-green-500" : "bg-gray-500"
                                }`}
                            ></span>
                        </span>
                        {isConnected ? "Connected" : "Ready"}
                    </Badge>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-grow overflow-hidden">
                <div className="w-1/3 border-r border-border/40 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        <Card className="border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardContent className="p-0 relative aspect-video">
                                <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            {userSpeaking && (
                                                <>
                                                    <div className="absolute -inset-2 rounded-full bg-primary/20 animate-ping"></div>
                                                    <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse"></div>
                                                    <div className="absolute -inset-6 rounded-full bg-primary/5"></div>
                                                </>
                                            )}
                                            <Avatar className="h-16 w-16 relative z-10">
                                                <AvatarImage alt="User" />
                                                <AvatarFallback
                                                    className={`${
                                                        userSpeaking
                                                            ? "bg-primary/20"
                                                            : "bg-primary/10"
                                                    } text-primary`}
                                                >
                                                    <User className="h-8 w-8" />
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <span className="mt-2 text-sm font-medium">
                                            You
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                                    <Badge
                                        variant={
                                            userSpeaking
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="bg-background/80 backdrop-blur-sm"
                                    >
                                        {userSpeaking ? (
                                            <>
                                                <Volume2 className="h-3 w-3 mr-1" />
                                                Speaking
                                            </>
                                        ) : (
                                            <>
                                                <VolumeX className="h-3 w-3 mr-1" />
                                                Silent
                                            </>
                                        )}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 bg-background/80 backdrop-blur-sm rounded-full"
                                        >
                                            <Pin className="h-3 w-3" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 bg-background/80 backdrop-blur-sm rounded-full"
                                                >
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    Mute
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Hide
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardContent className="p-0 relative aspect-video">
                                <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            {geminiSpeaking && (
                                                <>
                                                    <div className="absolute -inset-2 rounded-full bg-indigo-500/20 animate-ping"></div>
                                                    <div className="absolute -inset-4 rounded-full bg-purple-500/10 animate-pulse"></div>
                                                    <div className="absolute -inset-6 rounded-full bg-pink-500/5"></div>
                                                </>
                                            )}
                                            <Avatar className="h-16 w-16 relative z-10">
                                                <AvatarImage
                                                    alt="Gemini"
                                                    src="https://ui-avatars.com/api/?name=Gemini&background=6d28d9&color=fff"
                                                />
                                                <AvatarFallback
                                                    className={`${
                                                        geminiSpeaking
                                                            ? "bg-indigo-500/20"
                                                            : "bg-primary/10"
                                                    } text-primary`}
                                                >
                                                    GM
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <span className="mt-2 text-sm font-medium">
                                            Gemini
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                                    <Badge
                                        variant={
                                            geminiSpeaking
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="bg-background/80 backdrop-blur-sm"
                                    >
                                        {geminiSpeaking ? (
                                            <>
                                                <Volume2 className="h-3 w-3 mr-1" />
                                                Speaking
                                            </>
                                        ) : (
                                            <>
                                                <VolumeX className="h-3 w-3 mr-1" />
                                                Silent
                                            </>
                                        )}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 bg-background/80 backdrop-blur-sm rounded-full"
                                        >
                                            <Pin className="h-3 w-3" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 bg-background/80 backdrop-blur-sm rounded-full"
                                                >
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    Mute
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Hide
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {error && (
                            <Alert
                                variant="destructive"
                                className="border border-destructive/20 bg-destructive/10"
                            >
                                <AlertTitle className="flex items-center gap-2 text-sm">
                                    <span className="h-2 w-2 rounded-full bg-destructive"></span>
                                    Error
                                </AlertTitle>
                                <AlertDescription className="text-xs">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                <div className="w-2/3 p-4 flex flex-col">
                    <div className="flex-1 mb-4">
                        <Card className="h-full border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardContent className="p-4 h-full">
                                <ScrollArea className="h-full">
                                    <div className="space-y-4 pb-4">
                                        {messages.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-muted-foreground opacity-50">
                                                <div className="text-center">
                                                    <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                                                    <h2 className="text-lg font-medium">Start Speaking</h2>
                                                    <p className="text-sm">
                                                        Messages will appear here
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            messages.map((msg, index) => (
                                                <div 
                                                    key={index}
                                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div 
                                                        className={`max-w-[80%] p-3 rounded-lg ${
                                                            msg.sender === "user" 
                                                                ? "bg-primary/20 text-primary-foreground" 
                                                                : "bg-muted/50 text-foreground"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className={msg.sender === "user" ? "bg-primary/40" : "bg-indigo-500/40"}>
                                                                    {msg.sender === "user" ? "U" : "G"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs font-medium">
                                                                {msg.sender === "user" ? "You" : "Gemini"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm">{msg.content}</p>
                                                        <span className="text-xs text-muted-foreground block text-right mt-1">
                                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border/40 bg-background/90 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-12 w-12 bg-muted/30"
                    >
                        {false ? (
                            <VideoOff className="h-5 w-5" />
                        ) : (
                            <Video className="h-5 w-5" />
                        )}
                    </Button>

                    {!isStreaming ? (
                        <Button
                            onClick={startStream}
                            disabled={isStreaming}
                            className="rounded-full h-14 w-14 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0 shadow-lg shadow-primary/20"
                        >
                            <Mic className="h-6 w-6" />
                        </Button>
                    ) : (
                        <Button
                            onClick={stopStream}
                            variant="destructive"
                            className="rounded-full h-14 w-14 shadow-lg shadow-destructive/20"
                        >
                            <StopCircle className="h-6 w-6" />
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-12 w-12 bg-muted/30"
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Meet;
