// CREATED: 2025-07-10 - Utility functions for scenario comparison and analysis

import { CalculationResultWithSale } from "@/types/sale-scenario";
import { formatVND, formatPercent } from "./financial-utils";

// ===== INTERFACES =====
export interface ComparisonMetric {
  key: string;
  displayName: string;
  category: "performance" | "risk" | "timing" | "financial";
  getValue: (scenario: CalculationResultWithSale) => number;
  format: (value: number) => string;
  higherIsBetter: boolean;
  weight: number; // For overall scoring (0-100)
  description: string;
}

export interface ScenarioScore {
  scenario: CalculationResultWithSale;
  index: number;
  scores: {
    overall: number;
    performance: number;
    risk: number;
    timing: number;
    financial: number;
  };
  rank: number;
  strengths: string[];
  weaknesses: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface ComparisonInsight {
  type: "advantage" | "disadvantage" | "neutral" | "warning";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  scenarios: string[]; // scenario names
  recommendation?: string;
}

// ===== COMPARISON METRICS =====
export const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: "roiHangNam",
    displayName: "ROI Hàng Năm",
    category: "performance",
    getValue: (s) => s.roiHangNam || 0,
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    weight: 25,
    description: "Tỷ suất lợi nhuận hàng năm",
  },
  {
    key: "cashFlow",
    displayName: "Dòng Tiền Ròng",
    category: "financial",
    getValue: (s) => s.steps?.dongTienRongBDS || 0,
    format: (v) => formatVND(v),
    higherIsBetter: true,
    weight: 20,
    description: "Dòng tiền nhận được hàng tháng",
  },
  {
    key: "initialCapital",
    displayName: "Vốn Ban Đầu",
    category: "financial",
    getValue: (s) => s.steps?.tongVonBanDau || 0,
    format: (v) => formatVND(v),
    higherIsBetter: false,
    weight: 15,
    description: "Số vốn cần chuẩn bị ban đầu",
  },
  {
    key: "paybackPeriod",
    displayName: "Thời Gian Hoàn Vốn",
    category: "timing",
    getValue: (s) => s.paybackPeriod || 999,
    format: (v) => v < 999 ? `${v.toFixed(1)} năm` : "N/A",
    higherIsBetter: false,
    weight: 10,
    description: "Thời gian để thu hồi vốn đầu tư",
  },
  {
    key: "rentalYield",
    displayName: "Rental Yield",
    category: "performance",
    getValue: (s) => s.rentalYield || 0,
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    weight: 10,
    description: "Tỷ lệ lợi nhuận từ cho thuê",
  },
  {
    key: "loanToValue",
    displayName: "Tỷ Lệ Vay",
    category: "risk",
    getValue: (s) => s.inputs?.tyLeVay || 0,
    format: (v) => formatPercent(v),
    higherIsBetter: false,
    weight: 10,
    description: "Tỷ lệ vay so với giá trị BĐS",
  },
  {
    key: "totalROIOnSale",
    displayName: "ROI Khi Bán",
    category: "performance",
    getValue: (s) => s.saleAnalysis?.totalROIOnSale || s.roiHangNam || 0,
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    weight: 10,
    description: "Tổng ROI bao gồm cả khi bán",
  },
];

// ===== UTILITY FUNCTIONS =====

export function getScenarioType(
  scenario: CalculationResultWithSale
): "buy_now" | "buy_future" | "standard" {
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
}

export function calculateScenarioScore(
  scenario: CalculationResultWithSale,
  index: number,
  allScenarios: CalculationResultWithSale[]
): ScenarioScore {
  const scores = {
    overall: 0,
    performance: 0,
    risk: 0,
    timing: 0,
    financial: 0,
  };

  // Calculate category scores
  const categoryScores: Record<string, number[]> = {
    performance: [],
    risk: [],
    timing: [],
    financial: [],
  };

  COMPARISON_METRICS.forEach((metric) => {
    const value = metric.getValue(scenario);
    const allValues = allScenarios.map(s => metric.getValue(s));
    
    // Normalize score (0-100)
    let normalizedScore = 0;
    if (allValues.length > 1) {
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      if (max !== min) {
        normalizedScore = ((value - min) / (max - min)) * 100;
        if (!metric.higherIsBetter) {
          normalizedScore = 100 - normalizedScore;
        }
      } else {
        normalizedScore = 50; // All equal
      }
    } else {
      // Single scenario - use absolute thresholds
      normalizedScore = getAbsoluteScore(metric.key, value);
    }

    categoryScores[metric.category].push(normalizedScore * (metric.weight / 100));
  });

  // Calculate category averages
  Object.keys(categoryScores).forEach((category) => {
    const categoryValues = categoryScores[category];
    if (categoryValues.length > 0) {
      scores[category as keyof typeof scores] =
        categoryValues.reduce((sum, score) => sum + score, 0) / categoryValues.length;
    }
  });

  // Calculate overall score (weighted average)
  scores.overall = (
    scores.performance * 0.35 +
    scores.financial * 0.25 +
    scores.risk * 0.25 +
    scores.timing * 0.15
  );

  // Identify strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (scores.performance > 70) strengths.push("Hiệu suất đầu tư tốt");
  if (scores.financial > 70) strengths.push("Tài chính vững mạnh");
  if (scores.risk > 70) strengths.push("Rủi ro thấp");
  if (scores.timing > 70) strengths.push("Thời gian hợp lý");

  if (scores.performance < 40) weaknesses.push("Hiệu suất thấp");
  if (scores.financial < 40) weaknesses.push("Tài chính yếu");
  if (scores.risk < 40) weaknesses.push("Rủi ro cao");
  if (scores.timing < 40) weaknesses.push("Thời gian không tối ưu");

  // Check specific metrics for detailed insights
  const roi = scenario.roiHangNam || 0;
  const cashFlow = scenario.steps?.dongTienRongBDS || 0;
  const ltv = scenario.inputs?.tyLeVay || 0;

  if (roi > 15) strengths.push(`ROI cao (${formatPercent(roi)})`);
  if (cashFlow > 2000000) strengths.push(`Dòng tiền tốt (${formatVND(cashFlow)}/tháng)`);
  if (ltv < 70) strengths.push(`Tỷ lệ vay an toàn (${formatPercent(ltv)})`);

  if (roi < 8) weaknesses.push(`ROI thấp (${formatPercent(roi)})`);
  if (cashFlow < 0) weaknesses.push(`Dòng tiền âm (${formatVND(cashFlow)}/tháng)`);
  if (ltv > 85) weaknesses.push(`Tỷ lệ vay cao (${formatPercent(ltv)})`);

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" = "medium";
  if (scores.risk > 70) riskLevel = "low";
  else if (scores.risk < 40) riskLevel = "high";

  return {
    scenario,
    index,
    scores,
    rank: 0, // Will be set after sorting
    strengths,
    weaknesses,
    riskLevel,
  };
}

function getAbsoluteScore(metricKey: string, value: number): number {
  // Absolute scoring thresholds for single scenarios
  const thresholds: Record<string, { good: number; excellent: number; higherIsBetter: boolean }> = {
    roiHangNam: { good: 10, excellent: 15, higherIsBetter: true },
    cashFlow: { good: 1000000, excellent: 3000000, higherIsBetter: true },
    rentalYield: { good: 5, excellent: 7, higherIsBetter: true },
    paybackPeriod: { good: 10, excellent: 7, higherIsBetter: false },
    loanToValue: { good: 80, excellent: 70, higherIsBetter: false },
  };

  const threshold = thresholds[metricKey];
  if (!threshold) return 50; // Default neutral score

  if (threshold.higherIsBetter) {
    if (value >= threshold.excellent) return 90;
    if (value >= threshold.good) return 70;
    return Math.max(10, (value / threshold.good) * 70);
  } else {
    if (value <= threshold.excellent) return 90;
    if (value <= threshold.good) return 70;
    return Math.max(10, 70 - ((value - threshold.good) / threshold.good) * 60);
  }
}

export function rankScenarios(scenarios: CalculationResultWithSale[]): ScenarioScore[] {
  const scores = scenarios.map((scenario, index) =>
    calculateScenarioScore(scenario, index, scenarios)
  );

  // Sort by overall score and assign ranks
  const sortedScores = scores.sort((a, b) => b.scores.overall - a.scores.overall);
  sortedScores.forEach((score, index) => {
    score.rank = index + 1;
  });

  return sortedScores;
}

export function generateComparisonInsights(
  scenarios: CalculationResultWithSale[]
): ComparisonInsight[] {
  const insights: ComparisonInsight[] = [];
  const scores = rankScenarios(scenarios);

  if (scenarios.length < 2) return insights;

  // Find best and worst scenarios
  const best = scores[0];
  const worst = scores[scores.length - 1];

  // ROI Comparison
  const roiValues = scenarios.map(s => s.roiHangNam || 0);
  const maxROI = Math.max(...roiValues);
  const minROI = Math.min(...roiValues);
  const roiDiff = maxROI - minROI;

  if (roiDiff > 5) {
    insights.push({
      type: "advantage",
      title: "Chênh lệch ROI đáng kể",
      description: `Kịch bản tốt nhất có ROI cao hơn ${formatPercent(roiDiff)} so với kịch bản thấp nhất.`,
      impact: "high",
      scenarios: [best.scenario.scenarioName || "Tốt nhất", worst.scenario.scenarioName || "Thấp nhất"],
      recommendation: "Ưu tiên kịch bản có ROI cao hơn nếu mức rủi ro chấp nhận được.",
    });
  }

  // Cash Flow Analysis
  const cashFlows = scenarios.map(s => s.steps?.dongTienRongBDS || 0);
  const hasNegativeCashFlow = cashFlows.some(cf => cf < 0);
  const hasPositiveCashFlow = cashFlows.some(cf => cf > 0);

  if (hasNegativeCashFlow && hasPositiveCashFlow) {
    insights.push({
      type: "warning",
      title: "Dòng tiền trái chiều",
      description: "Một số kịch bản có dòng tiền âm, một số có dòng tiền dương.",
      impact: "high",
      scenarios: scenarios
        .filter(s => (s.steps?.dongTienRongBDS || 0) < 0)
        .map(s => s.scenarioName || "Không tên"),
      recommendation: "Tránh các kịch bản dòng tiền âm trừ khi có kế hoạch bù đắp rõ ràng.",
    });
  }

  // Buy Now vs Future Analysis
  const buyNowScenarios = scenarios.filter(s => getScenarioType(s) === "buy_now");
  const futureScenarios = scenarios.filter(s => getScenarioType(s) === "buy_future");

  if (buyNowScenarios.length > 0 && futureScenarios.length > 0) {
    const avgROIBuyNow = buyNowScenarios.reduce((sum, s) => sum + (s.roiHangNam || 0), 0) / buyNowScenarios.length;
    const avgROIFuture = futureScenarios.reduce((sum, s) => sum + (s.roiHangNam || 0), 0) / futureScenarios.length;
    
    const diff = avgROIFuture - avgROIBuyNow;
    
    if (Math.abs(diff) > 2) {
      insights.push({
        type: diff > 0 ? "advantage" : "disadvantage",
        title: diff > 0 ? "Tương lai có lợi thế" : "Mua ngay có lợi thế",
        description: `Chiến lược ${diff > 0 ? "mua tương lai" : "mua ngay"} có ROI trung bình cao hơn ${formatPercent(Math.abs(diff))}.`,
        impact: "high",
        scenarios: diff > 0 ? ["Mua tương lai"] : ["Mua ngay"],
        recommendation: diff > 0 
          ? "Xem xét đợi thời điểm tốt hơn nếu có thể kiểm soát được rủi ro thị trường."
          : "Hành động ngay để tận dụng cơ hội hiện tại.",
      });
    }
  }

  // Risk Level Warning
  const highRiskScenarios = scores.filter(s => s.riskLevel === "high");
  if (highRiskScenarios.length > 0) {
    insights.push({
      type: "warning",
      title: "Cảnh báo rủi ro cao",
      description: `${highRiskScenarios.length} kịch bản có mức rủi ro cao.`,
      impact: "medium",
      scenarios: highRiskScenarios.map(s => s.scenario.scenarioName || "Không tên"),
      recommendation: "Xem xét giảm tỷ lệ vay hoặc tăng vốn tự có để giảm rủi ro.",
    });
  }

  return insights;
}

export function getBestScenarioByCategory(
  scenarios: CalculationResultWithSale[]
): Record<string, { scenario: CalculationResultWithSale; value: number; formatted: string }> {
  const results: Record<string, { scenario: CalculationResultWithSale; value: number; formatted: string }> = {};

  COMPARISON_METRICS.forEach((metric) => {
    const values = scenarios.map(s => ({ scenario: s, value: metric.getValue(s) }));
    
    const best = metric.higherIsBetter
      ? values.reduce((prev, current) => (current.value > prev.value) ? current : prev)
      : values.reduce((prev, current) => (current.value < prev.value) ? current : prev);

    results[metric.key] = {
      scenario: best.scenario,
      value: best.value,
      formatted: metric.format(best.value),
    };
  });

  return results;
}

export function calculateComparisonMatrix(
  scenarios: CalculationResultWithSale[]
): Record<string, number[]> {
  const matrix: Record<string, number[]> = {};

  COMPARISON_METRICS.forEach((metric) => {
    matrix[metric.key] = scenarios.map(s => metric.getValue(s));
  });

  return matrix;
}