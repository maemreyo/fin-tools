// Sale Scenario Analysis types for Real Estate Calculator

import { RealEstateInputs, CalculationResult } from "./real-estate";

/**
 * Holding Period Configuration for Sale Analysis
 */
export interface HoldingPeriodInputs {
  /** Thời gian nắm giữ BĐS (tháng) */
  holdingPeriodMonths: number;
  
  /** Ngày dự kiến bán (optional, for calendar integration) */
  saleDate?: Date;
  
  /** Chi phí bán (% trên giá bán) - override default chiPhiBan */
  sellingCostPercentage?: number;
  
  /** Tỷ lệ tăng giá BĐS hàng năm (%) - for projection */
  propertyAppreciationRate: number;
  
  /** Enable/disable sale analysis */
  enableSaleAnalysis: boolean;
}

/**
 * Yearly breakdown of investment performance
 */
export interface YearlyBreakdown {
  /** Năm thứ mấy (1-based) */
  year: number;
  
  /** Giá trị BĐS ước tính cuối năm */
  propertyValue: number;
  
  /** Số dư nợ còn lại cuối năm */
  remainingLoanBalance: number;
  
  /** Tổng dòng tiền ròng nhận được trong năm */
  annualCashFlow: number;
  
  /** Tổng dòng tiền ròng tích lũy từ đầu */
  cumulativeCashFlow: number;
  
  /** Equity tích lũy (giá trị - nợ) */
  accumulatedEquity: number;
  
  /** ROI tính đến thời điểm này (nếu bán vào cuối năm) */
  roiIfSoldNow: number;
}

/**
 * Complete Sale Analysis Result
 */
export interface SaleAnalysisResult {
  /** Input configuration used for analysis */
  holdingPeriodInputs: HoldingPeriodInputs;
  
  /** Original calculation result (current scenario) */
  baseScenario: CalculationResult;
  
  /** Projected property value at sale time */
  projectedPropertyValue: number;
  
  /** Remaining loan balance at sale time */
  remainingLoanBalance: number;
  
  /** Gross sale proceeds (before costs) */
  grossSaleProceeds: number;
  
  /** Total selling costs */
  totalSellingCosts: number;
  
  /** Net sale proceeds (after all costs) */
  netSaleProceeds: number;
  
  /** Total cash flow received during holding period */
  totalCashFlowReceived: number;
  
  /** Total return from investment (sale + cash flows - initial investment) */
  totalReturn: number;
  
  /** Total ROI when selling at the specified time */
  totalROIOnSale: number;
  
  /** Annualized ROI including sale */
  annualizedROI: number;
  
  /** Year-by-year breakdown */
  breakdownByYear: YearlyBreakdown[];
  
  /** Optimal sale timing analysis */
  optimalSaleTiming: {
    /** Best year to sell for maximum ROI */
    bestYear: number;
    /** ROI at optimal timing */
    bestROI: number;
    /** Reasoning for the recommendation */
    reasoning: string;
  };
  
  /** Sale scenario metadata */
  metadata: {
    calculatedAt: string;
    scenarioId: string;
    notes?: string;
  };
}

/**
 * Extended Real Estate Inputs with Sale Analysis
 */
export interface RealEstateInputsWithSaleAnalysis extends RealEstateInputs {
  /** Sale analysis configuration */
  saleAnalysis?: HoldingPeriodInputs;
}

/**
 * Extended Calculation Result with Sale Analysis
 */
export interface CalculationResultWithSale extends CalculationResult {
  /** Sale analysis results (if enabled) */
  saleAnalysis?: SaleAnalysisResult;
}

/**
 * Sale Scenario Comparison
 */
export interface SaleScenarioComparison {
  /** Different holding periods to compare */
  scenarios: {
    holdingPeriod: number; // months
    result: SaleAnalysisResult;
  }[];
  
  /** Best scenario by different criteria */
  recommendations: {
    /** Best for maximum total return */
    maxReturn: { holdingPeriod: number; totalReturn: number };
    /** Best for highest ROI */
    maxROI: { holdingPeriod: number; roi: number };
    /** Most balanced risk/return */
    balanced: { holdingPeriod: number; score: number };
  };
}

/**
 * Default values for sale analysis
 */
export const SALE_ANALYSIS_DEFAULTS: Partial<HoldingPeriodInputs> = {
  holdingPeriodMonths: 60, // 5 years default
  propertyAppreciationRate: 5, // 5% annual appreciation
  enableSaleAnalysis: false,
  sellingCostPercentage: 3, // Use existing default
};

/**
 * Validation rules for sale analysis
 */
export const SALE_ANALYSIS_VALIDATION = {
  holdingPeriodMonths: {
    min: 12, // Minimum 1 year
    max: 360, // Maximum 30 years
  },
  propertyAppreciationRate: {
    min: -10, // Can be negative (depreciation)
    max: 30, // Maximum 30% annual appreciation
  },
  sellingCostPercentage: {
    min: 0.5, // Minimum transaction costs
    max: 15, // Maximum transaction costs
  },
} as const;