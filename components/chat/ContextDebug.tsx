// /app/components/chat/ContextDebug.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Message } from '@/app/market/types/chat';

interface ContextDebugProps {
  messages: Message[];
  isVisible: boolean;
}

export const ContextDebug: React.FC<ContextDebugProps> = ({ messages, isVisible }) => {
  if (!isVisible) return null;

  const getContextStats = () => {
    const stats = {
      totalMessages: messages.length,
      instrumentsMentioned: new Set<string>(),
      technicalIndicators: new Set<string>(),
      fundamentalFactors: new Set<string>(),
      sentiments: new Set<string>(),
      totalConfidence: 0,
    };

    messages.forEach(msg => {
      if (msg.metadata) {
        msg.metadata.instruments?.forEach(i => stats.instrumentsMentioned.add(i));
        msg.metadata.technicalIndicators?.forEach(i => stats.technicalIndicators.add(i));
        msg.metadata.fundamentalFactors?.forEach(i => stats.fundamentalFactors.add(i));
        if (msg.metadata.sentiment) stats.sentiments.add(msg.metadata.sentiment);
        if (msg.metadata.confidenceScore) stats.totalConfidence += msg.metadata.confidenceScore;
      }
    });

    return {
      ...stats,
      averageConfidence: stats.totalConfidence / messages.length || 0,
    };
  };

  const stats = getContextStats();

  return (
    <Card className="fixed top-20 right-4 w-80 z-50 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-sm">Context Debug</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Total Messages:</div>
          <div>{stats.totalMessages}</div>

          <div className="font-medium">Instruments:</div>
          <div>{Array.from(stats.instrumentsMentioned).join(', ') || 'None'}</div>

          <div className="font-medium">Technical Indicators:</div>
          <div>{Array.from(stats.technicalIndicators).join(', ') || 'None'}</div>

          <div className="font-medium">Fundamental Factors:</div>
          <div>{Array.from(stats.fundamentalFactors).join(', ') || 'None'}</div>

          <div className="font-medium">Sentiments:</div>
          <div>{Array.from(stats.sentiments).join(', ') || 'None'}</div>

          <div className="font-medium">Avg Confidence:</div>
          <div>{(stats.averageConfidence * 100).toFixed(1)}%</div>
        </div>

        <div className="mt-4">
          <div className="font-medium mb-1">Latest Context:</div>
          <pre className="text-[10px] bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(messages[messages.length - 1]?.metadata || {}, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};