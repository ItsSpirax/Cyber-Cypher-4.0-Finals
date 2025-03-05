import * as React from "react";
import { ScrollArea } from "./scroll-area";

const ChatMessageList = React.forwardRef(
    ({ className, children, smooth = false, ...props }, _ref) => {
        return (
            <ScrollArea className="relative w-full h-full">
                <div
                    className={`flex flex-col w-full h-full p-4 overflow-y-auto ${className}`}
                    {...props}
                >
                    <div className="flex flex-col gap-6">{children}</div>
                </div>
            </ScrollArea>
        );
    },
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
