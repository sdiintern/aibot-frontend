import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content?: string;
  type?: "text" | "pdf";
  fileName?: string;
  fileUrl?: string;
}

const ChatMessage = ({ role, content, type = "text", fileName, fileUrl }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("py-6 px-4", !isUser && "bg-chat-assistant")}>
      <div className="max-w-3xl mx-auto">
        <div className={cn("flex gap-4", isUser && "flex-row-reverse")}>
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
          >
            {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          </div>
          <div className={cn("flex-1 space-y-2", isUser && "flex justify-end")}>
            <div
              className={cn(
                "inline-block px-4 py-3 rounded-2xl max-w-[80%]",
                isUser
                  ? "bg-chat-user text-chat-user-foreground"
                  : "bg-background text-foreground border"
              )}
            >
              {type === "pdf" && fileName && fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {fileName}
                </a>
              ) : (
                <p className="whitespace-pre-wrap">{content}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
