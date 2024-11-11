"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { HandHelping, WandSparkles, BookOpenText, Send, FileUp, Loader2 } from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { MessageContent } from './chat/MessageContent';
import { Message } from "@/app/market/types/chat";


function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [pdfBase64Data, setPdfBase64Data] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

  const clearFile = () => {
    setPdfFile(null);
    setPdfName("");
    setPdfBase64Data(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() && !pdfFile) return;
    setIsLoading(true);

    try {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: input || `Analyze this PDF: ${pdfName}`,
        metadata: {
          instruments: [],
          sentiment: 'neutral',
          riskLevel: 'medium',
          confidenceScore: 0.5,
          technicalIndicators: [],
          fundamentalFactors: []
        }
      };

      setMessages(prev => [...prev, userMessage]);
      setInput("");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          pdfData: pdfBase64Data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: JSON.stringify(data),
        metadata: {
          instruments: data.financial_context.instruments_mentioned,
          sentiment: data.financial_context.market_sentiment,
          riskLevel: data.financial_context.risk_level,
          confidenceScore: data.financial_context.confidence_score,
          technicalIndicators: data.financial_context.technical_indicators,
          fundamentalFactors: data.financial_context.fundamental_factors
        }
      }]);

    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to process the financial analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() || pdfFile) {
        handleSubmit(e as any);
      }
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

  return (
    <Card className="flex-1 flex flex-col mb-4 mr-4 ml-4">
      <CardContent className="flex-1 flex flex-col overflow-hidden pt-4 px-4 pb-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
          <ActivePDFIndicator />
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
                <WelcomeCard
                  icon={<HandHelping className="h-6 w-6" />}
                  title="Financial Assistant"
                  description="Get help with financial analysis, market insights, and investment strategies"
                />
                <WelcomeCard
                  icon={<WandSparkles className="h-6 w-6" />}
                  title="Market Analysis"
                  description="Analyze market trends, technical indicators, and financial instruments"
                />
                <WelcomeCard
                  icon={<BookOpenText className="h-6 w-6" />}
                  title="Document Analysis"
                  description="Upload financial documents for detailed analysis and insights"
                />
              </div>
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
                      <MessageContent 
                        content={message.content} 
                        role={message.role}
                        onQuestionClick={handleQuestionClick}
                      />
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

interface WelcomeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ icon, title, description }) => (
  <Card className="p-6 flex flex-col items-center text-center space-y-2 transition-all duration-200 hover:scale-105">
    <div className="p-2 rounded-full bg-primary/10">{icon}</div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </Card>
);

export default ChatArea;