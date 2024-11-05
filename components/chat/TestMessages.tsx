// /app/components/chat/TestMessages.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { BugPlay } from 'lucide-react';

const testMessages = [
  {
    role: 'user',
    content: 'What do you think about AAPL stock? Its technical indicators show RSI is overbought.'
  },
  {
    role: 'user',
    content: 'How are the market conditions affecting Tesla and other EV stocks?'
  },
  {
    role: 'user',
    content: 'Can you analyze the PE ratio and revenue growth of Microsoft?'
  }
];

interface TestMessagesProps {
  onTest: (message: string) => void;
  isTestMode: boolean;
  setTestMode: (mode: boolean) => void;
}

export const TestMessages: React.FC<TestMessagesProps> = ({ 
  onTest, 
  isTestMode, 
  setTestMode 
}) => {
  return (
    <div className="fixed bottom-24 right-4 z-50">
      {isTestMode && (
        <div className="mb-2 space-y-2">
          {testMessages.map((msg, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onTest(msg.content)}
              className="w-full"
            >
              Test {index + 1}: {msg.content.slice(0, 30)}...
            </Button>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTestMode(!isTestMode)}
        className="flex items-center gap-2"
      >
        <BugPlay className="h-4 w-4" />
        {isTestMode ? 'Hide Tests' : 'Show Tests'}
      </Button>
    </div>
  );
};