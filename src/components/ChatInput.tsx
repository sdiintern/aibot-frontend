import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "@/components/ui/use-toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface PdfInfo {
  isPDF: boolean;
  fileName: string;
  file: File;
  displayText?: string; 
}

interface ChatInputProps {
  onSend: (content: string, pdfInfo?: PdfInfo) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => fileInputRef.current?.click();

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
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      return;
    }

    const MAX_SIZE_MB = 2;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a PDF smaller than ${MAX_SIZE_MB} MB.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const extractedText = await extractTextFromPDF(file);
      if (!extractedText.trim()) throw new Error("No text could be extracted from this PDF.");

      setPdfFile(file);     // Keep track of PDF
      setPdfText(extractedText); // Store PDF text separately
      setInput("");         // Keep textarea empty for user to type
    } catch (err) {
      console.error("PDF extraction error:", err);
      toast({
        title: "Error processing PDF",
        description: (err as Error).message || "Failed to extract text from the PDF.",
        variant: "destructive",
      });
    } finally {
      e.target.value = ""; // Reset file input
    }
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfText("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    // Combine PDF text + user input
    const combinedText = pdfText + (pdfText && input ? "\n\n" : "") + input;

    if (!combinedText.trim()) return;

    if (pdfFile) {
      onSend(combinedText, { isPDF: true, fileName: pdfFile.name, file: pdfFile, displayText: input });
      removePdf();
    } else {
      onSend(combinedText);
    }

    setInput(""); // Clear user input after sending
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* PDF attached badge */}
        {pdfFile && (
          <div className="flex items-center justify-between bg-gray-200 text-gray-800 px-3 py-1 rounded">
            <span>📄 PDF attached: {pdfFile.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removePdf}
              className="h-5 w-5 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-4">
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
            placeholder="Type a message..."
            disabled={disabled}
            className="min-h-[60px] max-h-[200px] resize-none flex-1"
          />

          <Button
            type="submit"
            disabled={!input.trim() && !pdfFile || disabled}
            size="icon"
            className="flex-shrink-0 h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;