"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageLoading } from "@/components/ui/message-loading";
import Markdown from "react-markdown";

export function ChatBubble({
    variant = "received",
    layout = "default",
    className,
    children,
}) {
    return (
        <div
            className={cn(
                "flex items-start gap-2 mb-4",
                variant === "sent" && "flex-row-reverse",
                className,
            )}
        >
            {children}
        </div>
    );
}

export function ChatBubbleMessage({
    variant = "received",
    isLoading,
    className,
    children,
}) {
    return (
        <div
            className={cn(
                "rounded-lg p-3",
                variant === "sent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                className,
            )}
        >
            {isLoading ? (
                <div className="flex items-center space-x-2">
                    <MessageLoading />
                </div>
            ) : (
                <Markdown>{children}</Markdown>
            )}
        </div>
    );
}

export function ChatBubbleAvatar({ src, fallback = "AI", className }) {
    return (
        <Avatar className={cn("h-8 w-8", className)}>
            {src && <AvatarImage src={src} />}
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
    );
}

export function ChatBubbleAction({ icon, onClick, className }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6", className)}
            onClick={onClick}
        >
            {icon}
        </Button>
    );
}

export function ChatBubbleActionWrapper({ className, children }) {
    return (
        <div className={cn("flex items-center gap-1 mt-2", className)}>
            {children}
        </div>
    );
}
