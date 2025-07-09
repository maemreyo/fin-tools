import { RealEstateInputs, CalculationResult } from '@/types/real-estate';
import { calculateRealEstateInvestment } from '@/lib/real-estate-calculator';

// ===== ECONOMIC SCENARIO TYPES =====
export interface EconomicFactors {
  inflationRate: number;           // Tỷ lệ lạm phát (%)
  interestRateChange: number;      // Thay đổi lãi suất (%)
  propertyPriceChange: number;     // Thay đổi giá nhà (%)
  rentalIncomeChange: number;      // Thay đổi thu nhập thuê (%)
  unemploymentRate: number;        // Tỷ lệ thất nghiệp (%)
  gdpGrowthRate: number;          // Tỷ lệ tăng trưởng GDP (%)
  constructionCostChange: number;  // Thay đổi chi phí xây dựng (%)
  vacancyRateChange: number;      // Thay đổi tỷ lệ trống (%)
}

export interface EconomicScenario {
  id: string;
  name: string;
  description: string;
  probability: number;            // Xác suất xảy ra (0-100)
  timeframe: string;             // Khung thời gian
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
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    keyImpacts: string[];
  };
}

// ===== PREDEFINED ECONOMIC SCENARIOS =====
export const ECONOMIC_SCENARIOS: EconomicScenario[] = [
  {
    id: 'optimistic',
    name: 'Kịch bản Lạc quan',
    description: 'Kinh tế phát triển mạnh, lạm phát thấp, bất động sản tăng giá',
    probability: 25,
    timeframe: '2-3 năm',
    factors: {
      inflationRate: 3.5,
      interestRateChange: -0.5,
      propertyPriceChange: 8,
      rentalIncomeChange: 6,
      unemploymentRate: 4,
      gdpGrowthRate: 7,
      constructionCostChange: 4,
      vacancyRateChange: -2
    },
    color: 'text-green-600',
    icon: 'TrendingUp'
  },
  {
    id: 'baseline',
    name: 'Kịch bản Cơ sở',
    description: 'Kinh tế ổn định, lạm phát kiểm soát, bất động sản tăng nhẹ',
    probability: 40,
    timeframe: '1-2 năm',
    factors: {
      inflationRate: 4.5,
      interestRateChange: 0,
      propertyPriceChange: 5,
      rentalIncomeChange: 3,
      unemploymentRate: 5,
      gdpGrowthRate: 6,
      constructionCostChange: 5,
      vacancyRateChange: 0
    },
    color: 'text-blue-600',
    icon: 'Target'
  },
  {
    id: 'conservative',
    name: 'Kịch bản Thận trọng',
    description: 'Kinh tế chậm lại, lạm phát tăng, bất động sản tăng chậm',
    probability: 25,
    timeframe: '2-4 năm',
    factors: {
      inflationRate: 6,
      interestRateChange: 1,
      propertyPriceChange: 2,
      rentalIncomeChange: 1,
      unemploymentRate: 6,
      gdpGrowthRate: 4,
      constructionCostChange: 7,
      vacancyRateChange: 3
    },
    color: 'text-yellow-600',
    icon: 'Shield'
  },
  {
    id: 'pessimistic',
    name: 'Kịch bản Bi quan',
    description: 'Suy thoái kinh tế, lạm phát cao, bất động sản giảm giá',
    probability: 10,
    timeframe: '1-3 năm',
    factors: {
      inflationRate: 8,
      interestRateChange: 2,
      propertyPriceChange: -3,
      rentalIncomeChange: -2,
      unemploymentRate: 8,
      gdpGrowthRate: 2,
      constructionCostChange: 10,
      vacancyRateChange: 5
    },
    color: 'text-red-600',
    icon: 'TrendingDown'
  },
  {
    id: 'interest_spike',
    name: 'Lãi suất Tăng đột biến',
    description: 'Ngân hàng trung ương tăng mạnh lãi suất để kiểm soát lạm phát',
    probability: 15,
    timeframe: '6-12 tháng',
    factors: {
      inflationRate: 7,
      interestRateChange: 3,
      propertyPriceChange: -5,
      rentalIncomeChange: 0,
      unemploymentRate: 7,
      gdpGrowthRate: 3,
      constructionCostChange: 8,
      vacancyRateChange: 4
    },
    color: 'text-purple-600',
    icon: 'AlertTriangle'
  },
  {
    id: 'property_boom',
    name: 'Bùng nổ Bất động sản',
    description: 'Giá bất động sản tăng mạnh do khan hiếm nguồn cung',
    probability: 20,
    timeframe: '1-2 năm',
    factors: {
      inflationRate: 5,
      interestRateChange: 0.5,
      propertyPriceChange: 15,
      rentalIncomeChange: 10,
      unemploymentRate: 5,
      gdpGrowthRate: 6.5,
      constructionCostChange: 12,
      vacancyRateChange: -3
    },
    color: 'text-orange-600',
    icon: 'Rocket'
  }
];

// ===== MAIN GENERATOR CLASS =====
export class EconomicScenarioGenerator {
  /**
   * Tạo các kịch bản kinh tế từ inputs gốc
   */
  static generateScenarios(
    baseInputs: RealEstateInputs,
    selectedScenarios?: string[]
  ): GeneratedScenario[] {
    const scenarios = selectedScenarios 
      ? ECONOMIC_SCENARIOS.filter(s => selectedScenarios.includes(s.id))
      : ECONOMIC_SCENARIOS;

    return scenarios.map(scenario => {
      const adjustedInputs = this.applyEconomicFactors(baseInputs, scenario.factors);
      const result = calculateRealEstateInvestment(adjustedInputs);
      const originalResult = calculateRealEstateInvestment(baseInputs);
      
      return {
        scenario,
        originalInputs: baseInputs,
        adjustedInputs,
        result,
        impactAnalysis: this.analyzeImpact(originalResult, result, scenario.factors)
      };
    });
  }

  /**
   * Áp dụng các yếu tố kinh tế vào inputs
   */
  private static applyEconomicFactors(
    baseInputs: RealEstateInputs,
    factors: EconomicFactors
  ): RealEstateInputs {
    const adjustedInputs = { ...baseInputs };

    // Điều chỉnh lãi suất
    adjustedInputs.laiSuatUuDai = Math.max(
      0.1,
      (baseInputs.laiSuatUuDai || 8) + factors.interestRateChange
    );
    adjustedInputs.laiSuatThaNoi = Math.max(
      0.1,
      (baseInputs.laiSuatThaNoi || 10) + factors.interestRateChange
    );

    // Điều chỉnh giá bất động sản
    adjustedInputs.giaTriBDS = Math.max(
      1000000,
      (baseInputs.giaTriBDS || 0) * (1 + factors.propertyPriceChange / 100)
    );

    // Điều chỉnh thu nhập thuê
    adjustedInputs.tienThueThang = Math.max(
      0,
      (baseInputs.tienThueThang || 0) * (1 + factors.rentalIncomeChange / 100)
    );

    // Điều chỉnh tỷ lệ lấp đầy
    adjustedInputs.tyLeLapDay = Math.max(
      50,
      Math.min(100, (baseInputs.tyLeLapDay || 95) + factors.vacancyRateChange)
    );

    // Điều chỉnh chi phí xây dựng (chi phí trang bị)
    adjustedInputs.chiPhiTrangBi = Math.max(
      0,
      (baseInputs.chiPhiTrangBi || 0) * (1 + factors.constructionCostChange / 100)
    );

    // Điều chỉnh chi phí bảo trì theo lạm phát
    adjustedInputs.phiBaoTri = Math.max(
      0.1,
      (baseInputs.phiBaoTri || 1) * (1 + factors.inflationRate / 100)
    );

    // Điều chỉnh chi phí quản lý theo lạm phát
    adjustedInputs.phiQuanLy = Math.max(
      0,
      (baseInputs.phiQuanLy || 0) * (1 + factors.inflationRate / 100)
    );

    return adjustedInputs;
  }

  /**
   * Phân tích tác động của kịch bản
   */
  private static analyzeImpact(
    originalResult: CalculationResult,
    newResult: CalculationResult,
    factors: EconomicFactors
  ): GeneratedScenario['impactAnalysis'] {
    const roiChange = newResult.roiHangNam - originalResult.roiHangNam;
    const cashFlowChange = newResult.steps.dongTienRongBDS - originalResult.steps.dongTienRongBDS;
    const paybackChange = newResult.paybackPeriod - originalResult.paybackPeriod;

    // Đánh giá mức độ rủi ro
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (newResult.steps.dongTienRongBDS < -2000000 || newResult.roiHangNam < 0) {
      riskLevel = 'critical';
    } else if (newResult.steps.dongTienRongBDS < 0 || newResult.roiHangNam < 5) {
      riskLevel = 'high';
    } else if (roiChange < -3 || cashFlowChange < -1000000) {
      riskLevel = 'medium';
    }

    // Tạo key impacts
    const keyImpacts: string[] = [];
    
    if (Math.abs(roiChange) > 1) {
      keyImpacts.push(
        `ROI ${roiChange > 0 ? 'tăng' : 'giảm'} ${Math.abs(roiChange).toFixed(1)}%`
      );
    }
    
    if (Math.abs(cashFlowChange) > 500000) {
      keyImpacts.push(
        `Dòng tiền ${cashFlowChange > 0 ? 'tăng' : 'giảm'} ${Math.abs(cashFlowChange / 1000000).toFixed(1)}M/tháng`
      );
    }
    
    if (factors.interestRateChange !== 0) {
      keyImpacts.push(
        `Lãi suất ${factors.interestRateChange > 0 ? 'tăng' : 'giảm'} ${Math.abs(factors.interestRateChange)}%`
      );
    }
    
    if (factors.propertyPriceChange !== 0) {
      keyImpacts.push(
        `Giá BĐS ${factors.propertyPriceChange > 0 ? 'tăng' : 'giảm'} ${Math.abs(factors.propertyPriceChange)}%`
      );
    }

    return {
      roiChange,
      cashFlowChange,
      paybackChange,
      riskLevel,
      keyImpacts
    };
  }

  /**
   * Tạo kịch bản tùy chỉnh
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
      vacancyRateChange: 0
    };

    return {
      id: `custom_${Date.now()}`,
      name,
      description,
      probability: 50,
      timeframe: '1-2 năm',
      factors: { ...defaultFactors, ...factors },
      color: 'text-gray-600',
      icon: 'Settings'
    };
  }

  /**
   * Phân tích sensitivity - yếu tố nào ảnh hưởng nhiều nhất
   */
  static sensitivityAnalysis(baseInputs: RealEstateInputs): {
    factor: string;
    impact: number;
    description: string;
  }[] {
    const baseResult = calculateRealEstateInvestment(baseInputs);
    const sensitivities: { factor: string; impact: number; description: string }[] = [];

    // Test interest rate sensitivity
    const interestTest = this.applyEconomicFactors(baseInputs, {
      ...this.getBaselineFactors(),
      interestRateChange: 1
    });
    const interestResult = calculateRealEstateInvestment(interestTest);
    sensitivities.push({
      factor: 'Lãi suất',
      impact: Math.abs(interestResult.roiHangNam - baseResult.roiHangNam),
      description: 'Tác động của việc tăng lãi suất 1%'
    });

    // Test property price sensitivity
    const priceTest = this.applyEconomicFactors(baseInputs, {
      ...this.getBaselineFactors(),
      propertyPriceChange: 10
    });
    const priceResult = calculateRealEstateInvestment(priceTest);
    sensitivities.push({
      factor: 'Giá BĐS',
      impact: Math.abs(priceResult.roiHangNam - baseResult.roiHangNam),
      description: 'Tác động của việc tăng giá BĐS 10%'
    });

    // Test rental income sensitivity
    const rentalTest = this.applyEconomicFactors(baseInputs, {
      ...this.getBaselineFactors(),
      rentalIncomeChange: 10
    });
    const rentalResult = calculateRealEstateInvestment(rentalTest);
    sensitivities.push({
      factor: 'Thu nhập thuê',
      impact: Math.abs(rentalResult.roiHangNam - baseResult.roiHangNam),
      description: 'Tác động của việc tăng thu nhập thuê 10%'
    });

    return sensitivities.sort((a, b) => b.impact - a.impact);
  }

  private static getBaselineFactors(): EconomicFactors {
    return ECONOMIC_SCENARIOS.find(s => s.id === 'baseline')?.factors || {
      inflationRate: 4.5,
      interestRateChange: 0,
      propertyPriceChange: 5,
      rentalIncomeChange: 3,
      unemploymentRate: 5,
      gdpGrowthRate: 6,
      constructionCostChange: 5,
      vacancyRateChange: 0
    };
  }
}

// ===== UTILITY FUNCTIONS =====
export function getScenarioIcon(iconName: string): string {
  const iconMap: { [key: string]: string } = {
    TrendingUp: '📈',
    TrendingDown: '📉',
    Target: '🎯',
    Shield: '🛡️',
    AlertTriangle: '⚠️',
    Rocket: '🚀',
    Settings: '⚙️'
  };
  return iconMap[iconName] || '📊';
}

export function getScenarioColor(colorClass: string): string {
  const colorMap: { [key: string]: string } = {
    'text-green-600': 'bg-green-50 border-green-200',
    'text-blue-600': 'bg-blue-50 border-blue-200',
    'text-yellow-600': 'bg-yellow-50 border-yellow-200',
    'text-red-600': 'bg-red-50 border-red-200',
    'text-purple-600': 'bg-purple-50 border-purple-200',
    'text-orange-600': 'bg-orange-50 border-orange-200',
    'text-gray-600': 'bg-gray-50 border-gray-200'
  };
  return colorMap[colorClass] || 'bg-gray-50 border-gray-200';
}