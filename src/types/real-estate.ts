import { CalculationResultWithSale } from "./sale-scenario";

/**
 * Interface cho toàn bộ thông số đầu vào tính toán BĐS
 * Dựa trên tài liệu "Phân Tích Sâu Logic & Công Thức Tính Dòng Tiền Bất Động Sản"
 */
export interface RealEstateInputs {
  // === THÔNG TIN GIAO DỊCH ===
  /** Giá trị bất động sản (VND) - Bắt buộc */
  giaTriBDS: number;

  /** Vốn tự có ban đầu (VND) - Bắt buộc */
  vonTuCo: number;

  /** Chi phí trang bị bổ sung (nội thất, sửa chữa) (VND) */
  chiPhiTrangBi: number;

  /** 🆕 Ngày mua dự kiến/thực tế - for future scenario analysis */
  purchaseDate?: Date;

  // === VỐN BAN ĐẦU ===
  /** Tỷ lệ vay trên GiaTriBDS (%) - Mặc định 70% */
  tyLeVay: number;

  /** Tổng chi phí một lần khi mua: Thuế trước bạ (0.5%), phí công chứng, phí môi giới... (% của GiaTriBDS) */
  chiPhiMua: number;

  /** Phí bảo hiểm nhân thọ cho khoản vay, thường trả 1 lần hoặc trong vài năm đầu (% của SoTienVay) */
  baoHiemKhoanVay: number;

  // === VAY VỐN ===
  /** Lãi suất vay ưu đãi ban đầu (%/năm) - Mặc định 8% */
  laiSuatUuDai: number;

  /** Thời gian hưởng lãi suất ưu đãi (tháng) - Mặc định 12 tháng */
  thoiGianUuDai: number;

  /** Lãi suất thả nổi sau ưu đãi (%/năm) - Mặc định 12% */
  laiSuatThaNoi: number;

  /** Thời gian vay (năm) - Bắt buộc, mặc định 20 năm */
  thoiGianVay: number;

  // === VẬN HÀNH & CHI PHÍ ĐỊNH KỲ ===
  /** Doanh thu cho thuê hàng tháng (VND) */
  tienThueThang: number;

  /** Phí quản lý, vận hành hàng tháng (VND) */
  phiQuanLy: number;

  /** Phí bảo hiểm tài sản, cháy nổ hàng năm (% của GiaTriBDS) */
  baoHiemTaiSan: number;

  // === DỰ PHÒNG & CHI PHÍ KHÔNG THƯỜNG XUYÊN ===
  /** Tỷ lệ BĐS có khách thuê trong năm. Phần còn lại chính là chi phí cơ hội do bỏ trống (%) */
  tyLeLapDay: number;

  /** Chi phí bảo trì, sửa chữa nhỏ lặt vặt (% GiaTriBDS/năm) */
  phiBaoTri: number;

  /** Quỹ dự phòng cho các hạng mục lớn, tuổi thọ cao (thay mái, sửa hệ thống ống nước...) (% của GiaTriBDS/năm) */
  duPhongCapEx: number;

  // === THUẾ & CHI PHÍ THOÁI VỐN ===
  /** Thuế TNCN + GTGT từ việc cho thuê (nếu doanh thu > 100tr/năm) (%) */
  thueSuatChoThue: number;

  /** Tổng chi phí khi bán BĐS (% trên giá bán), bao gồm thuế TNCN (2%) và phí môi giới */
  chiPhiBan: number;

  // === TÀI CHÍNH CÁ NHÂN ===
  /** Tổng thu nhập hàng tháng (sau thuế) (VND) - Bắt buộc */
  thuNhapKhac: number;

  /** Tổng chi phí sinh hoạt hàng tháng (VND) - Bắt buộc */
  chiPhiSinhHoat: number;
}

/**
 * Giá trị mặc định cho các thông số theo tài liệu
 */
export const DEFAULT_VALUES: Partial<RealEstateInputs> = {
  // Giao dịch
  chiPhiTrangBi: 0,
  purchaseDate: undefined, // 🆕 Will be set dynamically

  // Vốn ban đầu
  tyLeVay: 70,
  chiPhiMua: 2, // 2% của GiaTriBDS
  baoHiemKhoanVay: 1.5, // 1.5% của SoTienVay

  // Vay vốn
  laiSuatUuDai: 8,
  thoiGianUuDai: 12,
  laiSuatThaNoi: 12,
  thoiGianVay: 20,

  // Vận hành
  tienThueThang: 0,
  phiQuanLy: 0,
  baoHiemTaiSan: 0.15, // 0.15% của GiaTriBDS

  // Dự phòng
  tyLeLapDay: 95,
  phiBaoTri: 1, // 1% của GiaTriBDS/năm
  duPhongCapEx: 1, // 1% của GiaTriBDS/năm

  // Thuế
  thueSuatChoThue: 10,
  chiPhiBan: 3,
};

/**
 * 🆕 Helper type for scenario creation
 */
export interface CreateFutureScenarioRequest {
  scenarioName: string;
  futureTimeMonths: number;
  economicScenarioId: string;
  originalInputs: RealEstateInputs;
  maintainEquityRatio: boolean;
  notes?: string;
}

/**
 * 🆕 Validation rules for future scenarios
 */
export const FUTURE_SCENARIO_VALIDATION = {
  futureTimeMonths: {
    min: 1, // Minimum 1 month
    max: 120, // Maximum 10 years
    recommended: { min: 6, max: 60 }, // 6 months to 5 years
  },
  scenarioName: {
    minLength: 3,
    maxLength: 100,
  },
  maxScenarios: 10, // Maximum number of future scenarios to compare
} as const;

/**
 * Kết quả tính toán từng bước
 */
export interface CalculationSteps {
  // Bước 1: Tổng vốn đầu tư ban đầu
  soTienVay: number;
  vonTuCo: number;
  tongVonBanDau: number;
  baoHiemKhoanVayThucTe: number;

  // Bước 2: Chi phí vận hành hàng tháng
  tienTraNHThang: number; // Động theo giai đoạn ưu đãi/thả nổi
  chiPhiBaoTriThang: number;
  duPhongCapExThang: number;
  baoHiemTaiSanThang: number;
  tongChiPhiVanHanh: number;

  // Bước 3: Dòng tiền ròng từ BĐS
  thuNhapThueHieuDung: number;
  thueChoThue_Thang: number;
  dongTienRongBDS: number;

  // Bước 4: Dòng tiền cuối cùng
  dongTienCuoiCung: number;
}

/**
 * Kết quả tính toán toàn diện
 */
/**
 * Enhanced Calculation Result with scenario metadata
 */
export interface CalculationResult {
  inputs: RealEstateInputs;
  steps: CalculationSteps;

  // Phân tích bổ sung
  roiHangNam: number; // Return on Investment hàng năm (%)
  paybackPeriod: number; // Thời gian hoàn vốn (năm)
  netPresentValue: number; // NPV

  // Cảnh báo và gợi ý
  warnings: string[];
  suggestions: string[];

  // Enhanced metadata for scenario comparison
  calculatedAt: string;
  calculationId?: string;
  scenarioName?: string;

  /** 🆕 Scenario type for comparison */
  scenarioType?: "buy_now" | "buy_future";

  /** 🆕 Economic scenario applied (if any) */
  economicScenarioApplied?: {
    id: string;
    name: string;
    description: string;
  };

  /** 🆕 Purchase timing info */
  purchaseTimingInfo?: {
    purchaseDate: Date;
    monthsFromNow?: number;
    projectionYears?: number;
  };

  rentalYield: number; // Thu nhập từ thuê (%)
}

/**
 * 🆕 Future Scenario Definition
 * Represents a "buy in future" scenario with projected inputs and results
 */
export interface FutureScenario {
  /** Unique identifier */
  id: string;

  /** User-friendly scenario name */
  scenarioName: string;

  /** Future purchase date */
  futureDate: Date;

  /** Number of months from current date */
  monthsFromNow: number;

  /** Economic scenario applied for projection */
  economicScenario: {
    id: string;
    name: string;
    description: string;
    probability: number;
  };

  /** Original inputs (current market conditions) */
  originalInputs: RealEstateInputs;

  /** Projected inputs for future purchase */
  projectedInputs: RealEstateInputs;

  /** Calculation result using projected inputs */
  result: CalculationResultWithSale;

  /** Projection summary */
  projectionSummary: {
    propertyValueChange: number; // %
    rentalIncomeChange: number; // %
    interestRateChange: number; // % points
    projectionWarnings: string[];
  };

  /** Creation metadata */
  createdAt: Date;
  updatedAt?: Date;

  /** User notes */
  notes?: string;
}

/**
 * 🆕 Buy Now vs Future Comparison
 * Comprehensive comparison between current purchase and future scenarios
 */
export interface BuyNowVsFutureComparison {
  /** "Buy Now" scenario result */
  buyNowScenario: {
    result: CalculationResultWithSale;
    inputs: RealEstateInputs;
  };

  /** Array of future scenarios to compare */
  futureScenarios: FutureScenario[];

  /** Comparison analysis */
  comparisonAnalysis: {
    /** Best scenario by ROI */
    bestByROI: {
      scenarioType: "buy_now" | "buy_future";
      scenarioId?: string;
      roi: number;
      advantage: string;
    };

    /** Best by total return */
    bestByTotalReturn: {
      scenarioType: "buy_now" | "buy_future";
      scenarioId?: string;
      totalReturn: number;
      advantage: string;
    };

    /** Best by cash flow */
    bestByCashFlow: {
      scenarioType: "buy_now" | "buy_future";
      scenarioId?: string;
      monthlyCashFlow: number;
      advantage: string;
    };

    /** Risk assessment */
    riskAssessment: {
      buyNowRisk: "low" | "medium" | "high";
      futureRisks: {
        scenarioId: string;
        riskLevel: "low" | "medium" | "high";
        riskFactors: string[];
      }[];
    };

    /** Overall recommendation */
    recommendation: {
      preferredStrategy: "buy_now" | "wait_and_buy_future" | "mixed_approach";
      reasoning: string[];
      keyFactors: string[];
      actionItems: string[];
    };
  };

  /** Analysis metadata */
  analysisDate: Date;
  marketContext: {
    marketType: "primary" | "secondary";
    investorType: "new_investor" | "existing_investor";
    currentMarketConditions: string;
  };
}

/**
 * Thông tin cho việc so sánh nhiều kịch bản
 */
export interface ScenarioComparison {
  scenarios: CalculationResult[];
  bestScenario: {
    byROI: CalculationResult;
    byCashFlow: CalculationResult;
    byPaybackPeriod: CalculationResult;
  };
}

/**
 * Cấu hình preset scenarios cho người mới
 */
export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  category: "chung-cu" | "nha-pho" | "dat-nen" | "biet-thu";
  location: "hcm" | "hanoi" | "danang" | "other";
  inputs: Partial<RealEstateInputs>;
}

/**
 * Thông tin tooltip giải thích cho từng trường
 */
export interface FieldTooltip {
  field: keyof RealEstateInputs;
  title: string;
  description: string;
  example?: string;
  warning?: string;
}

/**
 * Cấu hình validation cho form
 */
export interface ValidationRules {
  field: keyof RealEstateInputs;
  required: boolean;
  min?: number;
  max?: number;
  customValidation?: (
    value: number,
    allInputs: RealEstateInputs
  ) => string | null;
}

/**
 * Enum cho các loại cảnh báo
 */
export enum WarningType {
  HIGH_LOAN_RATIO = "high_loan_ratio",
  NEGATIVE_CASH_FLOW = "negative_cash_flow",
  LOW_RENTAL_YIELD = "low_rental_yield",
  HIGH_VACANCY_RATE = "high_vacancy_rate",
  INSUFFICIENT_INCOME = "insufficient_income",
}

/**
 * Enum cho các loại gợi ý
 */
export enum SuggestionType {
  REDUCE_LOAN_RATIO = "reduce_loan_ratio",
  INCREASE_RENTAL_INCOME = "increase_rental_income",
  REDUCE_EXPENSES = "reduce_expenses",
  CONSIDER_DIFFERENT_PROPERTY = "consider_different_property",
}

/**
 * Re-export enhanced types for compatibility
 */
export type {
  RealEstateInputsWithSaleAnalysis,
  CalculationResultWithSale,
} from "./sale-scenario";
