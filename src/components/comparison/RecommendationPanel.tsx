// CREATED: 2025-07-10 - Smart recommendation panel with actionable insights

"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Target,
  Crown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  DollarSign,
  Calendar,
  Shield,
  Zap,
  ArrowRight,
  Eye,
  Clock,
  Building,
  Calculator,
  Star,
  Info,
  Rocket,
} from "lucide-react";

import { CalculationResultWithSale } from "@/types/sale-scenario";
import { formatVND, formatPercent } from "@/lib/financial-utils";

// ===== INTERFACES =====
interface RecommendationPanelProps {
  scenarios: CalculationResultWithSale[];
  className?: string;
}

interface ScenarioAnalysis {
  scenario: CalculationResultWithSale;
  index: number;
  scenarioType: "buy_now" | "buy_future" | "standard";
  displayName: string;
  scores: {
    roi: number;
    cashFlow: number;
    risk: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
}

interface Recommendation {
  type: "primary" | "alternative" | "caution";
  title: string;
  scenario: CalculationResultWithSale;
  scenarioType: "buy_now" | "buy_future" | "standard";
  reasoning: string[];
  keyMetrics: { label: string; value: string; isGood: boolean }[];
  actionItems: string[];
  riskLevel: "low" | "medium" | "high";
  confidence: number; // 0-100
}

// ===== UTILITY FUNCTIONS =====
const getScenarioType = (
  scenario: CalculationResultWithSale
): "buy_now" | "buy_future" | "standard" => {
  if (scenario.scenarioType) {
    return scenario.scenarioType;
  }

  if (
    scenario.purchaseTimingInfo?.monthsFromNow &&
    scenario.purchaseTimingInfo.monthsFromNow > 0
  ) {
    return "buy_future";
  }

  const name = scenario.scenarioName?.toLowerCase() || "";
  if (name.includes("mua ngay") || name.includes("buy now")) {
    return "buy_now";
  }
  if (name.includes("mua tương lai") || name.includes("buy future")) {
    return "buy_future";
  }

  return "standard";
};

const calculateRiskScore = (scenario: CalculationResultWithSale): number => {
  let risk = 0;
  
  // Loan-to-value risk
  const ltv = scenario.inputs?.tyLeVay || 0;
  if (ltv > 80) risk += 30;
  else if (ltv > 60) risk += 15;
  
  // Cash flow risk
  const cashFlow = scenario.steps?.dongTienRongBDS || 0;
  if (cashFlow < 0) risk += 40;
  else if (cashFlow < 1000000) risk += 20;
  
  // Interest rate risk
  const interestRate = scenario.inputs?.laiSuatThaNoi || 0;
  if (interestRate > 15) risk += 20;
  else if (interestRate > 12) risk += 10;
  
  // Rental yield risk
  const rentalYield = scenario.rentalYield || 0;
  if (rentalYield < 4) risk += 10;
  
  return Math.min(100, risk);
};

const analyzeScenario = (
  scenario: CalculationResultWithSale,
  index: number
): ScenarioAnalysis => {
  const scenarioType = getScenarioType(scenario);
  const roi = scenario.roiHangNam || 0;
  const cashFlow = scenario.steps?.dongTienRongBDS || 0;
  const riskScore = calculateRiskScore(scenario);
  
  // Calculate overall score (weighted)
  const roiScore = Math.min(100, Math.max(0, roi * 10));
  const cashFlowScore = Math.min(100, Math.max(0, 50 + (cashFlow / 1000000) * 10));
  const riskScoreInverted = 100 - riskScore;
  const overallScore = (roiScore * 0.4 + cashFlowScore * 0.3 + riskScoreInverted * 0.3);

  // Identify strengths
  const strengths: string[] = [];
  if (roi > 15) strengths.push(`ROI cao (${formatPercent(roi)})`);
  if (cashFlow > 2000000) strengths.push(`Dòng tiền tốt (${formatVND(cashFlow)}/tháng)`);
  if (riskScore < 30) strengths.push("Rủi ro thấp");
  if (scenario.rentalYield && scenario.rentalYield > 6) {
    strengths.push(`Rental yield cao (${formatPercent(scenario.rentalYield)})`);
  }
  if (scenario.saleAnalysis?.totalROIOnSale && scenario.saleAnalysis.totalROIOnSale > 20) {
    strengths.push(`ROI khi bán cao (${formatPercent(scenario.saleAnalysis.totalROIOnSale)})`);
  }

  // Identify weaknesses
  const weaknesses: string[] = [];
  if (roi < 8) weaknesses.push(`ROI thấp (${formatPercent(roi)})`);
  if (cashFlow < 0) weaknesses.push(`Dòng tiền âm (${formatVND(cashFlow)}/tháng)`);
  if (riskScore > 60) weaknesses.push("Rủi ro cao");
  if ((scenario.inputs?.tyLeVay || 0) > 80) {
    weaknesses.push(`Tỷ lệ vay cao (${formatPercent(scenario.inputs?.tyLeVay || 0)})`);
  }
  if (scenario.paybackPeriod && scenario.paybackPeriod > 15) {
    weaknesses.push(`Hoàn vốn lâu (${scenario.paybackPeriod.toFixed(1)} năm)`);
  }

  return {
    scenario,
    index,
    scenarioType,
    displayName: scenario.scenarioName || `Kịch bản ${index + 1}`,
    scores: {
      roi: roiScore,
      cashFlow: cashFlowScore,
      risk: riskScoreInverted,
      overall: overallScore,
    },
    strengths,
    weaknesses,
  };
};

const generateRecommendations = (analyses: ScenarioAnalysis[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Sort by overall score
  const sortedAnalyses = [...analyses].sort((a, b) => b.scores.overall - a.scores.overall);
  const bestScenario = sortedAnalyses[0];
  
  if (bestScenario) {
    const riskLevel = bestScenario.scores.risk > 70 ? "low" : bestScenario.scores.risk > 40 ? "medium" : "high";
    
    // Primary recommendation
    const primaryRecommendation: Recommendation = {
      type: "primary",
      title: `Khuyến nghị: ${bestScenario.displayName}`,
      scenario: bestScenario.scenario,
      scenarioType: bestScenario.scenarioType,
      reasoning: [
        `Điểm số tổng thể cao nhất: ${bestScenario.scores.overall.toFixed(0)}/100`,
        `ROI: ${formatPercent(bestScenario.scenario.roiHangNam || 0)}`,
        `Dòng tiền: ${formatVND(bestScenario.scenario.steps?.dongTienRongBDS || 0)}/tháng`,
        ...(bestScenario.strengths.slice(0, 2).map(s => `✓ ${s}`)),
      ],
      keyMetrics: [
        {
          label: "ROI Hàng Năm",
          value: formatPercent(bestScenario.scenario.roiHangNam || 0),
          isGood: (bestScenario.scenario.roiHangNam || 0) > 10,
        },
        {
          label: "Dòng Tiền/Tháng",
          value: formatVND(bestScenario.scenario.steps?.dongTienRongBDS || 0),
          isGood: (bestScenario.scenario.steps?.dongTienRongBDS || 0) > 0,
        },
        {
          label: "Vốn Ban Đầu",
          value: formatVND(bestScenario.scenario.steps?.tongVonBanDau || 0),
          isGood: true,
        },
      ],
      actionItems: generateActionItems(bestScenario),
      riskLevel,
      confidence: Math.min(95, bestScenario.scores.overall),
    };
    
    recommendations.push(primaryRecommendation);
  }

  // Alternative recommendations
  if (sortedAnalyses.length > 1) {
    const buyNowScenarios = sortedAnalyses.filter(a => a.scenarioType === "buy_now");
    const futureScenarios = sortedAnalyses.filter(a => a.scenarioType === "buy_future");
    
    if (bestScenario.scenarioType === "buy_now" && futureScenarios.length > 0) {
      const bestFuture = futureScenarios[0];
      recommendations.push({
        type: "alternative",
        title: `Phương án thay thế: ${bestFuture.displayName}`,
        scenario: bestFuture.scenario,
        scenarioType: "buy_future",
        reasoning: [
          `Tốt nhất trong các kịch bản mua tương lai`,
          `ROI dự kiến: ${formatPercent(bestFuture.scenario.roiHangNam || 0)}`,
          `Thời gian chuẩn bị thêm vốn và nghiên cứu thị trường`,
        ],
        keyMetrics: [
          {
            label: "ROI Dự Kiến",
            value: formatPercent(bestFuture.scenario.roiHangNam || 0),
            isGood: (bestFuture.scenario.roiHangNam || 0) > 10,
          },
        ],
        actionItems: generateActionItems(bestFuture),
        riskLevel: bestFuture.scores.risk > 70 ? "low" : "medium",
        confidence: Math.min(85, bestFuture.scores.overall),
      });
    } else if (bestScenario.scenarioType === "buy_future" && buyNowScenarios.length > 0) {
      const bestNow = buyNowScenarios[0];
      recommendations.push({
        type: "alternative",
        title: `Phương án thay thế: ${bestNow.displayName}`,
        scenario: bestNow.scenario,
        scenarioType: "buy_now",
        reasoning: [
          `Lợi thế thời gian - bắt đầu sinh lời ngay`,
          `ROI hiện tại: ${formatPercent(bestNow.scenario.roiHangNam || 0)}`,
          `Tránh rủi ro biến động thị trường tương lai`,
        ],
        keyMetrics: [
          {
            label: "ROI Hiện Tại",
            value: formatPercent(bestNow.scenario.roiHangNam || 0),
            isGood: (bestNow.scenario.roiHangNam || 0) > 8,
          },
        ],
        actionItems: generateActionItems(bestNow),
        riskLevel: bestNow.scores.risk > 70 ? "low" : "medium",
        confidence: Math.min(80, bestNow.scores.overall),
      });
    }
  }

  // Caution if all scenarios have issues
  const hasHighRiskScenarios = analyses.some(a => a.scores.risk < 40);
  if (hasHighRiskScenarios && bestScenario && bestScenario.scores.overall < 60) {
    recommendations.push({
      type: "caution",
      title: "Cảnh báo: Cân nhắc kỹ trước khi đầu tư",
      scenario: bestScenario.scenario,
      scenarioType: bestScenario.scenarioType,
      reasoning: [
        "Tất cả kịch bản đều có mức rủi ro đáng kể",
        "Cần nghiên cứu thêm hoặc điều chỉnh thông số",
        "Xem xét tư vấn chuyên gia",
      ],
      keyMetrics: [],
      actionItems: [
        "Tham khảo ý kiến chuyên gia tài chính",
        "Nghiên cứu thêm về thị trường địa phương",
        "Xem xét giảm tỷ lệ vay hoặc tăng vốn tự có",
        "Đánh giá lại giá trị và tiềm năng cho thuê của BĐS",
      ],
      riskLevel: "high",
      confidence: 50,
    });
  }

  return recommendations;
};

const generateActionItems = (analysis: ScenarioAnalysis): string[] => {
  const actions: string[] = [];
  
  if (analysis.scenarioType === "buy_now") {
    actions.push("Liên hệ ngân hàng để chuẩn bị hồ sơ vay");
    actions.push("Khảo sát kỹ về vị trí và pháp lý của BĐS");
    actions.push("Chuẩn bị đầy đủ vốn ban đầu cần thiết");
    
    if ((analysis.scenario.steps?.dongTienRongBDS || 0) < 1000000) {
      actions.push("Tìm cách tối ưu dòng tiền (tăng giá thuê, giảm chi phí)");
    }
  } else {
    actions.push("Theo dõi sát diễn biến thị trường BĐS");
    actions.push("Tích lũy thêm vốn để chuẩn bị cho thời điểm mua");
    actions.push("Nghiên cứu kỹ về khu vực đầu tư");
    
    if (analysis.scenario.purchaseTimingInfo?.monthsFromNow) {
      const months = analysis.scenario.purchaseTimingInfo.monthsFromNow;
      actions.push(`Lập kế hoạch tài chính cho ${months} tháng tới`);
    }
  }
  
  // Risk-specific actions
  if (analysis.scores.risk < 50) {
    actions.push("Xem xét mua bảo hiểm BĐS và thu nhập");
    actions.push("Chuẩn bị quỹ dự phòng cho rủi ro trống phòng");
  }
  
  return actions;
};

// ===== MAIN COMPONENT =====
export default function RecommendationPanel({
  scenarios,
  className = "",
}: RecommendationPanelProps) {
  // Analyze all scenarios
  const analyses = useMemo(() => {
    return scenarios.map((scenario, index) => analyzeScenario(scenario, index));
  }, [scenarios]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(analyses);
  }, [analyses]);

  if (scenarios.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Khuyến Nghị Đầu Tư
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Cần ít nhất một kịch bản để đưa ra khuyến nghị.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Khuyến Nghị Đầu Tư
          <Badge variant="secondary">{recommendations.length} khuyến nghị</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {recommendations.map((rec, index) => (
          <div key={index}>
            {/* Recommendation Header */}
            <div className="flex items-center gap-2 mb-3">
              {rec.type === "primary" && <Crown className="h-5 w-5 text-yellow-500" />}
              {rec.type === "alternative" && <Star className="h-5 w-5 text-blue-500" />}
              {rec.type === "caution" && <AlertTriangle className="h-5 w-5 text-red-500" />}
              
              <h3 className="font-semibold text-lg">{rec.title}</h3>
              
              <Badge
                variant={rec.type === "primary" ? "default" : rec.type === "caution" ? "destructive" : "secondary"}
                className="ml-auto"
              >
                {rec.confidence}% tin cậy
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Reasoning & Metrics */}
              <div className="space-y-4">
                {/* Reasoning */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Lý do
                  </h4>
                  <ul className="space-y-1">
                    {rec.reasoning.map((reason, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Metrics */}
                {rec.keyMetrics.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Chỉ số quan trọng
                    </h4>
                    <div className="space-y-2">
                      {rec.keyMetrics.map((metric, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{metric.label}:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{metric.value}</span>
                            {metric.isGood ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Level */}
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Mức rủi ro:</span>
                  <Badge
                    variant={
                      rec.riskLevel === "low" ? "default" :
                      rec.riskLevel === "medium" ? "secondary" : "destructive"
                    }
                  >
                    {rec.riskLevel === "low" ? "Thấp" : 
                     rec.riskLevel === "medium" ? "Trung bình" : "Cao"}
                  </Badge>
                </div>
              </div>

              {/* Right Column: Action Items */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Các bước cần làm
                </h4>
                <div className="space-y-2">
                  {rec.actionItems.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">
                        {i + 1}
                      </div>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {index < recommendations.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}

        {/* Summary */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Lưu ý:</strong> Đây là khuyến nghị dựa trên các thông số đầu vào. 
            Hãy tham khảo thêm ý kiến chuyên gia và nghiên cứu kỹ thị trường trước khi đưa ra quyết định cuối cùng.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}