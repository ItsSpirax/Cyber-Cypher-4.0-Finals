import { useState, useEffect } from "react";
import { Bot, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import {
    ExpandableChat,
    ExpandableChatHeader,
    ExpandableChatBody,
    ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { Textarea } from "../ui/textarea";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_AI_KEY = process.env.GOOGLE_API_KEY;
console.log(GOOGLE_AI_KEY);

export function AIChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [genAI, setGenAI] = useState(null);

    useEffect(() => {
        const genAI = new GoogleGenerativeAI(GOOGLE_AI_KEY);
        setGenAI(genAI);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || !genAI) return;

        const userMessage = {
            id: messages.length + 1,
            content: input,
            role: "user",
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: {
                    parts: [
                        {
                            text: "You are StartupSensei, an AI-powered virtual mentor for solo founders. Your goal is to guide entrepreneurs through the challenges of building a startup, from ideation to scaling. You are knowledgeable, empathetic, and action-oriented, providing practical advice, resources, and encouragement.",
                        },
                    ],
                },
            });

            const chat = model.startChat({
                history: messages.map((msg) => ({
                    role: msg.role,
                    parts: [{ text: msg.content }],
                })),
            });

            const result = await chat.sendMessage(input);
            const response = await result.response;
            const text = response.text();

            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    content: text,
                    role: "model",
                },
            ]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    content:
                        "Sorry, there was an error processing your request.",
                    role: "model",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[600px] relative">
            <ExpandableChat
                size="lg"
                position="bottom-right"
                icon={<Bot className="h-6 w-6" />}
            >
                <ExpandableChatHeader className="flex-col text-center justify-center">
                    <h1 className="text-xl font-semibold">Chat with AI ✨</h1>
                    <p className="text-sm text-muted-foreground">
                        Ask me anything about the components
                    </p>
                </ExpandableChatHeader>

                <ExpandableChatBody>
                    <ChatMessageList>
                        {messages.map((message) => (
                            <ChatBubble
                                key={message.id}
                                variant={
                                    message.role === "user"
                                        ? "sent"
                                        : "received"
                                }
                            >
                                <ChatBubbleAvatar
                                    className="h-8 w-8 shrink-0"
                                    src={
                                        message.role === "user"
                                            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                                            : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                                    }
                                    fallback={
                                        message.role === "user" ? "US" : "AI"
                                    }
                                />
                                <ChatBubbleMessage
                                    variant={
                                        message.role === "user"
                                            ? "sent"
                                            : "received"
                                    }
                                >
                                    {message.content}
                                </ChatBubbleMessage>
                            </ChatBubble>
                        ))}

                        {isLoading && (
                            <ChatBubble variant="received">
                                <ChatBubbleAvatar
                                    className="h-8 w-8 shrink-0"
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                                    fallback="AI"
                                />
                                <ChatBubbleMessage isLoading />
                            </ChatBubble>
                        )}
                    </ChatMessageList>
                </ExpandableChatBody>

                <ExpandableChatFooter>
                    <form
                        onSubmit={handleSubmit}
                        className="relative flex flex-row rounded-lg border bg-background p-1"
                    >
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            maxLines={2}
                            className="min-h-12 resize-none bg-background border-0 shadow-none"
                        />
                        <Button
                            type="submit"
                            size="sm"
                            className="ml-auto gap-1.5 self-center mr-1"
                        >
                            <CornerDownLeft className="size-3.5" />
                        </Button>
                    </form>
                </ExpandableChatFooter>
            </ExpandableChat>
        </div>
    );
}
