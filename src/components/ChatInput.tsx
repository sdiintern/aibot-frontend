import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "@/components/ui/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface ChatInputProps {
  onSend: (content: string, pdfInfo?: { isPDF: boolean; fileName: string; file: File }) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const extractTextFromPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => (item as any).str).join(" ");
      fullText += pageText + "\n\n";
    }
    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        return;
      }

      // Size check
      const MAX_SIZE_MB = 2;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
      if (file.size > MAX_SIZE_BYTES) {
        toast({
          title: "File too large",
          description: `Please select a PDF smaller than ${MAX_SIZE_MB} MB.`,
          variant: "destructive",
        });
        return;
      }


      try {
        // 1. Extract text for backend
        const extractedText = await extractTextFromPDF(file);
        // Check if extraction succeeded
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error("No text could be extracted from this PDF.");
        }
        console.log("Extracted text:", extractedText); 

        // 2. Send extracted text to backend via parent onSend
        onSend(extractedText, { isPDF: true, fileName: file.name, file });

      } catch (err) {
        console.error("Error extracting PDF text:", err);
        toast({
          title: "Error processing PDF",
          description: (err as Error).message || "Failed to extract text from the PDF.",
          variant: "destructive",
        });
      }

      e.target.value = ""; // Reset file input
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      <div className="max-w-3xl mx-auto flex gap-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleFileClick}
          disabled={disabled}
          className="flex-shrink-0 h-[60px] w-[60px]"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] resize-none"
        />
        <Button
          type="submit"
          disabled={!input.trim() || disabled}
          size="icon"
          className="flex-shrink-0 h-[60px] w-[60px]"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
