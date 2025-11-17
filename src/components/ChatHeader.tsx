import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown } from "lucide-react";

interface ChatHeaderProps {
  onNewChat: () => void;
  isModelLocked?: boolean;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const ChatHeader = ({ onNewChat, isModelLocked = false, selectedModel, onSelectModel }: ChatHeaderProps) => {

  const models = [
    "Anthropic Claude Sonnet 4",
    "Anthropic Claude Opus 4",
    "OpenAI GPT-5-nano",
    "OpenAI GPT-5-mini",
    "OpenAI GPT-5",
    "Google Gemini 2.5 Pro",
    "Google Gemini 2.5 Flash",
    "Google Gemini 2.5 Flash Lite",
    "Anthropic Claude Sonnet 4.5",
    "Anthropic Claude Opus 4.1",
    "OpenAI o3-mini",
    "OpenAI o3",
    "OpenAI GPT-4o-mini",
    "OpenAI GPT-4o",
  ];

  return (
    <header className="border-b bg-background px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">Chat</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                disabled={isModelLocked}
                className="gap-2 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedModel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50 bg-background">
              {models.map((model) => (
                <DropdownMenuItem
                  key={model}
                  onClick={() => onSelectModel(model)}
                  className="cursor-pointer"
                >
                  {model}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
      </div>
    </header>
  );
};

export default ChatHeader;
