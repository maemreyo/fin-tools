// Công cụ tính toán nâng cao tích hợp phân tích kịch bản bán

import { 
  RealEstateInputs, 
  CalculationSteps, 
  CalculationResult,
} from '@/types/real-estate';
import {
  HoldingPeriodInputs,
  SaleAnalysisResult,
  RealEstateInputsWithSaleAnalysis,
  CalculationResultWithSale,
  YearlyBreakdown,
} from '@/types/sale-scenario';
import { 
  calculateSaleAnalysis,
  calculateAccumulatedCashFlows,
  validateSaleAnalysisConfig,
} from './sale-scenario-utils';
import { calculateRealEstateInvestment } from './real-estate-calculator';

/**
 * Công cụ tính toán đầu tư bất động sản nâng cao với hỗ trợ phân tích kịch bản bán
 */
export function calculateRealEstateInvestmentWithSale(
  inputs: RealEstateInputsWithSaleAnalysis
): CalculationResultWithSale {
  
  // Đầu tiên, tính toán kịch bản cơ bản bằng cách sử dụng công cụ tính toán hiện có
  const baseInputs: RealEstateInputs = {
    ...inputs,
    // Loại bỏ phân tích bán khỏi đầu vào cơ bản để tránh xung đột
    saleAnalysis: undefined,
  } as RealEstateInputs;
  
  const baseResult = calculateRealEstateInvestment(baseInputs);
  
  // Nếu phân tích bán không được bật, trả về kết quả cơ bản
  if (!inputs.saleAnalysis || !inputs.saleAnalysis.enableSaleAnalysis) {
    return {
      ...baseResult,
      saleAnalysis: undefined,
    };
  }
  
  // Xác thực cấu hình phân tích bán
  const validation = validateSaleAnalysisConfig(inputs.saleAnalysis);
  if (!validation.isValid) {
    console.warn('Sale analysis validation failed:', validation.errors);
    return {
      ...baseResult,
      saleAnalysis: undefined,
      warnings: [...baseResult.warnings, ...validation.errors],
    };
  }
  
  // Thêm cảnh báo xác thực vào kết quả
  const enhancedWarnings = [
    ...baseResult.warnings,
    ...validation.warnings,
  ];
  
  // Tính toán phân tích bán
  let saleAnalysis: SaleAnalysisResult;
  try {
    saleAnalysis = calculateSaleAnalysis(baseInputs, inputs.saleAnalysis);
  } catch (error) {
    console.error('Sale analysis calculation failed:', error);
    return {
      ...baseResult,
      saleAnalysis: undefined,
      warnings: [...enhancedWarnings, 'Không thể tính toán kịch bản bán. Vui lòng kiểm tra lại thông số.'],
    };
  }
  
  // Tạo các gợi ý nâng cao bao gồm các khuyến nghị bán
  const enhancedSuggestions = generateEnhancedSuggestions(
    baseResult,
    saleAnalysis,
    inputs.saleAnalysis
  );
  
  return {
    ...baseResult,
    warnings: enhancedWarnings,
    suggestions: enhancedSuggestions,
    saleAnalysis,
  };
}

/**
 * Tính toán phân tích thời gian nắm giữ cho việc lập kế hoạch đầu tư
 */
export function calculateHoldingPeriodAnalysis(
  inputs: RealEstateInputs,
  maxHoldingPeriodYears: number = 20,
  appreciationRate: number = 5 // Add this parameter
): {
  yearlyBreakdown: YearlyBreakdown[];
  optimalSaleYear: number;
  maxROIYear: number;
  breakEvenYear: number;
  summary: {
    totalCashFlowReceived: number;
    averageAnnualReturn: number;
    riskAssessment: 'low' | 'medium' | 'high';
  };
} {
  
  const maxMonths = maxHoldingPeriodYears * 12;
  const { yearlyBreakdown } = calculateAccumulatedCashFlows(inputs, maxMonths, appreciationRate);
  
  // Tìm năm bán tối ưu (ROI cao nhất)
  const optimalYear = yearlyBreakdown.reduce((best, current, index) => 
    current.roiIfSoldNow > yearlyBreakdown[best].roiIfSoldNow ? index : best
  , 0) + 1;
  
  // Tìm năm ROI tối đa
  const maxROIEntry = yearlyBreakdown.reduce((best, current) => 
    current.roiIfSoldNow > best.roiIfSoldNow ? current : best
  );
  
  // Tìm năm hòa vốn (khi dòng tiền tích lũy trở nên dương)
  const breakEvenEntry = yearlyBreakdown.find(entry => entry.cumulativeCashFlow > 0);
  const breakEvenYear = breakEvenEntry ? breakEvenEntry.year : maxHoldingPeriodYears;
  
  // Tính toán các chỉ số tóm tắt
  const lastYear = yearlyBreakdown[yearlyBreakdown.length - 1];
  const totalCashFlowReceived = lastYear?.cumulativeCashFlow || 0;
  const averageAnnualReturn = totalCashFlowReceived / maxHoldingPeriodYears;
  
  // Đánh giá rủi ro dựa trên biến động dòng tiền và thời gian hoàn vốn
  let riskAssessment: 'low' | 'medium' | 'high' = 'medium';
  if (breakEvenYear <= 5 && totalCashFlowReceived > 0) {
    riskAssessment = 'low';
  } else if (breakEvenYear > 10 || totalCashFlowReceived < 0) {
    riskAssessment = 'high';
  }
  
  return {
    yearlyBreakdown,
    optimalSaleYear: optimalYear,
    maxROIYear: maxROIEntry.year,
    breakEvenYear,
    summary: {
      totalCashFlowReceived,
      averageAnnualReturn,
      riskAssessment,
    },
  };
}

/**
 * Tạo các khuyến nghị đầu tư toàn diện
 */
function generateEnhancedSuggestions(
  baseResult: CalculationResult,
  saleAnalysis: SaleAnalysisResult,
  saleConfig: HoldingPeriodInputs
): string[] {
  const suggestions: string[] = [...baseResult.suggestions];
  
  // Sale timing recommendations
  const optimalYear = saleAnalysis.optimalSaleTiming.bestYear;
  const plannedYears = Math.round(saleConfig.holdingPeriodMonths / 12);
  
  if (optimalYear !== plannedYears) {
    if (optimalYear < plannedYears) {
      suggestions.push(
        `💡 Tối ưu: Bán sớm hơn ở năm ${optimalYear} có thể đạt ROI cao hơn (${saleAnalysis.optimalSaleTiming.bestROI.toFixed(1)}%)`
      );
    } else {
      suggestions.push(
        `💡 Tối ưu: Nắm giữ đến năm ${optimalYear} để tối đa hóa lợi nhuận (${saleAnalysis.optimalSaleTiming.bestROI.toFixed(1)}%)`
      );
    }
  }
  
  // ROI comparison
  const annualROI = baseResult.roiHangNam || 0;
  const saleROI = saleAnalysis.totalROIOnSale;
  
  if (saleROI > annualROI * 1.5) {
    suggestions.push(
      `📈 Chiến lược bán có thể tăng ROI từ ${annualROI.toFixed(1)}% lên ${saleROI.toFixed(1)}%`
    );
  } else if (saleROI < annualROI * 0.8) {
    suggestions.push(
      `⚠️ Chiến lược cho thuê dài hạn có thể hiệu quả hơn so với bán (ROI hiện tại: ${annualROI.toFixed(1)}%)`
    );
  }
  
  // Cash flow vs. appreciation analysis
  const totalCashFlow = saleAnalysis.totalCashFlowReceived;
  const appreciationGain = saleAnalysis.netSaleProceeds - (baseResult.steps.tongVonBanDau || 0);
  
  if (appreciationGain > totalCashFlow * 2) {
    suggestions.push(
      `🏡 Lợi nhuận chủ yếu từ tăng giá (${((appreciationGain / saleAnalysis.totalReturn) * 100).toFixed(0)}%). Theo dõi thị trường để bán đúng thời điểm.`
    );
  } else if (totalCashFlow > appreciationGain * 2) {
    suggestions.push(
      `💰 Lợi nhuận chủ yếu từ dòng tiền (${((totalCashFlow / saleAnalysis.totalReturn) * 100).toFixed(0)}%). Chiến lược nắm giữ dài hạn phù hợp.`
    );
  }
  
  // Property appreciation rate analysis
  if (saleConfig.propertyAppreciationRate > 10) {
    suggestions.push(
      `🚀 Tỷ lệ tăng giá cao (${saleConfig.propertyAppreciationRate}%/năm). Xem xét tăng thời gian nắm giữ nếu thị trường duy trì được mức này.`
    );
  } else if (saleConfig.propertyAppreciationRate < 3) {
    suggestions.push(
      `📊 Tăng giá chậm (${saleConfig.propertyAppreciationRate}%/năm). Tập trung vào tối ưu hóa dòng tiền thuê.`
    );
  }
  
  // Risk mitigation
  const holdingYears = saleConfig.holdingPeriodMonths / 12;
  if (holdingYears > 10) {
    suggestions.push(
      `⏰ Nắm giữ dài hạn (${holdingYears.toFixed(1)} năm): Xem xét rủi ro thay đổi thị trường và có kế hoạch exit linh hoạt.`
    );
  }
  
  // Transaction cost optimization
  const sellingCosts = saleAnalysis.totalSellingCosts;
  const propertyValue = saleAnalysis.projectedPropertyValue;
  const costPercentage = (sellingCosts / propertyValue) * 100;
  
  if (costPercentage > 5) {
    suggestions.push(
      `💸 Chi phí bán cao (${costPercentage.toFixed(1)}%). Xem xét nắm giữ lâu hơn để spread chi phí hoặc tìm cách giảm phí môi giới.`
    );
  }
  
  return suggestions;
}

/**
 * Quick sale scenario comparison for multiple strategies
 */
export function quickSaleScenarioComparison(
  inputs: RealEstateInputs,
  appreciationRate: number = 5
): {
  shortTerm: { years: number; roi: number; totalReturn: number };
  mediumTerm: { years: number; roi: number; totalReturn: number };
  longTerm: { years: number; roi: number; totalReturn: number };
  recommendation: string;
} {
  
  const scenarios = [
    { years: 3, months: 36 },
    { years: 7, months: 84 },
    { years: 15, months: 180 },
  ];
  
  const results = scenarios.map(scenario => {
    const config: HoldingPeriodInputs = {
      holdingPeriodMonths: scenario.months,
      propertyAppreciationRate: appreciationRate,
      enableSaleAnalysis: true,
    };
    
    const analysis = calculateSaleAnalysis(inputs, config);
    
    return {
      years: scenario.years,
      roi: analysis.totalROIOnSale,
      totalReturn: analysis.totalReturn,
    };
  });
  
  // Find best strategy
  const bestStrategy = results.reduce((best, current) => 
    current.roi > best.roi ? current : best
  );
  
  let recommendation = `Chiến lược ${bestStrategy.years} năm có ROI cao nhất (${bestStrategy.roi.toFixed(1)}%). `;
  
  // Add context-specific recommendations
  if (bestStrategy.years === 3) {
    recommendation += "Thị trường có thể đang trong giai đoạn tăng trưởng nhanh, phù hợp với chiến lược ngắn hạn.";
  } else if (bestStrategy.years === 15) {
    recommendation += "Dòng tiền ổn định và tăng giá đều đặn, phù hợp với chiến lược dài hạn.";
  } else {
    recommendation += "Cân bằng tốt giữa rủi ro và lợi nhuận.";
  }
  
  return {
    shortTerm: results[0],
    mediumTerm: results[1],
    longTerm: results[2],
    recommendation,
  };
}