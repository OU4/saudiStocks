import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, MinusCircle, AlertTriangle, BarChart2, BookOpen } from 'lucide-react';

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
  const getSentimentIcon = () => {
    switch (context.market_sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <MinusCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskIcon = () => {
    switch (context.risk_level) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="bg-muted/50 shadow-none">
      <CardContent className="p-3 text-sm">
        <div className="space-y-2">
          {context.instruments_mentioned.length > 0 && (
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span className="font-medium">Instruments:</span>
              <span className="text-muted-foreground">
                {context.instruments_mentioned.join(', ')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {getSentimentIcon()}
            <span className="font-medium">Market Sentiment:</span>
            <span className="text-muted-foreground capitalize">
              {context.market_sentiment}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {getRiskIcon()}
            <span className="font-medium">Risk Level:</span>
            <span className="text-muted-foreground capitalize">
              {context.risk_level}
            </span>
          </div>

          {context.technical_indicators.length > 0 && (
            <div className="flex items-start gap-2">
              <BarChart2 className="h-4 w-4 mt-1" />
              <div>
                <span className="font-medium">Technical Indicators:</span>
                <div className="text-muted-foreground">
                  {context.technical_indicators.join(', ')}
                </div>
              </div>
            </div>
          )}

          {context.fundamental_factors.length > 0 && (
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 mt-1" />
              <div>
                <span className="font-medium">Fundamental Factors:</span>
                <div className="text-muted-foreground">
                  {context.fundamental_factors.join(', ')}
                </div>
              </div>
            </div>
          )}

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