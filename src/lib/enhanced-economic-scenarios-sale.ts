// UPDATED: 2025-01-10 - Added sale scenario analysis integration

import { RealEstateInputs, CalculationResult } from "@/types/real-estate";
import { 
  MarketContext,
  EnhancedEconomicFactors,
  EnhancedEconomicScenario,
  EnhancedGeneratedScenario,
  ENHANCED_ECONOMIC_SCENARIOS,
} from "@/lib/enhanced-economic-scenarios";
import {
  HoldingPeriodInputs,
  SaleAnalysisResult,
} from "@/types/sale-scenario";
import { calculateSaleAnalysis, compareSaleScenarios } from "./sale-scenario-utils";
import { calculateRealEstateInvestment } from "./real-estate-calculator";

/**
 * Enhanced Economic Factors with Sale Analysis Support
 */
export interface EnhancedEconomicFactorsWithSaleSupport extends EnhancedEconomicFactors {
  /** Property appreciation rate impact (% annual) */
  propertyAppreciationRateChange: number;
  
  /** Market liquidity factor (-100 to +100) */
  marketLiquidityFactor: number;
  
  /** Transaction cost multiplier (0.5 to 2.0) */
  transactionCostMultiplier: number;
  
  /** Average time to complete sale (months) */
  averageTimeToSale: number;
}

/**
 * Enhanced Economic Scenario with Sale Analysis
 */
export interface EnhancedEconomicScenarioWithSale extends EnhancedEconomicScenario {
  factors: EnhancedEconomicFactorsWithSaleSupport;
  
  /** Sale-specific impacts */
  saleImpacts: {
    /** Impact on property appreciation */
    appreciation: "accelerated" | "normal" | "decelerated" | "negative";
    /** Impact on market liquidity */
    liquidity: "high" | "normal" | "low" | "illiquid";
    /** Impact on transaction costs */
    transactionCosts: "low" | "normal" | "high";
  };
}

/**
 * Enhanced Generated Scenario with Sale Analysis
 */
export interface EnhancedGeneratedScenarioWithSale extends EnhancedGeneratedScenario {
  /** Sale analysis results if enabled */
  saleAnalysis?: SaleAnalysisResult;
  
  /** Sale scenario comparison across different holding periods */
  saleComparison?: {
    holdingPeriods: number[];
    optimalPeriod: number;
    scenarios: { months: number; roi: number; totalReturn: number }[];
  };
}

/**
 * Enhanced Economic Scenario Generator with Sale Analysis
 */
export class EnhancedEconomicScenarioGeneratorWithSale {
  
  /**
   * Generate scenarios with sale analysis support
   */
  static generateEnhancedScenariosWithSale(
    baseInputs: RealEstateInputs,
    marketContext: MarketContext,
    saleAnalysisConfig?: HoldingPeriodInputs,
    selectedScenarios?: string[]
  ): EnhancedGeneratedScenarioWithSale[] {
    
    const enhancedScenarios = this.getEnhancedScenariosWithSaleSupport();
    const scenarios = selectedScenarios
      ? enhancedScenarios.filter((s) => selectedScenarios.includes(s.id))
      : enhancedScenarios;

    return scenarios.map((scenario) => {
      // Apply economic factors to base inputs
      const adjustedInputs = this.applyEnhancedEconomicFactorsWithSale(
        baseInputs,
        scenario.factors,
        marketContext
      );
      
      // Calculate base scenario
      const result = calculateRealEstateInvestment(adjustedInputs);
      const originalResult = calculateRealEstateInvestment(baseInputs);
      
      // Calculate sale analysis if configured
      let saleAnalysis: SaleAnalysisResult | undefined;
      let saleComparison: any;
      
      if (saleAnalysisConfig && saleAnalysisConfig.enableSaleAnalysis) {
        // Apply scenario-specific adjustments to sale analysis config
        const adjustedSaleConfig = this.adjustSaleConfigForScenario(
          saleAnalysisConfig,
          scenario
        );
        
        // Calculate sale analysis with scenario-adjusted inputs
        saleAnalysis = calculateSaleAnalysis(adjustedInputs, adjustedSaleConfig);
        
        // Generate comparison across multiple holding periods
        const holdingPeriods = [24, 36, 48, 60, 84, 120]; // 2,3,4,5,7,10 years
        const comparison = compareSaleScenarios(
          adjustedInputs,
          holdingPeriods,
          adjustedSaleConfig
        );
        
        saleComparison = {
          holdingPeriods,
          optimalPeriod: comparison.recommendations.balanced.holdingPeriod,
          scenarios: comparison.scenarios.map(s => ({
            months: s.holdingPeriod,
            roi: s.result.totalROIOnSale,
            totalReturn: s.result.totalReturn,
          })),
        };
      }
      
      return {
        scenario,
        marketContext,
        originalInputs: baseInputs,
        adjustedInputs,
        result,
        impactAnalysis: this.analyzeEnhancedImpactWithSale(
          originalResult,
          result,
          scenario.factors,
          marketContext,
          saleAnalysis
        ),
        saleAnalysis,
        saleComparison,
      };
    });
  }
  
  /**
   * Get enhanced scenarios with sale analysis support
   */
  private static getEnhancedScenariosWithSaleSupport(): EnhancedEconomicScenarioWithSale[] {
    return ENHANCED_ECONOMIC_SCENARIOS.map(scenario => ({
      ...scenario,
      factors: this.enhanceFactorsWithSaleSupport(scenario.factors),
      saleImpacts: this.determineSaleImpacts(scenario),
    }));
  }
  
  /**
   * Enhance economic factors with sale analysis parameters
   */
  private static enhanceFactorsWithSaleSupport(
    factors: EnhancedEconomicFactors
  ): EnhancedEconomicFactorsWithSaleSupport {
    // Map existing factors to sale-specific impacts
    let propertyAppreciationRateChange = 0;
    let marketLiquidityFactor = 0;
    let transactionCostMultiplier = 1.0;
    let averageTimeToSale = 3; // Default 3 months
    
    // Map price changes to appreciation rate changes
    const avgPriceChange = (factors.primaryMarketPriceChange + factors.secondaryMarketPriceChange) / 2;
    propertyAppreciationRateChange = avgPriceChange * 0.6; // Moderate correlation
    
    // Map market sentiment to liquidity
    const avgSentiment = (factors.buyerSentiment + factors.investorConfidence) / 2;
    marketLiquidityFactor = avgSentiment * 0.8;
    
    // Map economic conditions to transaction costs
    if (factors.inflationRate > 5 || factors.unemploymentRate > 8) {
      transactionCostMultiplier = 1.2; // Higher costs in difficult times
      averageTimeToSale = 6;
    } else if (factors.gdpGrowthRate > 5 && avgSentiment > 30) {
      transactionCostMultiplier = 0.8; // Lower costs in boom times
      averageTimeToSale = 2;
    }
    
    return {
      ...factors,
      propertyAppreciationRateChange,
      marketLiquidityFactor,
      transactionCostMultiplier,
      averageTimeToSale,
    };
  }
  
  /**
   * Determine sale-specific impacts for a scenario
   */
  private static determineSaleImpacts(scenario: EnhancedEconomicScenario): {
    appreciation: "accelerated" | "normal" | "decelerated" | "negative";
    liquidity: "high" | "normal" | "low" | "illiquid";
    transactionCosts: "low" | "normal" | "high";
  } {
    const factors = scenario.factors;
    const avgPriceChange = (factors.primaryMarketPriceChange + factors.secondaryMarketPriceChange) / 2;
    const avgSentiment = (factors.buyerSentiment + factors.investorConfidence) / 2;
    
    // Determine appreciation impact
    let appreciation: "accelerated" | "normal" | "decelerated" | "negative";
    if (avgPriceChange > 10) appreciation = "accelerated";
    else if (avgPriceChange > 0) appreciation = "normal";
    else if (avgPriceChange > -5) appreciation = "decelerated";
    else appreciation = "negative";
    
    // Determine liquidity impact
    let liquidity: "high" | "normal" | "low" | "illiquid";
    if (avgSentiment > 40) liquidity = "high";
    else if (avgSentiment > 0) liquidity = "normal";
    else if (avgSentiment > -40) liquidity = "low";
    else liquidity = "illiquid";
    
    // Determine transaction costs impact
    let transactionCosts: "low" | "normal" | "high";
    if (factors.inflationRate > 6 || factors.unemploymentRate > 10) {
      transactionCosts = "high";
    } else if (factors.gdpGrowthRate > 6 && avgSentiment > 50) {
      transactionCosts = "low";
    } else {
      transactionCosts = "normal";
    }
    
    return { appreciation, liquidity, transactionCosts };
  }
  
  /**
   * Apply economic factors with sale analysis considerations
   */
  private static applyEnhancedEconomicFactorsWithSale(
    baseInputs: RealEstateInputs,
    factors: EnhancedEconomicFactorsWithSaleSupport,
    context: MarketContext
  ): RealEstateInputs {
    // Start with existing enhanced economic factors application
    const adjustedInputs = this.applyExistingEconomicFactors(baseInputs, factors, context);
    
    // Apply sale-specific adjustments
    // Adjust selling costs based on transaction cost multiplier
    const baseSellCost = adjustedInputs.chiPhiBan || 3;
    adjustedInputs.chiPhiBan = Math.max(0.5, Math.min(15, 
      baseSellCost * factors.transactionCostMultiplier
    ));
    
    return adjustedInputs;
  }
  
  /**
   * Apply existing economic factors (placeholder - would use actual implementation)
   */
  private static applyExistingEconomicFactors(
    baseInputs: RealEstateInputs,
    factors: EnhancedEconomicFactorsWithSaleSupport,
    context: MarketContext
  ): RealEstateInputs {
    // This would call the existing applyEnhancedEconomicFactors method
    // For now, return a copy with basic adjustments
    const adjustedInputs = { ...baseInputs };
    
    // Apply basic price changes
    const priceChange = context.marketType === "primary"
      ? factors.primaryMarketPriceChange
      : factors.secondaryMarketPriceChange;
      
    if (context.investorType === "new_investor") {
      adjustedInputs.giaTriBDS = Math.max(1000000, 
        (baseInputs.giaTriBDS || 0) * (1 + priceChange / 100)
      );
    }
    
    // Apply rental changes
    const rentalChange = factors.rentalPriceChange + 
      (factors.rentalDemandChange - factors.rentalSupplyChange) * 0.5;
    adjustedInputs.tienThueThang = Math.max(0,
      (baseInputs.tienThueThang || 0) * (1 + rentalChange / 100)
    );
    
    // Apply interest rate changes
    adjustedInputs.laiSuatUuDai = Math.max(0.1,
      (baseInputs.laiSuatUuDai || 8) + factors.baseBankRateChange + factors.bankLendingRateChange
    );
    adjustedInputs.laiSuatThaNoi = Math.max(0.1,
      (baseInputs.laiSuatThaNoi || 12) + factors.baseBankRateChange + factors.bankLendingRateChange
    );
    
    return adjustedInputs;
  }
  
  /**
   * Adjust sale configuration based on economic scenario
   */
  private static adjustSaleConfigForScenario(
    baseConfig: HoldingPeriodInputs,
    scenario: EnhancedEconomicScenarioWithSale
  ): HoldingPeriodInputs {
    const adjustedConfig = { ...baseConfig };
    
    // Adjust appreciation rate based on scenario
    const baseAppreciation = baseConfig.propertyAppreciationRate;
    adjustedConfig.propertyAppreciationRate = Math.max(-10, Math.min(30,
      baseAppreciation + scenario.factors.propertyAppreciationRateChange
    ));
    
    // Adjust selling costs based on transaction cost multiplier
    const baseSellCost = baseConfig.sellingCostPercentage || 3;
    adjustedConfig.sellingCostPercentage = Math.max(0.5, Math.min(15,
      baseSellCost * scenario.factors.transactionCostMultiplier
    ));
    
    return adjustedConfig;
  }
  
  /**
   * Analyze enhanced impact including sale analysis
   */
  private static analyzeEnhancedImpactWithSale(
    originalResult: CalculationResult,
    newResult: CalculationResult,
    factors: EnhancedEconomicFactorsWithSaleSupport,
    context: MarketContext,
    saleAnalysis?: SaleAnalysisResult
  ): any {
    // Base impact analysis (would use existing implementation)
    const baseImpact = {
      roiChange: (newResult.roiHangNam || 0) - (originalResult.roiHangNam || 0),
      cashFlowChange: ((newResult.steps.dongTienRongBDS || 0) - (originalResult.steps.dongTienRongBDS || 0)),
      // ... other base analysis
    };
    
    // Add sale-specific analysis
    const saleImpact = saleAnalysis ? {
      saleROIImpact: saleAnalysis.totalROIOnSale - (originalResult.roiHangNam || 0),
      optimalHoldingPeriod: saleAnalysis.optimalSaleTiming.bestYear,
      totalReturnImpact: saleAnalysis.totalReturn - (originalResult.steps.tongVonBanDau || 0),
      appreciationImpact: factors.propertyAppreciationRateChange,
      liquidityImpact: factors.marketLiquidityFactor,
      transactionCostImpact: factors.transactionCostMultiplier - 1,
    } : {};
    
    return {
      ...baseImpact,
      ...saleImpact,
      recommendation: this.generateSaleRecommendation(factors, saleAnalysis),
    };
  }
  
  /**
   * Generate sale-specific recommendations
   */
  private static generateSaleRecommendation(
    factors: EnhancedEconomicFactorsWithSaleSupport,
    saleAnalysis?: SaleAnalysisResult
  ): string {
    if (!saleAnalysis) {
      return "Enable sale analysis for detailed recommendations.";
    }
    
    let recommendation = "";
    
    if (factors.propertyAppreciationRateChange > 5) {
      recommendation = "Strong appreciation expected. Consider holding longer for maximum gains.";
    } else if (factors.propertyAppreciationRateChange < -3) {
      recommendation = "Property depreciation risk. Consider selling sooner.";
    } else {
      recommendation = `Optimal sale timing is year ${saleAnalysis.optimalSaleTiming.bestYear}. `;
    }
    
    if (factors.marketLiquidityFactor < -30) {
      recommendation += " Market liquidity concerns - allow extra time for sale.";
    } else if (factors.marketLiquidityFactor > 30) {
      recommendation += " High market liquidity - quick sale possible.";
    }
    
    if (factors.transactionCostMultiplier > 1.2) {
      recommendation += " High transaction costs - ensure longer holding period justifies costs.";
    }
    
    return recommendation || "Market conditions are favorable for the planned holding period.";
  }
}