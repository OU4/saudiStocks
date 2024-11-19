import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, MinusCircle, AlertTriangle, BarChart2, BookOpen } from 'lucide-react';
import { MessageContent } from './MessageContent';

interface FinancialContextProps {
  context: {
    instruments_mentioned: string[];
    market_sentiment: 'bullish' | 'bearish' | 'neutral';
    risk_level: 'low' | 'medium' | 'high';
    confidence_score: number;
    technical_indicators: string[];
    fundamental_factors: string[];
  };
}

const FinancialContext: React.FC<FinancialContextProps> = ({ context }) => {
  const instrumentsMentioned = context.instruments_mentioned || [];
  const technicalIndicators = context.technical_indicators || [];
  const fundamentalFactors = context.fundamental_factors || [];

  const renderSection = (icon: JSX.Element, title: string, content: string | JSX.Element) => (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-medium">{title}:</span>
      <span className="text-muted-foreground">{content}</span>
    </div>
  );

  return (
    <Card className="bg-muted/50 shadow-none">
      <CardContent className="p-3 text-sm">
        <div className="space-y-2">
          {instrumentsMentioned.length > 0 &&
            renderSection(<BarChart2 className="h-4 w-4" />, 'Instruments', instrumentsMentioned.join(', '))}

          {/* {renderSection(getSentimentIcon(), 'Market Sentiment', context.market_sentiment)}

          {renderSection(getRiskIcon(), 'Risk Level', context.risk_level)} */}

          {technicalIndicators.length > 0 &&
            renderSection(<BarChart2 className="h-4 w-4 mt-1" />, 'Technical Indicators', technicalIndicators.join(', '))}

          {fundamentalFactors.length > 0 &&
            renderSection(<BookOpen className="h-4 w-4 mt-1" />, 'Fundamental Factors', fundamentalFactors.join(', '))}

          <div className="flex items-center gap-2">
            <div className="flex-grow bg-secondary h-1.5 rounded">
              <div
                className="bg-primary h-full rounded"
                style={{ width: `${context.confidence_score * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(context.confidence_score * 100)}% confidence
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default FinancialContext;
