import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { useState, useRef, useEffect } from "react";


interface Message {
  id: string;
  role: "user" | "assistant";
  type?: "text" | "pdf";
  content?: string;
  fileName?: string;
  fileUrl?: string;
}

//for testing purposes
const CREATE_CHAT_URL = "http://localhost:5000/create-chat";
const SEND_MESSAGE_URL = "http://localhost:5000/send-message";

// const CREATE_CHAT_URL = "https://aibot-backend-xl3x.onrender.com/create-chat";
// const SEND_MESSAGE_URL = "https://aibot-backend-xl3x.onrender.com/send-message";

// Map model names to backend IDs
const modelMap: Record<string, string> = {
  "Anthropic Claude Sonnet 4": "azure~anthropic.claude-4-sonnet",
  "Anthropic Claude Opus 4": "azure~anthropic.claude-4-opus",
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Anthropic Claude Sonnet 4");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
  };

  const handleSendMessage = async (
    content: string,
    pdfInfo?: { isPDF: boolean; fileName: string; file: File }
  ) => {
    setLoading(true);
    // Add user message to frontend
    if (pdfInfo?.isPDF && pdfInfo.file) {
      const fileUrl = URL.createObjectURL(pdfInfo.file); // for frontend rendering
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          type: "pdf",
          fileName: pdfInfo.fileName,
          fileUrl,
        },
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          type: "text",
          content,
        },
      ]);
    }

    try {
      // Step 1: Create chat if no chatId exists
      let currentChatId = chatId;
      if (!currentChatId) {
        const createResponse = await fetch(CREATE_CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: modelMap[selectedModel], // use selected model
          }),
        });
        const createData = await createResponse.json();
        console.log("Create chat response:", createData);
        currentChatId = createData.id; 
        setChatId(currentChatId);
      }

      console.log("Sending to backend:", { content, chat_id: currentChatId });

      // Step 2: Send message to API
      const sendResponse = await fetch(SEND_MESSAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          chat_id: currentChatId,
        }),
      });

      console.log("Send response status:", sendResponse.status);
      const sendData = await sendResponse.json();
      console.log("Send message response:", sendData); 
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        type: "text",
        content: sendData.response?.content || "No response from assistant", 
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          type: "text",
          content: "Error sending message. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader
        onNewChat={handleNewChat}
        isModelLocked={messages.length > 0}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />

      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-semibold text-foreground">
                What's on the agenda today?
              </h2>
              <p className="text-muted-foreground">
                Start a conversation by typing below
              </p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                type={message.type}
                content={message.content}
                fileName={message.fileName}
                fileUrl={message.fileUrl}
              />
            ))}
            {loading && (
              <div className="text-center text-sm text-muted-foreground my-2">
                Assistant is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <ChatInput onSend={handleSendMessage} disabled={loading} />
    </div>
  );
};

export default Index;
