import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ChatHeaderProps {
  onNewChat: () => void;
}

const ChatHeader = ({ onNewChat }: ChatHeaderProps) => {
  return (
    <header className="border-b bg-background px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">Chat</h1>
        <Button
          onClick={onNewChat}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
