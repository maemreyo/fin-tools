import { RealEstateInputs, CalculationResult } from "@/types/real-estate";
import { calculateRealEstateInvestment } from "@/lib/real-estate-calculator";

// ===== UTILITY FUNCTIONS - FIXED =====
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || isNaN(value))
    return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

const safeCurrency = (value: any, defaultValue: number = 0): number => {
  const num = safeNumber(value, defaultValue);
  return Math.max(0, num); // Ensure non-negative
};

const safePercent = (value: any, defaultValue: number = 0): number => {
  const num = safeNumber(value, defaultValue);
  return Math.max(0, Math.min(100, num)); // Ensure 0-100 range
};

const formatSafePercent = (value: any, decimals: number = 1): string => {
  const num = safeNumber(value, 0);
  return `${num.toFixed(decimals)}%`;
};

// ===== ENHANCED TYPES WITH BETTER DEFAULTS =====
export interface EconomicFactors {
  inflationRate: number; // Tỷ lệ lạm phát (%)
  interestRateChange: number; // Thay đổi lãi suất (%)
  propertyPriceChange: number; // Thay đổi giá nhà (%)
  rentalIncomeChange: number; // Thay đổi thu nhập thuê (%)
  unemploymentRate: number; // Tỷ lệ thất nghiệp (%)
  gdpGrowthRate: number; // Tỷ lệ tăng trưởng GDP (%)
  constructionCostChange: number; // Thay đổi chi phí xây dựng (%)
  vacancyRateChange: number; // Thay đổi tỷ lệ trống (%)
}

export interface EconomicScenario {
  id: string;
  name: string;
  description: string;
  probability: number; // Xác suất xảy ra (0-100)
  timeframe: string; // Khung thời gian
  factors: EconomicFactors;
  color: string;
  icon: string;
}

export interface GeneratedScenario {
  scenario: EconomicScenario;
  originalInputs: RealEstateInputs;
  adjustedInputs: RealEstateInputs;
  result: CalculationResult;
  impactAnalysis: {
    roiChange: number;
    cashFlowChange: number;
    paybackChange: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    keyImpacts: string[];
  };
}

// ===== PREDEFINED ECONOMIC SCENARIOS =====
export const ECONOMIC_SCENARIOS: EconomicScenario[] = [
  {
    id: "optimistic",
    name: "Kịch bản Lạc quan",
    description:
      "Kinh tế phát triển mạnh, lạm phát thấp, bất động sản tăng giá",
    probability: 25,
    timeframe: "2-3 năm",
    factors: {
      inflationRate: 3.5,
      interestRateChange: -0.5,
      propertyPriceChange: 8,
      rentalIncomeChange: 6,
      unemploymentRate: 4,
      gdpGrowthRate: 7,
      constructionCostChange: 4,
      vacancyRateChange: -2,
    },
    color: "text-green-600",
    icon: "TrendingUp",
  },
  {
    id: "baseline",
    name: "Kịch bản Cơ sở",
    description: "Kinh tế ổn định, lạm phát kiểm soát, bất động sản tăng nhẹ",
    probability: 40,
    timeframe: "1-2 năm",
    factors: {
      inflationRate: 4.5,
      interestRateChange: 0,
      propertyPriceChange: 5,
      rentalIncomeChange: 3,
      unemploymentRate: 5,
      gdpGrowthRate: 6,
      constructionCostChange: 5,
      vacancyRateChange: 0,
    },
    color: "text-blue-600",
    icon: "Target",
  },
  {
    id: "conservative",
    name: "Kịch bản Thận trọng",
    description: "Kinh tế chậm lại, lạm phát tăng, bất động sản tăng chậm",
    probability: 25,
    timeframe: "2-4 năm",
    factors: {
      inflationRate: 6,
      interestRateChange: 1,
      propertyPriceChange: 2,
      rentalIncomeChange: 1,
      unemploymentRate: 6,
      gdpGrowthRate: 4,
      constructionCostChange: 7,
      vacancyRateChange: 3,
    },
    color: "text-yellow-600",
    icon: "Shield",
  },
  {
    id: "pessimistic",
    name: "Kịch bản Bi quan",
    description: "Suy thoái kinh tế, lạm phát cao, bất động sản giảm giá",
    probability: 10,
    timeframe: "1-3 năm",
    factors: {
      inflationRate: 8,
      interestRateChange: 2,
      propertyPriceChange: -3,
      rentalIncomeChange: -2,
      unemploymentRate: 8,
      gdpGrowthRate: 2,
      constructionCostChange: 10,
      vacancyRateChange: 5,
    },
    color: "text-red-600",
    icon: "TrendingDown",
  },
  {
    id: "interest_spike",
    name: "Lãi suất Tăng đột biến",
    description:
      "Ngân hàng trung ương tăng mạnh lãi suất để kiểm soát lạm phát",
    probability: 15,
    timeframe: "6-12 tháng",
    factors: {
      inflationRate: 7,
      interestRateChange: 3,
      propertyPriceChange: -5,
      rentalIncomeChange: 0,
      unemploymentRate: 7,
      gdpGrowthRate: 3,
      constructionCostChange: 8,
      vacancyRateChange: 4,
    },
    color: "text-purple-600",
    icon: "AlertTriangle",
  },
  {
    id: "property_boom",
    name: "Bùng nổ Bất động sản",
    description: "Giá bất động sản tăng mạnh do khan hiếm nguồn cung",
    probability: 20,
    timeframe: "1-2 năm",
    factors: {
      inflationRate: 5,
      interestRateChange: 0.5,
      propertyPriceChange: 15,
      rentalIncomeChange: 10,
      unemploymentRate: 5,
      gdpGrowthRate: 6.5,
      constructionCostChange: 12,
      vacancyRateChange: -3,
    },
    color: "text-orange-600",
    icon: "Rocket",
  },
];

// ===== MAIN GENERATOR CLASS =====
export class EconomicScenarioGenerator {
  /**
   * Tạo các kịch bản kinh tế từ inputs gốc - FIXED
   */
  static generateScenarios(
    baseInputs: RealEstateInputs,
    selectedScenarios?: string[]
  ): GeneratedScenario[] {
    const scenarios = selectedScenarios
      ? ECONOMIC_SCENARIOS.filter((s) => selectedScenarios.includes(s.id))
      : ECONOMIC_SCENARIOS;

    return scenarios.map((scenario) => {
      try {
        const adjustedInputs = this.applyEconomicFactors(
          baseInputs,
          scenario.factors
        );
        const result = calculateRealEstateInvestment(adjustedInputs);
        const originalResult = calculateRealEstateInvestment(baseInputs);

        return {
          scenario,
          originalInputs: baseInputs,
          adjustedInputs,
          result,
          impactAnalysis: this.analyzeImpact(
            originalResult,
            result,
            scenario.factors
          ),
        };
      } catch (error) {
        console.error(`Error generating scenario ${scenario.id}:`, error);
        // Return a safe fallback scenario
        return {
          scenario,
          originalInputs: baseInputs,
          adjustedInputs: baseInputs,
          result: calculateRealEstateInvestment(baseInputs),
          impactAnalysis: {
            roiChange: 0,
            cashFlowChange: 0,
            paybackChange: 0,
            riskLevel: "medium",
            keyImpacts: ["Không thể tính toán kịch bản này"],
          },
        };
      }
    });
  }

  /**
   * Áp dụng các yếu tố kinh tế vào inputs - FIXED
   */
  private static applyEconomicFactors(
    baseInputs: RealEstateInputs,
    factors: EconomicFactors
  ): RealEstateInputs {
    const adjustedInputs = { ...baseInputs };

    // FIXED: Safe number extraction với proper defaults
    const baseLaiSuatUuDai = safeNumber(baseInputs.laiSuatUuDai, 8);
    const baseLaiSuatThaNoi = safeNumber(baseInputs.laiSuatThaNoi, 10);
    const baseGiaTriBDS = safeCurrency(baseInputs.giaTriBDS, 1000000);
    const baseTienThueThang = safeCurrency(baseInputs.tienThueThang, 0);
    const baseTyLeLapDay = safePercent(baseInputs.tyLeLapDay, 95);
    const baseChiPhiTrangBi = safeCurrency(baseInputs.chiPhiTrangBi, 0);
    const basePhiBaoTri = safeNumber(baseInputs.phiBaoTri, 1);
    const basePhiQuanLy = safeCurrency(baseInputs.phiQuanLy, 0);

    // Điều chỉnh lãi suất - FIXED
    adjustedInputs.laiSuatUuDai = Math.max(
      0.1,
      baseLaiSuatUuDai + safeNumber(factors.interestRateChange, 0)
    );
    adjustedInputs.laiSuatThaNoi = Math.max(
      0.1,
      baseLaiSuatThaNoi + safeNumber(factors.interestRateChange, 0)
    );

    // Điều chỉnh giá bất động sản - FIXED
    const priceChangeRatio =
      1 + safeNumber(factors.propertyPriceChange, 0) / 100;
    adjustedInputs.giaTriBDS = Math.max(
      1000000,
      Math.round(baseGiaTriBDS * priceChangeRatio)
    );

    // Điều chỉnh thu nhập thuê - FIXED
    const rentalChangeRatio =
      1 + safeNumber(factors.rentalIncomeChange, 0) / 100;
    adjustedInputs.tienThueThang = Math.max(
      0,
      Math.round(baseTienThueThang * rentalChangeRatio)
    );

    // Điều chỉnh tỷ lệ lấp đầy - FIXED
    adjustedInputs.tyLeLapDay = Math.max(
      50,
      Math.min(100, baseTyLeLapDay + safeNumber(factors.vacancyRateChange, 0))
    );

    // Điều chỉnh chi phí xây dựng (chi phí trang bị) - FIXED
    const constructionChangeRatio =
      1 + safeNumber(factors.constructionCostChange, 0) / 100;
    adjustedInputs.chiPhiTrangBi = Math.max(
      0,
      Math.round(baseChiPhiTrangBi * constructionChangeRatio)
    );

    // Điều chỉnh chi phí bảo trì theo lạm phát - FIXED
    const inflationRatio = 1 + safeNumber(factors.inflationRate, 0) / 100;
    adjustedInputs.phiBaoTri = Math.max(0.1, basePhiBaoTri * inflationRatio);

    // Điều chỉnh chi phí quản lý theo lạm phát - FIXED
    adjustedInputs.phiQuanLy = Math.max(
      0,
      Math.round(basePhiQuanLy * inflationRatio)
    );

    // Ensure loan ratio is recalculated based on new property price
    const vonTuCo = safeCurrency(baseInputs.vonTuCo, 0);
    const soTienVay = Math.max(0, adjustedInputs.giaTriBDS - vonTuCo);
    adjustedInputs.tyLeVay =
      adjustedInputs.giaTriBDS > 0
        ? Math.min(90, (soTienVay / adjustedInputs.giaTriBDS) * 100)
        : 0;

    return adjustedInputs;
  }

  /**
   * Phân tích tác động của kịch bản - FIXED
   */
  private static analyzeImpact(
    originalResult: CalculationResult,
    newResult: CalculationResult,
    factors: EconomicFactors
  ): GeneratedScenario["impactAnalysis"] {
    // FIXED: Safe calculations with proper fallbacks
    const originalROI = safeNumber(originalResult.roiHangNam, 0);
    const newROI = safeNumber(newResult.roiHangNam, 0);
    const originalCashFlow = safeNumber(
      originalResult.steps?.dongTienRongBDS,
      0
    );
    const newCashFlow = safeNumber(newResult.steps?.dongTienRongBDS, 0);
    const originalPayback = safeNumber(originalResult.paybackPeriod, 0);
    const newPayback = safeNumber(newResult.paybackPeriod, 0);

    const roiChange = newROI - originalROI;
    const cashFlowChange = newCashFlow - originalCashFlow;
    const paybackChange = newPayback - originalPayback;

    // Đánh giá mức độ rủi ro - FIXED
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";

    if (newCashFlow < -2000000 || newROI < 0) {
      riskLevel = "critical";
    } else if (newCashFlow < 0 || newROI < 5) {
      riskLevel = "high";
    } else if (roiChange < -3 || cashFlowChange < -1000000) {
      riskLevel = "medium";
    }

    // Tạo key impacts - FIXED với proper formatting
    const keyImpacts: string[] = [];

    if (Math.abs(roiChange) > 1) {
      keyImpacts.push(
        `ROI ${roiChange > 0 ? "tăng" : "giảm"} ${formatSafePercent(
          Math.abs(roiChange)
        )}`
      );
    }

    if (Math.abs(cashFlowChange) > 500000) {
      const changeInMillions = Math.abs(cashFlowChange) / 1000000;
      keyImpacts.push(
        `Dòng tiền ${
          cashFlowChange > 0 ? "tăng" : "giảm"
        } ${changeInMillions.toFixed(1)}M/tháng`
      );
    }

    const interestChange = safeNumber(factors.interestRateChange, 0);
    if (interestChange !== 0) {
      keyImpacts.push(
        `Lãi suất ${interestChange > 0 ? "tăng" : "giảm"} ${formatSafePercent(
          Math.abs(interestChange)
        )}`
      );
    }

    const priceChange = safeNumber(factors.propertyPriceChange, 0);
    if (priceChange !== 0) {
      keyImpacts.push(
        `Giá BĐS ${priceChange > 0 ? "tăng" : "giảm"} ${formatSafePercent(
          Math.abs(priceChange)
        )}`
      );
    }

    // Ensure we have at least one impact
    if (keyImpacts.length === 0) {
      keyImpacts.push("Tác động nhỏ đến kết quả đầu tư");
    }

    return {
      roiChange,
      cashFlowChange,
      paybackChange,
      riskLevel,
      keyImpacts,
    };
  }

  /**
   * Tạo kịch bản tùy chỉnh - FIXED
   */
  static createCustomScenario(
    name: string,
    description: string,
    factors: Partial<EconomicFactors>
  ): EconomicScenario {
    const defaultFactors: EconomicFactors = {
      inflationRate: 4.5,
      interestRateChange: 0,
      propertyPriceChange: 5,
      rentalIncomeChange: 3,
      unemploymentRate: 5,
      gdpGrowthRate: 6,
      constructionCostChange: 5,
      vacancyRateChange: 0,
    };

    // FIXED: Ensure all factor values are safe numbers
    const safeFactors: EconomicFactors = {
      inflationRate: safeNumber(
        factors.inflationRate,
        defaultFactors.inflationRate
      ),
      interestRateChange: safeNumber(
        factors.interestRateChange,
        defaultFactors.interestRateChange
      ),
      propertyPriceChange: safeNumber(
        factors.propertyPriceChange,
        defaultFactors.propertyPriceChange
      ),
      rentalIncomeChange: safeNumber(
        factors.rentalIncomeChange,
        defaultFactors.rentalIncomeChange
      ),
      unemploymentRate: safeNumber(
        factors.unemploymentRate,
        defaultFactors.unemploymentRate
      ),
      gdpGrowthRate: safeNumber(
        factors.gdpGrowthRate,
        defaultFactors.gdpGrowthRate
      ),
      constructionCostChange: safeNumber(
        factors.constructionCostChange,
        defaultFactors.constructionCostChange
      ),
      vacancyRateChange: safeNumber(
        factors.vacancyRateChange,
        defaultFactors.vacancyRateChange
      ),
    };

    return {
      id: `custom_${Date.now()}`,
      name: name || "Kịch bản tùy chỉnh",
      description: description || "Kịch bản được tạo bởi người dùng",
      probability: 50,
      timeframe: "1-2 năm",
      factors: safeFactors,
      color: "text-gray-600",
      icon: "Settings",
    };
  }

  /**
   * Phân tích sensitivity - FIXED
   */
  static sensitivityAnalysis(baseInputs: RealEstateInputs): {
    factor: string;
    impact: number;
    description: string;
  }[] {
    try {
      const baseResult = calculateRealEstateInvestment(baseInputs);
      const baseROI = safeNumber(baseResult.roiHangNam, 0);
      const sensitivities: {
        factor: string;
        impact: number;
        description: string;
      }[] = [];

      // Test interest rate sensitivity - FIXED
      const interestTest = this.applyEconomicFactors(baseInputs, {
        ...this.getBaselineFactors(),
        interestRateChange: 1,
      });
      const interestResult = calculateRealEstateInvestment(interestTest);
      const interestImpact = Math.abs(
        safeNumber(interestResult.roiHangNam, 0) - baseROI
      );
      sensitivities.push({
        factor: "Lãi suất",
        impact: interestImpact,
        description: "Tác động của việc tăng lãi suất 1%",
      });

      // Test property price sensitivity - FIXED
      const priceTest = this.applyEconomicFactors(baseInputs, {
        ...this.getBaselineFactors(),
        propertyPriceChange: 10,
      });
      const priceResult = calculateRealEstateInvestment(priceTest);
      const priceImpact = Math.abs(
        safeNumber(priceResult.roiHangNam, 0) - baseROI
      );
      sensitivities.push({
        factor: "Giá BĐS",
        impact: priceImpact,
        description: "Tác động của việc tăng giá BĐS 10%",
      });

      // Test rental income sensitivity - FIXED
      const rentalTest = this.applyEconomicFactors(baseInputs, {
        ...this.getBaselineFactors(),
        rentalIncomeChange: 10,
      });
      const rentalResult = calculateRealEstateInvestment(rentalTest);
      const rentalImpact = Math.abs(
        safeNumber(rentalResult.roiHangNam, 0) - baseROI
      );
      sensitivities.push({
        factor: "Thu nhập thuê",
        impact: rentalImpact,
        description: "Tác động của việc tăng thu nhập thuê 10%",
      });

      return sensitivities.sort((a, b) => b.impact - a.impact);
    } catch (error) {
      console.error("Sensitivity analysis error:", error);
      return [
        {
          factor: "Lãi suất",
          impact: 0,
          description: "Không thể tính toán độ nhạy cảm",
        },
      ];
    }
  }

  private static getBaselineFactors(): EconomicFactors {
    return (
      ECONOMIC_SCENARIOS.find((s) => s.id === "baseline")?.factors || {
        inflationRate: 4.5,
        interestRateChange: 0,
        propertyPriceChange: 5,
        rentalIncomeChange: 3,
        unemploymentRate: 5,
        gdpGrowthRate: 6,
        constructionCostChange: 5,
        vacancyRateChange: 0,
      }
    );
  }
}

// ===== UTILITY FUNCTIONS =====
export function getScenarioIcon(iconName: string): string {
  const iconMap: { [key: string]: string } = {
    TrendingUp: "📈",
    TrendingDown: "📉",
    Target: "🎯",
    Shield: "🛡️",
    AlertTriangle: "⚠️",
    Rocket: "🚀",
    Settings: "⚙️",
  };
  return iconMap[iconName] || "📊";
}

export function getScenarioColor(colorClass: string): string {
  const colorMap: { [key: string]: string } = {
    "text-green-600": "bg-green-50 border-green-200",
    "text-blue-600": "bg-blue-50 border-blue-200",
    "text-yellow-600": "bg-yellow-50 border-yellow-200",
    "text-red-600": "bg-red-50 border-red-200",
    "text-purple-600": "bg-purple-50 border-purple-200",
    "text-orange-600": "bg-orange-50 border-orange-200",
    "text-gray-600": "bg-gray-50 border-gray-200",
  };
  return colorMap[colorClass] || "bg-gray-50 border-gray-200";
}
