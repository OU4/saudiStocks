// components/MarketRiskAssessment.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldAlert, 
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";

interface RiskAssessmentProps {
  risks: {
    technical: string[];
    fundamental: string[];
    market: string[];
    riskLevel: 'low' | 'medium' | 'high';
    score: number;
  };
  isLoading?: boolean;
}

const RiskLevelBadge: React.FC<{ level: 'low' | 'medium' | 'high' }> = ({ level }) => {
  const variants = {
    low: {
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    medium: {
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    high: {
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const { className, icon } = variants[level];

  return (
    <Badge variant="outline" className={`${className} flex items-center gap-1`}>
      {icon}
      <span className="capitalize">{level} Risk</span>
    </Badge>
  );
};

const RiskCategory: React.FC<{
  title: string;
  risks: string[];
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'destructive';
}> = ({ title, risks, icon, variant = 'default' }) => {
  const variants = {
    default: {
      className: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900",
      titleColor: "text-blue-800 dark:text-blue-200",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    warning: {
      className: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900",
      titleColor: "text-yellow-800 dark:text-yellow-200",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    destructive: {
      className: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900",
      titleColor: "text-red-800 dark:text-red-200",
      iconColor: "text-red-600 dark:text-red-400",
    },
  };

  const { className, titleColor, iconColor } = variants[variant];

  if (risks.length === 0) {
    return null;
  }

  return (
    <Alert className={`${className} border`}>
      <div className={`${iconColor}`}>
        {icon}
      </div>
      <AlertTitle className={`${titleColor} font-semibold mb-2`}>
        {title}
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {risks.map((risk, index) => (
            <li key={index} className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{risk}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

const RiskScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score <= 30) return "text-green-600 dark:text-green-400";
    if (score <= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score <= 30) return "bg-green-600 dark:bg-green-400";
    if (score <= 60) return "bg-yellow-600 dark:bg-yellow-400";
    return "bg-red-600 dark:bg-red-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Risk Score</span>
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
          {score}/100
        </span>
      </div>
      <Progress
        value={score}
        className="h-2"
        indicatorClassName={getProgressColor(score)}
      />
      <p className="text-xs text-muted-foreground mt-1">
        {score <= 30 ? (
          "Low risk profile indicating stable market conditions"
        ) : score <= 60 ? (
          "Moderate risk level suggesting caution"
        ) : (
          "High risk environment requiring careful consideration"
        )}
      </p>
    </div>
  );
};

export const MarketRiskAssessment: React.FC<RiskAssessmentProps> = ({
  risks,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>
              Analysis of technical, fundamental, and market risks
            </CardDescription>
          </div>
          <RiskLevelBadge level={risks.riskLevel} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <RiskScoreIndicator score={risks.score} />

        <div className="grid gap-4">
          {/* Technical Risks */}
          <RiskCategory
            title="Technical Risk Factors"
            risks={risks.technical}
            icon={<TrendingDown className="h-5 w-5" />}
            variant={risks.technical.length >= 3 ? 'destructive' : 'warning'}
          />

          {/* Fundamental Risks */}
          <RiskCategory
            title="Fundamental Risk Factors"
            risks={risks.fundamental}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={risks.fundamental.length >= 3 ? 'destructive' : 'warning'}
          />

          {/* Market Risks */}
          <RiskCategory
            title="Market Risk Factors"
            risks={risks.market}
            icon={<ShieldAlert className="h-5 w-5" />}
            variant={risks.market.length >= 3 ? 'destructive' : 'warning'}
          />
        </div>

        {/* Risk Summary */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Overall risk assessment shows {' '}
            <span className="font-medium">
              {risks.riskLevel === 'low' ? 'favorable' :
               risks.riskLevel === 'medium' ? 'moderate' : 'challenging'
              }
            </span>
            {' '}market conditions. 
            {risks.score > 70 && (
              " Consider implementing risk management strategies."
            )}
            {risks.score > 90 && (
              " Immediate attention to risk factors is recommended."
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default MarketRiskAssessment;