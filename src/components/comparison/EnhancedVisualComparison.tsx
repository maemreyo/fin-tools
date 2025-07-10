"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Crown,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Target,
  Zap,
  Award,
  ThumbsUp,
  ThumbsDown,
  Eye,
  BarChart3,
  PieChart,
  Gauge,
  DollarSign,
  Home,
  Calendar,
  Percent,
  Users,
  Building,
  Factory,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  FlameIcon as Fire,
  Snowflake,
  Lightbulb,
  AlertCircle,
  Info,
  Clock,
  Clock4,
  Timer,
  CalendarDays,
  Rocket,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { CalculationResult } from "@/types/real-estate";
import { CalculationResultWithSale } from "@/types/sale-scenario";
import { formatVND, formatPercent } from "@/lib/financial-utils";
import { Label } from "@/components/ui/label";

// ===== ENHANCED INTERFACES =====
interface EnhancedVisualComparisonProps {
  scenarios: CalculationResult[];
  onSelectScenario?: (scenario: CalculationResult) => void;
  onRemoveScenario?: (index: number) => void;
  showRecommendation?: boolean; // 🆕 Show overall recommendation
  comparisonMode?: "standard" | "buy_now_vs_future"; // 🆕 New comparison mode
}

// ===== ENHANCED SCENARIO PROPERTY INTERFACE =====
interface EnhancedScenarioProperty {
  scenario: CalculationResult;
  scenarioIndex: number;
  rank: number;
  scores: {
    overall: number;
    roi: number;
    cashFlow: number;
    risk: number;
  };
  // 🆕 Enhanced properties for future scenarios
  scenarioType: "buy_now" | "buy_future" | "standard";
  purchaseTimingInfo?: {
    purchaseDate: Date;
    monthsFromNow?: number;
    projectionYears?: number;
  };
  economicScenarioInfo?: {
    id: string;
    name: string;
    description: string;
  };
  projectionSummary?: {
    propertyValueChange?: number;
    rentalIncomeChange?: number;
    interestRateChange?: number;
    projectionWarnings?: string[];
  };
  strengths: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    value: string;
    impact: "high" | "medium" | "low";
  }>;
  weaknesses: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    value: string;
    impact: "high" | "medium" | "low";
  }>;
}

// ===== ENHANCED COMPARISON METRICS =====
const ENHANCED_COMPARISON_METRICS = [
  {
    key: "roiHangNam",
    name: "ROI hàng năm",
    category: "performance",
    getValue: (s: CalculationResult) => s.roiHangNam || 0,
    format: (v: number) => formatPercent(v),
    higherIsBetter: true,
    description: "Tỷ suất lợi nhuận hàng năm",
    weight: 30,
  },
  {
    key: "dongTienRongBDS",
    name: "Dòng tiền ròng/tháng",
    category: "performance",
    getValue: (s: CalculationResult) => s.steps.dongTienRongBDS || 0,
    format: (v: number) => formatVND(v),
    higherIsBetter: true,
    description: "Dòng tiền ròng hàng tháng từ BĐS",
    weight: 25,
  },
  {
    key: "tongVonBanDau",
    name: "Vốn ban đầu",
    category: "financial",
    getValue: (s: CalculationResult) => s.steps.tongVonBanDau || 0,
    format: (v: number) => formatVND(v),
    higherIsBetter: false,
    description: "Tổng vốn cần đầu tư ban đầu",
    weight: 15,
  },
  {
    key: "paybackPeriod",
    name: "Thời gian hoàn vốn",
    category: "risk",
    getValue: (s: CalculationResult) => s.paybackPeriod || 0,
    format: (v: number) => (v > 0 ? `${v.toFixed(1)} năm` : "N/A"),
    higherIsBetter: false,
    description: "Thời gian thu hồi vốn đầu tư",
    weight: 15,
  },
  {
    key: "rentalYield",
    name: "Rental Yield",
    category: "performance",
    getValue: (s: CalculationResult) => s.rentalYield || 0,
    format: (v: number) => formatPercent(v),
    higherIsBetter: true,
    description: "Tỷ lệ lợi nhuận từ cho thuê",
    weight: 10,
  },
  {
    key: "netPresentValue",
    name: "NPV",
    category: "performance",
    getValue: (s: CalculationResult) => s.netPresentValue || 0,
    format: (v: number) => formatVND(v),
    higherIsBetter: true,
    description: "Giá trị hiện tại ròng",
    weight: 5,
  },
];

// ===== UTILITY FUNCTIONS =====
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || isNaN(value)) return 0;
  return Number(value) || 0;
};

const formatSafePercent = (value: any): string => {
  const num = safeNumber(value);
  return `${num.toFixed(1)}%`;
};

const formatSafeVND = (value: any): string => {
  const num = safeNumber(value);
  return formatVND(num);
};

// 🆕 Get scenario type from enhanced metadata
const getScenarioType = (
  scenario: CalculationResult
): "buy_now" | "buy_future" | "standard" => {
  if (scenario.scenarioType) {
    return scenario.scenarioType;
  }

  // Fallback detection based on scenario name or other properties
  if (
    scenario.purchaseTimingInfo?.monthsFromNow &&
    scenario.purchaseTimingInfo.monthsFromNow > 0
  ) {
    return "buy_future";
  }

  if (
    scenario.scenarioName?.toLowerCase().includes("mua ngay") ||
    scenario.scenarioName?.toLowerCase().includes("buy now")
  ) {
    return "buy_now";
  }

  return "standard";
};

// 🆕 Get scenario type badge
const getScenarioTypeBadge = (
  scenarioType: "buy_now" | "buy_future" | "standard"
) => {
  switch (scenarioType) {
    case "buy_now":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <Zap className="h-3 w-3 mr-1" />
          Mua Ngay
        </Badge>
      );
    case "buy_future":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <Clock className="h-3 w-3 mr-1" />
          Mua Tương Lai
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <BarChart3 className="h-3 w-3 mr-1" />
          Kịch Bản
        </Badge>
      );
  }
};

// ===== MAIN COMPONENT =====
export default function EnhancedVisualComparison({
  scenarios,
  onSelectScenario,
  onRemoveScenario,
  showRecommendation = true,
  comparisonMode = "standard",
}: EnhancedVisualComparisonProps) {
  const [sortBy, setSortBy] = useState<"overall" | "roi" | "cashFlow" | "risk">(
    "overall"
  );
  const [showDetails, setShowDetails] = useState<{ [key: number]: boolean }>(
    {}
  );

  // ===== ENHANCED SCENARIO ANALYSIS =====
  const enhancedProperties = useMemo((): EnhancedScenarioProperty[] => {
    return scenarios.map((scenario, index) => {
      const scenarioType = getScenarioType(scenario);

      // Calculate scores
      const roiScore = Math.min(
        100,
        Math.max(0, (scenario.roiHangNam || 0) * 5)
      );
      const cashFlowScore = Math.min(
        100,
        Math.max(0, 50 + ((scenario.steps.dongTienRongBDS || 0) / 1000000) * 10)
      );
      const riskScore =
        100 -
        Math.min(
          100,
          Math.max(
            0,
            (scenario.inputs.tyLeVay || 0) + (scenario.paybackPeriod || 0) * 5
          )
        );
      const overallScore =
        roiScore * 0.4 + cashFlowScore * 0.3 + riskScore * 0.3;

      // Generate strengths and weaknesses
      const strengths = [];
      const weaknesses = [];

      // ROI Analysis
      if ((scenario.roiHangNam || 0) > 15) {
        strengths.push({
          icon: <TrendingUp className="h-4 w-4 text-green-600" />,
          title: "ROI cao",
          description: "Tỷ suất lợi nhuận vượt trội",
          value: formatPercent(scenario.roiHangNam || 0),
          impact: "high" as const,
        });
      } else if ((scenario.roiHangNam || 0) < 8) {
        weaknesses.push({
          icon: <TrendingDown className="h-4 w-4 text-red-600" />,
          title: "ROI thấp",
          description: "Tỷ suất lợi nhuận dưới kỳ vọng",
          value: formatPercent(scenario.roiHangNam || 0),
          impact: "high" as const,
        });
      }

      // Cash Flow Analysis
      if ((scenario.steps.dongTienRongBDS || 0) > 5000000) {
        strengths.push({
          icon: <DollarSign className="h-4 w-4 text-green-600" />,
          title: "Dòng tiền tích cực",
          description: "Dòng tiền ròng hàng tháng tốt",
          value: formatVND(scenario.steps.dongTienRongBDS || 0),
          impact: "medium" as const,
        });
      } else if ((scenario.steps.dongTienRongBDS || 0) < 0) {
        weaknesses.push({
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          title: "Dòng tiền âm",
          description: "Cần bù thêm tiền hàng tháng",
          value: formatVND(scenario.steps.dongTienRongBDS || 0),
          impact: "high" as const,
        });
      }

      // Risk Analysis
      if ((scenario.inputs.tyLeVay || 0) > 80) {
        weaknesses.push({
          icon: <AlertCircle className="h-4 w-4 text-orange-600" />,
          title: "Đòn bẩy cao",
          description: "Tỷ lệ vay cao, rủi ro lớn",
          value: `${scenario.inputs.tyLeVay}%`,
          impact: "medium" as const,
        });
      }

      return {
        scenario,
        scenarioIndex: index,
        rank: 0, // Will be calculated later
        scores: {
          overall: overallScore,
          roi: roiScore,
          cashFlow: cashFlowScore,
          risk: riskScore,
        },
        scenarioType,
        purchaseTimingInfo: scenario.purchaseTimingInfo,
        economicScenarioInfo: scenario.economicScenarioApplied,
        projectionSummary: {
          // Extract from future scenario if available
          propertyValueChange: (scenario as any).projectionSummary
            ?.propertyValueChange,
          rentalIncomeChange: (scenario as any).projectionSummary
            ?.rentalIncomeChange,
          interestRateChange: (scenario as any).projectionSummary
            ?.interestRateChange,
          projectionWarnings: (scenario as any).projectionSummary
            ?.projectionWarnings,
        },
        strengths,
        weaknesses,
      };
    });
  }, [scenarios]);

  // ===== RANKING =====
  const sortedProperties = useMemo(() => {
    const sorted = [...enhancedProperties].sort((a, b) => {
      const sortKey =
        sortBy === "overall"
          ? "overall"
          : sortBy === "roi"
          ? "roi"
          : sortBy === "cashFlow"
          ? "cashFlow"
          : "risk";
      return b.scores[sortKey] - a.scores[sortKey];
    });

    // Assign ranks
    return sorted.map((property, index) => ({
      ...property,
      rank: index + 1,
    }));
  }, [enhancedProperties, sortBy]);

  // ===== BUY NOW VS FUTURE ANALYSIS =====
  const buyNowVsFutureAnalysis = useMemo(() => {
    if (comparisonMode !== "buy_now_vs_future") return null;

    const buyNowScenarios = sortedProperties.filter(
      (p) => p.scenarioType === "buy_now"
    );
    const buyFutureScenarios = sortedProperties.filter(
      (p) => p.scenarioType === "buy_future"
    );

    if (buyNowScenarios.length === 0 && buyFutureScenarios.length === 0)
      return null;

    const bestBuyNow = buyNowScenarios[0];
    const bestBuyFuture = buyFutureScenarios[0];

    let recommendation = "";
    let recommendedStrategy: "buy_now" | "buy_future" | "mixed" = "mixed";

    if (bestBuyNow && bestBuyFuture) {
      if (bestBuyNow.scores.overall > bestBuyFuture.scores.overall) {
        recommendation = `Mua ngay có lợi hơn với điểm số ${bestBuyNow.scores.overall.toFixed(
          0
        )} so với ${bestBuyFuture.scores.overall.toFixed(0)}`;
        recommendedStrategy = "buy_now";
      } else {
        recommendation = `Mua tương lai có lợi hơn với điểm số ${bestBuyFuture.scores.overall.toFixed(
          0
        )} so với ${bestBuyNow.scores.overall.toFixed(0)}`;
        recommendedStrategy = "buy_future";
      }
    } else if (bestBuyNow && !bestBuyFuture) {
      recommendation =
        "Chỉ có kịch bản mua ngay - cần tạo kịch bản mua tương lai để so sánh";
      recommendedStrategy = "buy_now";
    } else if (!bestBuyNow && bestBuyFuture) {
      recommendation =
        "Chỉ có kịch bản mua tương lai - cần tạo kịch bản mua ngay để so sánh";
      recommendedStrategy = "buy_future";
    }

    return {
      buyNowScenarios,
      buyFutureScenarios,
      bestBuyNow,
      bestBuyFuture,
      recommendation,
      recommendedStrategy,
    };
  }, [sortedProperties, comparisonMode]);

  // ===== HELPER FUNCTIONS =====
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreIcon = (score: number): React.ReactNode => {
    if (score >= 80) return <Crown className="h-4 w-4" />;
    if (score >= 60) return <Star className="h-4 w-4" />;
    if (score >= 40) return <Target className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Crown className="h-3 w-3 mr-1" />
          Tốt nhất
        </Badge>
      );
    if (rank === 2)
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-300">
          <Award className="h-3 w-3 mr-1" />
          Thứ 2
        </Badge>
      );
    if (rank === 3)
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
          <Target className="h-3 w-3 mr-1" />
          Thứ 3
        </Badge>
      );
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const toggleDetails = (index: number) => {
    setShowDetails((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ===== RENDER =====
  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Chưa có dữ liệu so sánh</h3>
          <p className="text-sm text-muted-foreground">
            {comparisonMode === "buy_now_vs_future"
              ? 'Tạo kịch bản "Mua Ngay" và "Mua Tương Lai" để thấy so sánh chi tiết'
              : "Tạo ít nhất 2 kịch bản để thấy so sánh chi tiết"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {comparisonMode === "buy_now_vs_future"
                  ? "So Sánh Mua Ngay vs Mua Tương Lai"
                  : "So Sánh Kịch Bản"}
                <Badge variant="outline">{scenarios.length} kịch bản</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Sắp xếp theo:</Label>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Điểm tổng</SelectItem>
                    <SelectItem value="roi">ROI</SelectItem>
                    <SelectItem value="cashFlow">Dòng tiền</SelectItem>
                    <SelectItem value="risk">Rủi ro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Buy Now vs Future Summary */}
        {comparisonMode === "buy_now_vs_future" && buyNowVsFutureAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tóm Tắt So Sánh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {buyNowVsFutureAnalysis.buyNowScenarios.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Kịch bản Mua Ngay
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {buyNowVsFutureAnalysis.buyFutureScenarios.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Kịch bản Mua Tương Lai
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium">
                    {buyNowVsFutureAnalysis.recommendedStrategy === "buy_now"
                      ? "🚀 Mua Ngay"
                      : buyNowVsFutureAnalysis.recommendedStrategy ===
                        "buy_future"
                      ? "⏰ Mua Tương Lai"
                      : "🤔 Cần phân tích thêm"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Khuyến nghị
                  </div>
                </div>
              </div>

              {buyNowVsFutureAnalysis.recommendation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    💡 {buyNowVsFutureAnalysis.recommendation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Comparison Cards */}
        <div className="space-y-4">
          {sortedProperties.map((property, index) => (
            <Card
              key={property.scenarioIndex}
              className={`transition-all hover:shadow-lg ${
                property.rank === 1
                  ? "ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {property.scenario.scenarioName ||
                          `Kịch bản ${property.scenarioIndex + 1}`}
                      </h3>
                      {getRankBadge(property.rank)}
                      {getScenarioTypeBadge(property.scenarioType)}
                    </div>

                    {/* 🆕 Enhanced Scenario Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {/* Purchase Timing Info */}
                      {property.purchaseTimingInfo && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {property.scenarioType === "buy_future" ? (
                            <>
                              {format(
                                property.purchaseTimingInfo.purchaseDate,
                                "dd/MM/yyyy",
                                { locale: vi }
                              )}
                              <span className="text-blue-600">
                                ({property.purchaseTimingInfo.monthsFromNow}{" "}
                                tháng nữa)
                              </span>
                            </>
                          ) : (
                            "Mua ngay"
                          )}
                        </div>
                      )}

                      {/* Economic Scenario Info */}
                      {property.economicScenarioInfo && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{property.economicScenarioInfo.name}</span>
                        </div>
                      )}
                    </div>

                    {/* 🆕 Projection Summary for Future Scenarios */}
                    {property.scenarioType === "buy_future" &&
                      property.projectionSummary && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <div className="flex flex-wrap gap-3">
                            {property.projectionSummary.propertyValueChange !==
                              undefined && (
                              <span
                                className={`flex items-center gap-1 ${
                                  property.projectionSummary
                                    .propertyValueChange > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                <Home className="h-3 w-3" />
                                Giá BĐS:{" "}
                                {property.projectionSummary
                                  .propertyValueChange > 0
                                  ? "+"
                                  : ""}
                                {property.projectionSummary.propertyValueChange.toFixed(
                                  1
                                )}
                                %
                              </span>
                            )}
                            {property.projectionSummary.rentalIncomeChange !==
                              undefined && (
                              <span
                                className={`flex items-center gap-1 ${
                                  property.projectionSummary
                                    .rentalIncomeChange > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                <DollarSign className="h-3 w-3" />
                                Tiền thuê:{" "}
                                {property.projectionSummary.rentalIncomeChange >
                                0
                                  ? "+"
                                  : ""}
                                {property.projectionSummary.rentalIncomeChange.toFixed(
                                  1
                                )}
                                %
                              </span>
                            )}
                            {property.projectionSummary.interestRateChange !==
                              undefined && (
                              <span
                                className={`flex items-center gap-1 ${
                                  property.projectionSummary
                                    .interestRateChange > 0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                <Percent className="h-3 w-3" />
                                Lãi suất:{" "}
                                {property.projectionSummary.interestRateChange >
                                0
                                  ? "+"
                                  : ""}
                                {property.projectionSummary.interestRateChange.toFixed(
                                  1
                                )}
                                % points
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Score Card */}
                  <div
                    className={`p-3 rounded-lg ${getScoreColor(
                      property.scores.overall
                    )}`}
                  >
                    <div className="flex items-center gap-2">
                      {getScoreIcon(property.scores.overall)}
                      <span className="font-bold text-lg">
                        {property.scores.overall.toFixed(0)}
                      </span>
                      <span className="text-sm font-medium">/100</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {ENHANCED_COMPARISON_METRICS.slice(0, 4).map((metric) => {
                    const value = metric.getValue(property.scenario);
                    return (
                      <Tooltip key={metric.key}>
                        <TooltipTrigger asChild>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="font-semibold text-sm">
                              {metric.format(value)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {metric.name}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{metric.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>

                {/* Score Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>ROI Score</span>
                    <span className="font-medium">
                      {property.scores.roi.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={property.scores.roi} className="h-1" />

                  <div className="flex items-center justify-between text-sm">
                    <span>Cash Flow Score</span>
                    <span className="font-medium">
                      {property.scores.cashFlow.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={property.scores.cashFlow} className="h-1" />

                  <div className="flex items-center justify-between text-sm">
                    <span>Risk Score</span>
                    <span className="font-medium">
                      {property.scores.risk.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={property.scores.risk} className="h-1" />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDetails(property.scenarioIndex)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {showDetails[property.scenarioIndex]
                      ? "Ẩn chi tiết"
                      : "Xem chi tiết"}
                  </Button>
                  <div className="flex items-center gap-2">
                    {onSelectScenario && (
                      <Button
                        size="sm"
                        onClick={() => onSelectScenario(property.scenario)}
                        disabled={property.rank === 1}
                      >
                        {property.rank === 1 ? "Đã chọn" : "Chọn kịch bản này"}
                      </Button>
                    )}
                    {onRemoveScenario && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveScenario(property.scenarioIndex)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Detailed Analysis (Collapsible) */}
                {showDetails[property.scenarioIndex] && (
                  <div className="mt-4 p-4 border rounded-lg bg-white">
                    <h4 className="font-medium mb-3">
                      Phân tích chi tiết SWOT
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">
                          ✅ Ưu điểm
                        </h5>
                        <div className="space-y-2">
                          {property.strengths.length > 0 ? (
                            property.strengths.map((item, i) => (
                              <div key={i} className="p-3 bg-green-50 rounded">
                                <div className="flex items-center gap-2 mb-1">
                                  {item.icon}
                                  <span className="font-medium">
                                    {item.title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.impact}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                                <p className="text-sm font-medium">
                                  {item.value}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Chưa có ưu điểm nổi bật được phát hiện
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-600 mb-2">
                          ❌ Nhược điểm
                        </h5>
                        <div className="space-y-2">
                          {property.weaknesses.length > 0 ? (
                            property.weaknesses.map((item, i) => (
                              <div key={i} className="p-3 bg-red-50 rounded">
                                <div className="flex items-center gap-2 mb-1">
                                  {item.icon}
                                  <span className="font-medium">
                                    {item.title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.impact}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                                <p className="text-sm font-medium">
                                  {item.value}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Không phát hiện nhược điểm đáng kể
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary & Recommendation */}
        {showRecommendation && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-medium mb-2">🎯 Kết luận</h3>
                {sortedProperties.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Kịch bản{" "}
                      <strong>
                        {sortedProperties[0]?.scenario.scenarioName ||
                          "Tốt nhất"}
                      </strong>{" "}
                      có điểm số cao nhất (
                      {sortedProperties[0]?.scores.overall.toFixed(0)}/100) với{" "}
                      {sortedProperties[0]?.strengths.length} ưu điểm nổi bật.
                    </p>

                    {/* Enhanced recommendation for buy now vs future */}
                    {comparisonMode === "buy_now_vs_future" &&
                      buyNowVsFutureAnalysis && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">
                            🔮 Khuyến nghị đầu tư
                          </h4>
                          <p className="text-sm text-blue-700">
                            {buyNowVsFutureAnalysis.recommendation}
                          </p>

                          {buyNowVsFutureAnalysis.bestBuyNow &&
                            buyNowVsFutureAnalysis.bestBuyFuture && (
                              <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                                <div>
                                  <div className="font-medium">
                                    Mua Ngay (Tốt nhất):
                                  </div>
                                  <div>
                                    ROI:{" "}
                                    {formatPercent(
                                      buyNowVsFutureAnalysis.bestBuyNow.scenario
                                        .roiHangNam || 0
                                    )}
                                  </div>
                                  <div>
                                    Dòng tiền:{" "}
                                    {formatVND(
                                      buyNowVsFutureAnalysis.bestBuyNow.scenario
                                        .steps.dongTienRongBDS || 0
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium">
                                    Mua Tương Lai (Tốt nhất):
                                  </div>
                                  <div>
                                    ROI:{" "}
                                    {formatPercent(
                                      buyNowVsFutureAnalysis.bestBuyFuture
                                        .scenario.roiHangNam || 0
                                    )}
                                  </div>
                                  <div>
                                    Dòng tiền:{" "}
                                    {formatVND(
                                      buyNowVsFutureAnalysis.bestBuyFuture
                                        .scenario.steps.dongTienRongBDS || 0
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    Chưa có kịch bản nào để so sánh.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
