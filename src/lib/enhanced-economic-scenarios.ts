import { RealEstateInputs, CalculationResult } from "@/types/real-estate";
import { calculateRealEstateInvestment } from "@/lib/real-estate-calculator";

// ===== ENHANCED TYPES =====
export interface MarketContext {
  marketType: "primary" | "secondary";
  investorType: "new_investor" | "existing_investor";
  purchaseDate?: Date;
  currentMarketValue?: number;
}

export interface EnhancedEconomicFactors {
  // Macro factors
  inflationRate: number;
  gdpGrowthRate: number;
  unemploymentRate: number;

  // Property market factors
  primaryMarketPriceChange: number; // Giá từ chủ đầu tư
  secondaryMarketPriceChange: number; // Giá thị trường thứ cấp
  newSupplyChange: number; // Nguồn cung mới

  // Rental market factors
  rentalDemandChange: number; // Cầu thuê nhà
  rentalSupplyChange: number; // Cung cho thuê
  rentalPriceChange: number; // Giá thuê thị trường

  // Financial factors
  baseBankRateChange: number; // Lãi suất ngân hàng trung ương
  bankLendingRateChange: number; // Lãi suất cho vay BĐS
  creditAvailabilityChange: number; // Khả năng tiếp cận tín dụng

  // Market sentiment
  buyerSentiment: number; // Tâm lý người mua (-100 to +100)
  investorConfidence: number; // Niềm tin nhà đầu tư (-100 to +100)
}

export interface EnhancedEconomicScenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  timeframe: string;
  factors: EnhancedEconomicFactors;
  marketImpacts: {
    newInvestors: "positive" | "negative" | "neutral";
    existingInvestors: "positive" | "negative" | "neutral";
    rentalMarket: "positive" | "negative" | "neutral";
  };
  color: string;
  icon: string;
}

// ===== ENHANCED SCENARIO GENERATOR =====
export class EnhancedEconomicScenarioGenerator {
  /**
   * Generate scenarios với proper market dynamics
   */
  static generateEnhancedScenarios(
    baseInputs: RealEstateInputs,
    marketContext: MarketContext,
    selectedScenarios?: string[]
  ): EnhancedGeneratedScenario[] {
    const scenarios = selectedScenarios
      ? ENHANCED_ECONOMIC_SCENARIOS.filter((s) =>
          selectedScenarios.includes(s.id)
        )
      : ENHANCED_ECONOMIC_SCENARIOS;

    return scenarios.map((scenario) => {
      const adjustedInputs = this.applyEnhancedEconomicFactors(
        baseInputs,
        scenario.factors,
        marketContext
      );
      const result = calculateRealEstateInvestment(adjustedInputs);
      const originalResult = calculateRealEstateInvestment(baseInputs);

      return {
        scenario,
        marketContext,
        originalInputs: baseInputs,
        adjustedInputs,
        result,
        impactAnalysis: this.analyzeEnhancedImpact(
          originalResult,
          result,
          scenario.factors,
          marketContext
        ),
      };
    });
  }

  /**
   * Apply economic factors với correct logic cho different market contexts
   */
  private static applyEnhancedEconomicFactors(
    baseInputs: RealEstateInputs,
    factors: EnhancedEconomicFactors,
    context: MarketContext
  ): RealEstateInputs {
    const adjustedInputs = { ...baseInputs };

    // ===== PROPERTY PRICE LOGIC =====
    const basePrice = baseInputs.giaTriBDS || 0;

    if (context.investorType === "existing_investor") {
      // Đã mua rồi - giá tăng là GOOD cho existing investors
      // Nhưng ko ảnh hưởng đến purchase price (đã mua rồi)
      adjustedInputs.giaTriBDS = basePrice; // Keep original purchase price

      // Market value tăng có thể cho phép refinance tốt hơn
      const marketValueIncrease =
        context.marketType === "primary"
          ? factors.primaryMarketPriceChange
          : factors.secondaryMarketPriceChange;

      if (marketValueIncrease > 0) {
        // Có thể refinance với LTV tốt hơn
        const newMarketValue = basePrice * (1 + marketValueIncrease / 100);
        const maxLoanAmount = newMarketValue * 0.8; // 80% LTV
        const currentLoan = basePrice - (baseInputs.vonTuCo || 0);

        if (maxLoanAmount > currentLoan) {
          // Có thể rút thêm tiền từ refinance
          // This would improve cash flow but we keep conservative for now
        }
      }
    } else {
      // New investor - giá tăng là BAD (expensive to enter)
      const priceChange =
        context.marketType === "primary"
          ? factors.primaryMarketPriceChange
          : factors.secondaryMarketPriceChange;

      adjustedInputs.giaTriBDS = Math.max(
        1000000,
        basePrice * (1 + priceChange / 100)
      );
    }

    // ===== RENTAL MARKET LOGIC =====
    // Rental prices usually correlate với property prices
    const baseRental = baseInputs.tienThueThang || 0;

    // Rental market dynamics
    const rentalSupplyDemandRatio =
      factors.rentalDemandChange - factors.rentalSupplyChange;
    const totalRentalChange =
      factors.rentalPriceChange + rentalSupplyDemandRatio * 0.5;

    adjustedInputs.tienThueThang = Math.max(
      0,
      baseRental * (1 + totalRentalChange / 100)
    );

    // ===== INTEREST RATE LOGIC =====
    const baseInterestUuDai = baseInputs.laiSuatUuDai || 8;
    const baseInterestThaNoi = baseInputs.laiSuatThaNoi || 10;

    // Bank lending rates affected by base rate + credit availability
    const lendingRateAdjustment =
      factors.baseBankRateChange + factors.bankLendingRateChange;
    const creditAdjustment = -factors.creditAvailabilityChange * 0.1; // Better credit = lower rates

    adjustedInputs.laiSuatUuDai = Math.max(
      0.1,
      baseInterestUuDai + lendingRateAdjustment + creditAdjustment
    );
    adjustedInputs.laiSuatThaNoi = Math.max(
      0.1,
      baseInterestThaNoi + lendingRateAdjustment + creditAdjustment
    );

    // ===== VACANCY RATE LOGIC =====
    const baseVacancyRate = 100 - (baseInputs.tyLeLapDay || 95);
    const rentalMarketTightness =
      factors.rentalDemandChange - factors.rentalSupplyChange;
    const newVacancyRate = Math.max(
      2, // Minimum 2% vacancy
      Math.min(20, baseVacancyRate - rentalMarketTightness * 0.2)
    );
    adjustedInputs.tyLeLapDay = 100 - newVacancyRate;

    // ===== OPERATING COSTS LOGIC =====
    const inflationMultiplier = 1 + factors.inflationRate / 100;

    adjustedInputs.phiQuanLy =
      (baseInputs.phiQuanLy || 0) * inflationMultiplier;
    adjustedInputs.phiBaoTri =
      (baseInputs.phiBaoTri || 1) * inflationMultiplier;
    adjustedInputs.baoHiemTaiSan =
      (baseInputs.baoHiemTaiSan || 0.1) * inflationMultiplier;

    return adjustedInputs;
  }

  /**
   * Enhanced impact analysis với proper context
   */
  private static analyzeEnhancedImpact(
    originalResult: CalculationResult,
    newResult: CalculationResult,
    factors: EnhancedEconomicFactors,
    context: MarketContext
  ): EnhancedImpactAnalysis {
    const roiChange =
      (newResult.roiHangNam || 0) - (originalResult.roiHangNam || 0);
    const cashFlowChange =
      (newResult.steps?.dongTienRongBDS || 0) -
      (originalResult.steps?.dongTienRongBDS || 0);
    const paybackChange =
      (newResult.paybackPeriod || 0) - (originalResult.paybackPeriod || 0);

    // Risk assessment với context
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";

    if (
      newResult.steps?.dongTienRongBDS < -2000000 ||
      newResult.roiHangNam < 0
    ) {
      riskLevel = "critical";
    } else if (
      newResult.steps?.dongTienRongBDS < 0 ||
      newResult.roiHangNam < 5
    ) {
      riskLevel = "high";
    } else if (roiChange < -3 || cashFlowChange < -1000000) {
      riskLevel = "medium";
    }

    // Context-aware impacts
    const keyImpacts: string[] = [];

    // Different messaging cho different investor types
    if (context.investorType === "existing_investor") {
      if (
        factors.primaryMarketPriceChange > 0 ||
        factors.secondaryMarketPriceChange > 0
      ) {
        const priceChange =
          context.marketType === "primary"
            ? factors.primaryMarketPriceChange
            : factors.secondaryMarketPriceChange;
        keyImpacts.push(`🏠 Giá trị tài sản tăng ${priceChange.toFixed(1)}%`);
      }

      if (factors.rentalPriceChange > 0) {
        keyImpacts.push(
          `📈 Thu nhập thuê tăng ${factors.rentalPriceChange.toFixed(1)}%`
        );
      }
    } else {
      // New investor
      if (
        factors.primaryMarketPriceChange > 0 ||
        factors.secondaryMarketPriceChange > 0
      ) {
        const priceChange =
          context.marketType === "primary"
            ? factors.primaryMarketPriceChange
            : factors.secondaryMarketPriceChange;
        keyImpacts.push(`⚠️ Chi phí mua tăng ${priceChange.toFixed(1)}%`);
      }
    }

    if (Math.abs(roiChange) > 1) {
      keyImpacts.push(
        `📊 ROI ${roiChange > 0 ? "tăng" : "giảm"} ${Math.abs(
          roiChange
        ).toFixed(1)}%`
      );
    }

    if (Math.abs(cashFlowChange) > 500000) {
      const changeInMillions = Math.abs(cashFlowChange) / 1000000;
      keyImpacts.push(
        `💰 Dòng tiền ${
          cashFlowChange > 0 ? "tăng" : "giảm"
        } ${changeInMillions.toFixed(1)}M/tháng`
      );
    }

    if (factors.bankLendingRateChange !== 0) {
      keyImpacts.push(
        `🏦 Lãi suất ${
          factors.bankLendingRateChange > 0 ? "tăng" : "giảm"
        } ${Math.abs(factors.bankLendingRateChange).toFixed(1)}%`
      );
    }

    // Market sentiment impacts
    if (factors.buyerSentiment < -30) {
      keyImpacts.push(`😰 Tâm lý người mua tiêu cực`);
    } else if (factors.buyerSentiment > 30) {
      keyImpacts.push(`😊 Tâm lý người mua tích cực`);
    }

    return {
      roiChange,
      cashFlowChange,
      paybackChange,
      riskLevel,
      keyImpacts,
      marketContext: context,
      investorAdvice: this.generateInvestorAdvice(factors, context, riskLevel),
    };
  }

  /**
   * Generate advice dựa trên investor type và market context
   */
  private static generateInvestorAdvice(
    factors: EnhancedEconomicFactors,
    context: MarketContext,
    riskLevel: string
  ): string[] {
    const advice: string[] = [];

    if (context.investorType === "existing_investor") {
      if (
        factors.primaryMarketPriceChange > 5 ||
        factors.secondaryMarketPriceChange > 5
      ) {
        advice.push("💡 Cân nhắc refinance để tận dụng tăng giá tài sản");
      }
      if (factors.rentalPriceChange > 3) {
        advice.push("📈 Thời điểm tốt để tăng giá thuê");
      }
      if (riskLevel === "low" && factors.investorConfidence > 20) {
        advice.push("🎯 Có thể mở rộng danh mục đầu tư");
      }
    } else {
      // New investor
      if (factors.primaryMarketPriceChange > 10) {
        advice.push("⏳ Cân nhắc đợi thị trường điều chỉnh");
      }
      if (factors.creditAvailabilityChange < -20) {
        advice.push(
          "🏦 Khó khăn tiếp cận tín dụng, chuẩn bị vốn tự có cao hơn"
        );
      }
      if (context.marketType === "secondary" && factors.buyerSentiment < -20) {
        advice.push("💰 Cơ hội thương lượng giá tốt từ người bán");
      }
    }

    if (riskLevel === "high" || riskLevel === "critical") {
      advice.push("⚠️ Tình hình rủi ro cao, cần đánh giá kỹ lưỡng");
    }

    return advice;
  }
}

// ===== ENHANCED SCENARIOS =====
export const ENHANCED_ECONOMIC_SCENARIOS: EnhancedEconomicScenario[] = [
  {
    id: "property_boom",
    name: "🚀 Bùng nổ Bất động sản",
    description: "Giá BĐS tăng mạnh, cầu cao, nguồn cung khan hiếm",
    probability: 20,
    timeframe: "1-2 năm",
    factors: {
      inflationRate: 5,
      gdpGrowthRate: 7,
      unemploymentRate: 4,
      primaryMarketPriceChange: 8, // Chủ đầu tư tăng giá
      secondaryMarketPriceChange: 15, // Thị trường thứ cấp tăng mạnh hơn
      newSupplyChange: -20, // Nguồn cung mới giảm
      rentalDemandChange: 10, // Cầu thuê tăng
      rentalSupplyChange: -5, // Cung cho thuê giảm
      rentalPriceChange: 12, // Giá thuê tăng mạnh
      baseBankRateChange: 0.5,
      bankLendingRateChange: 0.3,
      creditAvailabilityChange: -10, // Khó vay hơn
      buyerSentiment: 60, // Tâm lý mua mạnh
      investorConfidence: 70, // Niềm tin cao
    },
    marketImpacts: {
      newInvestors: "negative", // Khó vào thị trường
      existingInvestors: "positive", // Tài sản tăng giá
      rentalMarket: "positive", // Thu nhập thuê tăng
    },
    color: "text-orange-600",
    icon: "Rocket",
  },

  {
    id: "market_correction",
    name: "📉 Điều chỉnh Thị trường",
    description: "Giá BĐS giảm, thanh khoản thấp, cơ hội cho người mua",
    probability: 25,
    timeframe: "6-18 tháng",
    factors: {
      inflationRate: 3,
      gdpGrowthRate: 3,
      unemploymentRate: 7,
      primaryMarketPriceChange: -2, // Chủ đầu tư giảm giá nhẹ
      secondaryMarketPriceChange: -8, // Thị trường thứ cấp giảm mạnh
      newSupplyChange: 15, // Nguồn cung mới tăng
      rentalDemandChange: -5, // Cầu thuê giảm
      rentalSupplyChange: 10, // Cung cho thuê tăng
      rentalPriceChange: -3, // Giá thuê giảm
      baseBankRateChange: -0.5,
      bankLendingRateChange: -0.2,
      creditAvailabilityChange: 15, // Dễ vay hơn để kích thích
      buyerSentiment: -40, // Tâm lý mua yếu
      investorConfidence: -30, // Niềm tin giảm
    },
    marketImpacts: {
      newInvestors: "positive", // Cơ hội mua rẻ
      existingInvestors: "negative", // Tài sản giảm giá
      rentalMarket: "negative", // Thu nhập thuê giảm
    },
    color: "text-red-600",
    icon: "TrendingDown",
  },

  {
    id: "rental_boom",
    name: "🏠 Bùng nổ Thị trường Thuê",
    description: "Cầu thuê nhà tăng mạnh, giá thuê cao, vacancy thấp",
    probability: 30,
    timeframe: "1-3 năm",
    factors: {
      inflationRate: 4,
      gdpGrowthRate: 6,
      unemploymentRate: 5,
      primaryMarketPriceChange: 3, // Giá mua tăng nhẹ
      secondaryMarketPriceChange: 5,
      newSupplyChange: -10, // Nguồn cung mới giảm
      rentalDemandChange: 20, // Cầu thuê tăng mạnh
      rentalSupplyChange: -8, // Cung cho thuê giảm
      rentalPriceChange: 15, // Giá thuê tăng mạnh
      baseBankRateChange: 0,
      bankLendingRateChange: 0.2,
      creditAvailabilityChange: 0,
      buyerSentiment: 20,
      investorConfidence: 50,
    },
    marketImpacts: {
      newInvestors: "positive", // ROI từ thuê tốt
      existingInvestors: "positive", // Thu nhập thuê tăng
      rentalMarket: "positive", // Thị trường thuê mạnh
    },
    color: "text-green-600",
    icon: "Home",
  },

  {
    id: "interest_spike",
    name: "📈 Lãi suất Tăng đột biến",
    description: "NHNN tăng lãi suất để kiểm soát lạm phát",
    probability: 15,
    timeframe: "6-12 tháng",
    factors: {
      inflationRate: 8,
      gdpGrowthRate: 4,
      unemploymentRate: 6,
      primaryMarketPriceChange: -1, // Giá giảm nhẹ do lãi suất
      secondaryMarketPriceChange: -5,
      newSupplyChange: 5,
      rentalDemandChange: 5, // Nhiều người chuyển sang thuê
      rentalSupplyChange: -2,
      rentalPriceChange: 3, // Giá thuê tăng nhẹ
      baseBankRateChange: 2, // NHNN tăng mạnh
      bankLendingRateChange: 3, // Ngân hàng tăng theo
      creditAvailabilityChange: -30, // Khó vay nhiều
      buyerSentiment: -50, // Tâm lý mua rất yếu
      investorConfidence: -40,
    },
    marketImpacts: {
      newInvestors: "negative", // Khó vay, ROI giảm
      existingInvestors: "negative", // Chi phí lãi tăng
      rentalMarket: "positive", // Cầu thuê tăng
    },
    color: "text-purple-600",
    icon: "AlertTriangle",
  },
];

// ===== ENHANCED TYPES =====
export interface EnhancedGeneratedScenario {
  scenario: EnhancedEconomicScenario;
  marketContext: MarketContext;
  originalInputs: RealEstateInputs;
  adjustedInputs: RealEstateInputs;
  result: CalculationResult;
  impactAnalysis: EnhancedImpactAnalysis;
}

export interface EnhancedImpactAnalysis {
  roiChange: number;
  cashFlowChange: number;
  paybackChange: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  keyImpacts: string[];
  marketContext: MarketContext;
  investorAdvice: string[];
}

/**
 * Interface for Future Projection Configuration
 */
export interface FutureProjectionConfig {
  /** Thời điểm mua trong tương lai (số tháng từ hiện tại) */
  futureTimeMonths: number;

  /** Ngày dự kiến mua (optional, for calendar integration) */
  targetPurchaseDate?: Date;

  /** Kịch bản kinh tế áp dụng */
  economicScenario: EnhancedEconomicScenario;

  /** Có duy trì tỷ lệ vốn tự có (% của giá trị BĐS) hay giữ nguyên số tiền */
  maintainEquityRatio: boolean;
}

/**
 * Result of future projection
 */
export interface FutureProjectionResult {
  /** Original inputs */
  originalInputs: RealEstateInputs;

  /** Projected inputs for future purchase */
  projectedInputs: RealEstateInputs;

  /** Projection configuration used */
  projectionConfig: FutureProjectionConfig;

  /** Projection summary */
  projectionSummary: {
    /** Thay đổi giá trị BĐS (%) */
    propertyValueChange: number;

    /** Thay đổi tiền thuê tháng (%) */
    rentalIncomeChange: number;

    /** Thay đổi lãi suất ưu đãi (% points) */
    preferentialRateChange: number;

    /** Thay đổi lãi suất thả nổi (% points) */
    floatingRateChange: number;

    /** Tổng số năm dự phóng */
    projectionYears: number;
  };

  /** Warnings về projection */
  warnings: string[];
}

/**
 * PROJECT FUTURE REAL ESTATE INPUTS
 * Core function to project real estate inputs to a future point in time
 * based on economic scenario assumptions
 */
export function projectFutureRealEstateInputs(
  currentInputs: RealEstateInputs,
  projectionConfig: FutureProjectionConfig
): FutureProjectionResult {
  const { futureTimeMonths, economicScenario, maintainEquityRatio } =
    projectionConfig;
  const factors = economicScenario.factors;
  const projectionYears = futureTimeMonths / 12;

  // Validation
  const warnings: string[] = [];

  if (futureTimeMonths <= 0) {
    throw new Error("Thời gian dự phóng phải lớn hơn 0 tháng");
  }

  if (futureTimeMonths > 120) {
    // > 10 năm
    warnings.push(
      "Dự phóng xa hơn 10 năm có thể không chính xác do biến động thị trường"
    );
  }

  if (projectionYears < 0.5) {
    warnings.push(
      "Dự phóng ngắn hạn (<6 tháng) có thể không phản ánh đầy đủ tác động kinh tế"
    );
  }

  // === 1. DỰ PHÓNG GIÁ TRỊ BẤT ĐỘNG SẢN ===
  const currentPropertyValue = currentInputs.giaTriBDS || 0;

  // Sử dụng average của primary và secondary market changes
  // với weight khác nhau tùy vào loại thị trường
  const primaryWeight = 0.3; // Ít ảnh hưởng từ thị trường sơ cấp trong dự phóng
  const secondaryWeight = 0.7; // Chủ yếu theo thị trường thứ cấp

  const annualAppreciationRate =
    (factors.primaryMarketPriceChange * primaryWeight +
      factors.secondaryMarketPriceChange * secondaryWeight) /
    100;

  const projectedPropertyValue = Math.round(
    currentPropertyValue * Math.pow(1 + annualAppreciationRate, projectionYears)
  );

  // === 2. DỰ PHÓNG TIỀN THUÊ THÁNG ===
  const currentRentalIncome = currentInputs.tienThueThang || 0;

  // Rental growth rate dựa trên rental price change và supply/demand dynamics
  const rentalDemandSupplyImpact =
    (factors.rentalDemandChange - factors.rentalSupplyChange) * 0.3;
  const annualRentalGrowthRate =
    (factors.rentalPriceChange + rentalDemandSupplyImpact) / 100;

  const projectedRentalIncome = Math.round(
    currentRentalIncome * Math.pow(1 + annualRentalGrowthRate, projectionYears)
  );

  // === 3. DỰ PHÓNG LÃI SUẤT ===
  const currentPreferentialRate = currentInputs.laiSuatUuDai || 8;
  const currentFloatingRate = currentInputs.laiSuatThaNoi || 12;

  // Interest rate changes từ economic factors
  const totalRateChange =
    factors.baseBankRateChange + factors.bankLendingRateChange;

  const projectedPreferentialRate = Math.max(
    0.1,
    Math.min(30, currentPreferentialRate + totalRateChange)
  );

  const projectedFloatingRate = Math.max(
    0.1,
    Math.min(30, currentFloatingRate + totalRateChange)
  );

  // === 4. XỬ LÝ VỐN TỰ CÓ ===
  let projectedEquity: number;

  if (maintainEquityRatio) {
    // Duy trì tỷ lệ % vốn tự có so với giá trị BĐS
    const equityRatio = (currentInputs.vonTuCo || 0) / currentPropertyValue;
    projectedEquity = Math.round(projectedPropertyValue * equityRatio);
  } else {
    // Giữ nguyên số tiền vốn tự có (giả định người mua đã chuẩn bị sẵn)
    projectedEquity = currentInputs.vonTuCo || 0;

    // Warning nếu tỷ lệ vốn tự có quá thấp
    const newEquityRatio = projectedEquity / projectedPropertyValue;
    if (newEquityRatio < 0.1) {
      warnings.push(
        `Tỷ lệ vốn tự có chỉ ${(newEquityRatio * 100).toFixed(
          1
        )}% - cần chuẩn bị thêm vốn`
      );
    }
  }

  // === 5. DỰ PHÓNG CÁC CHỈ SỐ KHÁC ===
  // Construction cost impact (ảnh hưởng đến chi phí mua, trang bị, etc.)
  const constructionCostMultiplier =
    1 + (factors.inflationRate / 100) * projectionYears;

  const projectedPurchaseCost = Math.round(
    (currentInputs.chiPhiMua || 2) * constructionCostMultiplier
  );

  const projectedEquipmentCost = Math.round(
    (currentInputs.chiPhiTrangBi || 0) * constructionCostMultiplier
  );

  // === 6. TẠO PROJECTED INPUTS ===
  const projectedInputs: RealEstateInputs = {
    ...currentInputs,

    // Core financial values
    giaTriBDS: projectedPropertyValue,
    vonTuCo: projectedEquity,
    tienThueThang: projectedRentalIncome,

    // Interest rates
    laiSuatUuDai: projectedPreferentialRate,
    laiSuatThaNoi: projectedFloatingRate,

    // Cost adjustments
    chiPhiMua: projectedPurchaseCost,
    chiPhiTrangBi: projectedEquipmentCost,

    // Preserve other settings (loan term, etc.)
    // These typically don't change based on market conditions
  };

  // === 7. TÍNH TOÁN SUMMARY ===
  const projectionSummary = {
    propertyValueChange:
      ((projectedPropertyValue - currentPropertyValue) / currentPropertyValue) *
      100,
    rentalIncomeChange:
      currentRentalIncome > 0
        ? ((projectedRentalIncome - currentRentalIncome) /
            currentRentalIncome) *
          100
        : 0,
    preferentialRateChange: projectedPreferentialRate - currentPreferentialRate,
    floatingRateChange: projectedFloatingRate - currentFloatingRate,
    projectionYears,
  };

  // Additional warnings based on projections
  if (Math.abs(projectionSummary.propertyValueChange) > 50) {
    warnings.push(
      `Biến động giá BĐS lớn (${projectionSummary.propertyValueChange.toFixed(
        1
      )}%) - cần xem xét kỹ`
    );
  }

  if (Math.abs(projectionSummary.preferentialRateChange) > 5) {
    warnings.push(
      `Thay đổi lãi suất lớn (${projectionSummary.preferentialRateChange.toFixed(
        1
      )}% points)`
    );
  }

  return {
    originalInputs: currentInputs,
    projectedInputs,
    projectionConfig,
    projectionSummary,
    warnings,
  };
}

/**
 * HELPER: Create multiple future scenarios for comparison
 */
export function createFutureScenarioComparison(
  currentInputs: RealEstateInputs,
  scenarioConfigs: FutureProjectionConfig[]
): FutureProjectionResult[] {
  return scenarioConfigs.map((config) =>
    projectFutureRealEstateInputs(currentInputs, config)
  );
}

/**
 * HELPER: Get default projection configs for common scenarios
 */
export function getDefaultFutureProjectionConfigs(
  baseTimeMonths: number = 24
): { config: FutureProjectionConfig; scenario: EnhancedEconomicScenario }[] {
  return ENHANCED_ECONOMIC_SCENARIOS.slice(0, 3).map((scenario) => ({
    config: {
      futureTimeMonths: baseTimeMonths,
      economicScenario: scenario,
      maintainEquityRatio: false, // Default: keep same cash amount
    },
    scenario,
  }));
}
