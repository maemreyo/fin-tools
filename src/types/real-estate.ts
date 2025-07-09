/**
 * Interface cho toàn bộ thông số đầu vào tính toán BĐS
 * Dựa trên tài liệu "Phân Tích Sâu Logic & Công Thức Tính Dòng Tiền Bất Động Sản"
 */
export interface RealEstateInputs {
  // === GIAO DỊCH ===
  /** Giá mua bán chính thức của BĐS (VND) - Bắt buộc */
  giaTriBDS: number;

  /** Số tiền góp vốn tự có (VND) */
  vonTuCo: number;

  /** Chi phí nội thất, sửa chữa ban đầu để có thể ở hoặc cho thuê (VND) */
  chiPhiTrangBi: number;

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
 * Kết quả tính toán từng bước
 */
export interface CalculationSteps {
  // Bước 1: Tổng vốn đầu tư ban đầu
  soTienVay: number;
  vonTuCo: number;
  tongVonBanDau: number;

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

  // Metadata
  calculatedAt: Date;
  scenarioName?: string;
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
