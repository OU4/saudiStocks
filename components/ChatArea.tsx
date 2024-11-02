"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { HandHelping, WandSparkles, BookOpenText, Send, FileUp, Loader2 } from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from 'sonner';

interface Message {
  id: string;
  role: string;
  content: string;
}

const MessageContent = ({
  content,
  role,
}: {
  content: string;
  role: string;
}) => {
  const [thinking, setThinking] = useState(true);
  const [parsed, setParsed] = useState<{
    response?: string;
    thinking?: string;
    user_mood?: string;
    suggested_questions?: string[];
  }>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!content || role !== "assistant") return;

    const timer = setTimeout(() => {
      setError(true);
      setThinking(false);
    }, 30000);

    try {
      const result = JSON.parse(content);
      if (result.response && result.response.length > 0 && result.response !== "...") {
        setParsed(result);
        setThinking(false);
        clearTimeout(timer);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setError(true);
      setThinking(false);
    }

    return () => clearTimeout(timer);
  }, [content, role]);

  if (thinking && role === "assistant") {
    return (
      <div className="flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Thinking...</span>
      </div>
    );
  }

  if (error && !parsed.response) {
    return <div>Something went wrong. Please try again.</div>;
  }

  return (
    <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>
      {parsed.response || content}
    </ReactMarkdown>
  );
};

function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file");
      return;
    }
  
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
  
    try {
      // Convert to base64 right away and store it
      const base64Data = await convertToBase64(file);
      setPdfBase64Data(base64Data);
      setPdfFile(file);
      setPdfName(file.name);
      toast.success(`PDF uploaded: ${file.name}`);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF file");
    }
  };
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const clearFile = () => {
    setPdfFile(null);
    setPdfName("");
    setPdfBase64Data(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


// First, add a state for storing the PDF base64 data
const [pdfBase64Data, setPdfBase64Data] = useState<string | null>(null);


const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!input.trim() && !pdfFile) return;
  setIsLoading(true);

  try {
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input || `Analyze this PDF: ${pdfName}`,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        pdfData: pdfBase64Data, // Use the stored base64 data
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: JSON.stringify(data)
    }]);

  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to process the request. Please try again.");
  } finally {
    setIsLoading(false);
    // Remove these lines so we don't clear the PDF data after each message
    // setPdfFile(null);
    // setPdfName("");
    // if (fileInputRef.current) {
    //   fileInputRef.current.value = "";
    // }
  }
};

const ActivePDFIndicator = () => {
  if (!pdfName) return null;
  
  return (
    <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
      <span>📎 Active PDF: {pdfName}</span>
      <Button 
        type="button" 
        variant="ghost" 
        size="sm"
        onClick={clearFile}
        className="h-4 w-4 p-0 hover:bg-muted"
      >
        ✕
      </Button>
    </div>
  );
};
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() || pdfFile) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <Card className="flex-1 flex flex-col mb-4 mr-4 ml-4">
<CardContent className="flex-1 flex flex-col overflow-hidden pt-4 px-4 pb-0">
  <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
    <ActivePDFIndicator />
    {messages.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
        {/* ... existing welcome content ... */}
      </div>
    ) : (
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex items-start ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && (
                <Avatar className="w-8 h-8 mr-2 border">
                  <img src="/ant-logo.svg" alt="AI" />
                </Avatar>
              )}
              <div className={`p-3 rounded-lg max-w-[70%] ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"
              }`}>
                <MessageContent content={message.content} role={message.role} />
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    )}
  </div>
</CardContent>
      <CardFooter className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {pdfName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted rounded">
              <span>📎 {pdfName}</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={clearFile}
                className="h-auto p-1"
              >
                ✕
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleUploadClick}
              disabled={isLoading}
            >
              <FileUp className="h-4 w-4" />
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={pdfFile ? "Ask about the PDF..." : "Type your message..."}
              className="flex-1 min-h-[44px]"
              disabled={isLoading}
            />

            <Button type="submit" disabled={isLoading || (!input.trim() && !pdfFile)}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}

export default ChatArea;