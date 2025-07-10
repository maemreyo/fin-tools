// Sale scenario calculation utilities

import { 
  RealEstateInputs, 
  CalculationResult,
  CalculationSteps,
} from "@/types/real-estate";
import {
  HoldingPeriodInputs,
  SaleAnalysisResult,
  YearlyBreakdown,
  SaleScenarioComparison,
  SALE_ANALYSIS_DEFAULTS,
} from "@/types/sale-scenario";
import { 
  calculateRemainingBalance,
  calculateDetailedPayments,
  calculateCashOnCashReturn,
} from "./financial-utils";
import { calculateRealEstateInvestment } from "./real-estate-calculator";

/**
 * Project property value based on appreciation rate and holding period
 */
export function projectPropertyValue(
  currentValue: number,
  annualAppreciationRate: number,
  holdingPeriodMonths: number
): number {
  const holdingPeriodYears = holdingPeriodMonths / 12;
  const projectedValue = currentValue * Math.pow(1 + (annualAppreciationRate / 100), holdingPeriodYears);
  
  return Math.round(projectedValue);
}

/**
 * Calculate remaining loan balance at a specific point in time
 * Takes into account preferential and floating rate periods
 */
export function calculateRemainingLoanBalanceAtTime(
  inputs: RealEstateInputs,
  elapsedMonths: number
): number {
  const soTienVay = (inputs.giaTriBDS || 0) * ((inputs.tyLeVay || 0) / 100);
  const thoiGianVayMonths = (inputs.thoiGianVay || 20) * 12;
  const thoiGianUuDai = inputs.thoiGianUuDai || 12;
  
  if (soTienVay <= 0 || elapsedMonths >= thoiGianVayMonths) {
    return 0;
  }
  
  // Handle preferential and floating rate periods separately
  let remainingBalance = soTienVay;
  
  if (elapsedMonths <= thoiGianUuDai) {
    // Still in preferential period
    remainingBalance = calculateRemainingBalance(
      soTienVay,
      inputs.laiSuatUuDai || 8,
      thoiGianVayMonths,
      elapsedMonths
    );
  } else {
    // Past preferential period - need to calculate in two stages
    
    // Stage 1: Calculate balance at end of preferential period
    const balanceAfterPreferential = calculateRemainingBalance(
      soTienVay,
      inputs.laiSuatUuDai || 8,
      thoiGianVayMonths,
      thoiGianUuDai
    );
    
    // Stage 2: Calculate remaining balance at target time using floating rate
    const monthsInFloatingPeriod = elapsedMonths - thoiGianUuDai;
    const remainingTermMonths = thoiGianVayMonths - thoiGianUuDai;
    
    remainingBalance = calculateRemainingBalance(
      balanceAfterPreferential,
      inputs.laiSuatThaNoi || 12,
      remainingTermMonths,
      monthsInFloatingPeriod
    );
  }
  
  return Math.max(0, Math.round(remainingBalance));
}

/**
 * Calculate accumulated cash flows over a holding period
 */
export function calculateAccumulatedCashFlows(
  inputs: RealEstateInputs,
  holdingPeriodMonths: number,
  propertyAppreciationRate: number // Add this parameter
): {
  totalCashFlow: number;
  yearlyBreakdown: YearlyBreakdown[];
} {
  const result = calculateRealEstateInvestment(inputs);
  const monthlyNetCashFlow = result.steps.dongTienRongBDS || 0;
  
  let totalCashFlow = 0;
  const yearlyBreakdown: YearlyBreakdown[] = [];
  
  const holdingPeriodYears = Math.ceil(holdingPeriodMonths / 12);
  
  for (let year = 1; year <= holdingPeriodYears; year++) {
    const monthsInThisYear = Math.min(12, holdingPeriodMonths - (year - 1) * 12);
    const annualCashFlow = monthlyNetCashFlow * monthsInThisYear;
    totalCashFlow += annualCashFlow;
    
    // Calculate property value and remaining loan balance at end of year
    const monthsElapsed = Math.min(year * 12, holdingPeriodMonths);
    const propertyValue = projectPropertyValue(
      inputs.giaTriBDS || 0,
      propertyAppreciationRate, // Use the new parameter
      monthsElapsed
    );
    
    const remainingLoanBalance = calculateRemainingLoanBalanceAtTime(
      inputs,
      monthsElapsed
    );
    
    const accumulatedEquity = propertyValue - remainingLoanBalance;
    
    // Calculate ROI if sold at this point
    const grossSaleProceeds = propertyValue;
    const sellingCosts = grossSaleProceeds * ((inputs.chiPhiBan || 3) / 100);
    const netSaleProceeds = grossSaleProceeds - sellingCosts - remainingLoanBalance;
    const totalReturn = netSaleProceeds + totalCashFlow;
    const initialInvestment = result.steps.tongVonBanDau || 1;
    const roiIfSoldNow = ((totalReturn - initialInvestment) / initialInvestment) * 100;
    
    yearlyBreakdown.push({
      year,
      propertyValue,
      remainingLoanBalance,
      annualCashFlow,
      cumulativeCashFlow: totalCashFlow,
      accumulatedEquity,
      roiIfSoldNow,
    });
  }
  
  return {
    totalCashFlow: Math.round(totalCashFlow),
    yearlyBreakdown,
  };
}

/**
 * Main function to calculate complete sale analysis
 */
export function calculateSaleAnalysis(
  inputs: RealEstateInputs,
  holdingPeriodConfig: HoldingPeriodInputs
): SaleAnalysisResult {
  const baseResult = calculateRealEstateInvestment(inputs);
  const holdingPeriodMonths = holdingPeriodConfig.holdingPeriodMonths;
  
  // Project property value at sale time
  const projectedPropertyValue = projectPropertyValue(
    inputs.giaTriBDS || 0,
    holdingPeriodConfig.propertyAppreciationRate,
    holdingPeriodMonths
  );
  
  // Calculate remaining loan balance at sale time
  const remainingLoanBalance = calculateRemainingLoanBalanceAtTime(
    inputs,
    holdingPeriodMonths
  );
  
  // Calculate sale proceeds
  const grossSaleProceeds = projectedPropertyValue;
  const sellingCostPercentage = holdingPeriodConfig.sellingCostPercentage || inputs.chiPhiBan || 3;
  const totalSellingCosts = grossSaleProceeds * (sellingCostPercentage / 100);
  const netSaleProceeds = grossSaleProceeds - totalSellingCosts - remainingLoanBalance;
  
  // Calculate accumulated cash flows
  const { totalCashFlow, yearlyBreakdown } = calculateAccumulatedCashFlows(
    inputs,
    holdingPeriodMonths,
    holdingPeriodConfig.propertyAppreciationRate
  );
  
  // Calculate total returns and ROI
  const initialInvestment = baseResult.steps.tongVonBanDau || 1;
  const totalReturn = netSaleProceeds + totalCashFlow;
  const totalROIOnSale = ((totalReturn - initialInvestment) / initialInvestment) * 100;
  
  // Calculate annualized ROI
  const holdingPeriodYears = holdingPeriodMonths / 12;
  const annualizedROI = holdingPeriodYears > 0 ? 
    (Math.pow(totalReturn / initialInvestment, 1 / holdingPeriodYears) - 1) * 100 : 0;
  
  // Determine optimal sale timing (simplified - could be enhanced)
  const optimalSaleTiming = determineOptimalSaleTiming(yearlyBreakdown);
  
  return {
    holdingPeriodInputs: holdingPeriodConfig,
    baseScenario: baseResult,
    projectedPropertyValue,
    remainingLoanBalance,
    grossSaleProceeds,
    totalSellingCosts,
    netSaleProceeds,
    totalCashFlowReceived: totalCashFlow,
    totalReturn,
    totalROIOnSale,
    annualizedROI,
    breakdownByYear: yearlyBreakdown,
    optimalSaleTiming,
    metadata: {
      calculatedAt: new Date().toISOString(),
      scenarioId: `sale_${Date.now()}`,
      notes: `Analysis for ${holdingPeriodMonths} months holding period`,
    },
  };
}

/**
 * Determine optimal sale timing based on ROI analysis
 */
function determineOptimalSaleTiming(yearlyBreakdown: YearlyBreakdown[]): {
  bestYear: number;
  bestROI: number;
  reasoning: string;
} {
  if (yearlyBreakdown.length === 0) {
    return { bestYear: 1, bestROI: 0, reasoning: "No data available" };
  }
  
  // Find year with highest ROI
  const bestEntry = yearlyBreakdown.reduce((best, current) => 
    current.roiIfSoldNow > best.roiIfSoldNow ? current : best
  );
  
  // Simple reasoning based on ROI trend
  let reasoning = `Year ${bestEntry.year} offers the best ROI of ${bestEntry.roiIfSoldNow.toFixed(1)}%.`;
  
  if (bestEntry.year === yearlyBreakdown.length) {
    reasoning += " Consider holding longer if market conditions remain favorable.";
  } else if (bestEntry.year <= 3) {
    reasoning += " Early sale may be optimal due to front-loaded returns.";
  } else {
    reasoning += " Mid-term sale balances capital appreciation with cash flow benefits.";
  }
  
  return {
    bestYear: bestEntry.year,
    bestROI: bestEntry.roiIfSoldNow,
    reasoning,
  };
}

/**
 * Compare multiple sale scenarios with different holding periods
 */
export function compareSaleScenarios(
  inputs: RealEstateInputs,
  holdingPeriods: number[], // Array of months
  baseConfig: Partial<HoldingPeriodInputs> = {}
): SaleScenarioComparison {
  const scenarios = holdingPeriods.map(months => {
    const config: HoldingPeriodInputs = {
      ...SALE_ANALYSIS_DEFAULTS,
      ...baseConfig,
      holdingPeriodMonths: months,
      enableSaleAnalysis: true,
    } as HoldingPeriodInputs;
    
    const result = calculateSaleAnalysis(inputs, config);
    
    return {
      holdingPeriod: months,
      result,
    };
  });
  
  // Find best scenarios by different criteria
  const maxReturnScenario = scenarios.reduce((best, current) => 
    current.result.totalReturn > best.result.totalReturn ? current : best
  );
  
  const maxROIScenario = scenarios.reduce((best, current) => 
    current.result.totalROIOnSale > best.result.totalROIOnSale ? current : best
  );
  
  // Balanced score: weighted average of ROI and risk-adjusted returns
  const balancedScenario = scenarios.reduce((best, current) => {
    const currentScore = current.result.totalROIOnSale * 0.7 + 
                        (current.result.annualizedROI * 0.3);
    const bestScore = best.result.totalROIOnSale * 0.7 + 
                     (best.result.annualizedROI * 0.3);
    return currentScore > bestScore ? current : best;
  });
  
  return {
    scenarios,
    recommendations: {
      maxReturn: {
        holdingPeriod: maxReturnScenario.holdingPeriod,
        totalReturn: maxReturnScenario.result.totalReturn,
      },
      maxROI: {
        holdingPeriod: maxROIScenario.holdingPeriod,
        roi: maxROIScenario.result.totalROIOnSale,
      },
      balanced: {
        holdingPeriod: balancedScenario.holdingPeriod,
        score: balancedScenario.result.totalROIOnSale * 0.7 + 
               (balancedScenario.result.annualizedROI * 0.3),
      },
    },
  };
}

/**
 * Validate sale analysis configuration
 */
export function validateSaleAnalysisConfig(config: HoldingPeriodInputs): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate holding period
  if (config.holdingPeriodMonths < 12) {
    errors.push("Thời gian nắm giữ tối thiểu là 12 tháng");
  }
  if (config.holdingPeriodMonths > 360) {
    errors.push("Thời gian nắm giữ tối đa là 30 năm (360 tháng)");
  }
  
  // Validate appreciation rate
  if (config.propertyAppreciationRate < -10) {
    errors.push("Tỷ lệ tăng giá BĐS không thể dưới -10%/năm");
  }
  if (config.propertyAppreciationRate > 30) {
    warnings.push("Tỷ lệ tăng giá BĐS trên 30%/năm có thể không thực tế");
  }
  
  // Validate selling costs
  if (config.sellingCostPercentage && config.sellingCostPercentage < 0.5) {
    warnings.push("Chi phí bán dưới 0.5% có thể không thực tế");
  }
  if (config.sellingCostPercentage && config.sellingCostPercentage > 15) {
    warnings.push("Chi phí bán trên 15% có thể quá cao");
  }
  
  // Warning for short holding periods
  if (config.holdingPeriodMonths < 24) {
    warnings.push("Nắm giữ dưới 2 năm có thể không tối ưu về thuế và chi phí giao dịch");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}