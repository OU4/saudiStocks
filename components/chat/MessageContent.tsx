import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Loader2 } from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";
import { ChatResponse } from "@/app/market/types/chat";
import FinancialContext from "./FinancialContext";
import { Button } from "@/components/ui/button";

interface MessageContentProps {
  content: string;
  role: string;
  onQuestionClick?: (question: string) => void;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  role,
  onQuestionClick
}) => {
  const [thinking, setThinking] = useState(true);
  const [parsed, setParsed] = useState<Partial<ChatResponse>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!content || role !== "assistant") return;

    const timer = setTimeout(() => {
      setError(true);
      setThinking(false);
    }, 30000);

    try {
      const result = JSON.parse(content) as ChatResponse;
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
        <span>Analyzing financial data...</span>
      </div>
    );
  }

  if (error && !parsed.response) {
    return <div>Failed to analyze financial data. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>
        {parsed.response || content}
      </ReactMarkdown>

      {parsed.financial_context && role === "assistant" && (
        <FinancialContext context={parsed.financial_context} />
      )}

      {parsed.suggested_questions && parsed.suggested_questions.length > 0 && role === "assistant" && (
        <div className="flex flex-wrap gap-2 mt-4">
          {parsed.suggested_questions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onQuestionClick?.(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};