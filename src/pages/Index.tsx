import { useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

//for testing purposes
//const CREATE_CHAT_URL = "http://localhost:5000/create-chat";
//const SEND_MESSAGE_URL = "http://localhost:5000/send-message";

const CREATE_CHAT_URL = "https://aibot-backend-xl3x.onrender.com/create-chat";
const SEND_MESSAGE_URL = "https://aibot-backend-xl3x.onrender.com/send-message";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Step 1: Create chat if no chatId exists
      let currentChatId = chatId;
      if (!currentChatId) {
        const createResponse = await fetch(CREATE_CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "azure~anthropic.claude-4-opus",
          }),
        });
        const createData = await createResponse.json();
        console.log("Create chat response:", createData);
        currentChatId = createData.id; // adjust if your response uses a different key
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
      console.log("Send message response:", sendData); // <-- add this
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: sendData.response?.content || "No response from assistant", // adjust if your API returns differently
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Error sending message. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader onNewChat={handleNewChat} />
      
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
                content={message.content}
              />
            ))}
          </div>
        )}
        {loading && (
          <div className="text-center text-sm text-muted-foreground my-2">
            Assistant is typing...
          </div>
        )}
      </main>

      <ChatInput onSend={handleSendMessage} disabled={loading} />
    </div>
  );
};

export default Index;
