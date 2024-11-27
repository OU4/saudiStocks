// In your components/MarketTechnicalAnalysis.tsx:
interface TechnicalAnalysisProps {
    analysis: {
      trend: string;
      signals: string[];
      indicators: any;
      strength: number;
    };
  }
  
  export const MarketTechnicalAnalysis = ({ analysis }: TechnicalAnalysisProps) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Technical Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Trend Indicators */}
          <div className="p-4 bg-card rounded-lg">
            <h4>Market Trend</h4>
            <p className={`text-${analysis.trend === 'upward' ? 'green' : 'red'}-500`}>
              {analysis.trend}
            </p>
          </div>
          
          {/* Technical Signals */}
          <div className="p-4 bg-card rounded-lg">
            <h4>Signals</h4>
            <ul className="list-disc pl-4">
              {analysis.signals.map((signal, index) => (
                <li key={index}>{signal}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  