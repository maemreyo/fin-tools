/**
 * CASH FLOW MANAGEMENT - EVENT TIMELINE SYSTEM
 * Type definitions for 240-month timeline với event-driven architecture
 */

import { RealEstateInputs, CalculationResult } from './real-estate';

// ===== CORE EVENT TYPES =====

/**
 * Base interface cho tất cả timeline events
 */
export interface TimelineEventBase {
  id: string;
  month: number; // 1-240 (20 năm)
  type: TimelineEventType;
  name: string;
  description?: string;
  createdAt: Date;
  isActive: boolean;
}

/**
 * Enum cho các loại sự kiện theo thiết kế
 */
export enum TimelineEventType {
  // === BASIC EVENTS ===
  CASH_PAYMENT = 'CASH_PAYMENT', // Thanh Toán Vốn Tự Có
  LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT', // Giải Ngân Khoản Vay
  START_LOAN_PAYMENTS = 'START_LOAN_PAYMENTS', // Bắt Đầu Trả Lãi/Gốc
  PRINCIPAL_GRACE_PERIOD = 'PRINCIPAL_GRACE_PERIOD', // Thiết Lập Ân Hạn Gốc
  EARLY_PAYMENT = 'EARLY_PAYMENT', // Trả Nợ Trước Hạn
  INTEREST_RATE_CHANGE = 'INTEREST_RATE_CHANGE', // Thay Đổi Lãi Suất

  // === ADVANCED EVENTS ===
  PHASED_DISBURSEMENT = 'PHASED_DISBURSEMENT', // Giải Ngân Theo Đợt
  CASH_FLOW_UPDATE = 'CASH_FLOW_UPDATE', // Cập Nhật Dòng Tiền
  PAYMENT_FEE_SCHEDULE = 'PAYMENT_FEE_SCHEDULE', // Thiết Lập Phí Trả Nợ
}

// ===== SPECIFIC EVENT INTERFACES =====

/**
 * Thanh Toán Vốn Tự Có - Dòng tiền ra, chưa ảnh hưởng dư nợ
 */
export interface CashPaymentEvent extends TimelineEventBase {
  type: TimelineEventType.CASH_PAYMENT;
  amount: number; // VND
  purpose: 'down_payment' | 'renovation' | 'fees' | 'other';
  affectsCashFlow: boolean; // Có tính vào dòng tiền hàng tháng không
}

/**
 * Giải Ngân Khoản Vay - Dư nợ tăng, bắt đầu khoản vay
 */
export interface LoanDisbursementEvent extends TimelineEventBase {
  type: TimelineEventType.LOAN_DISBURSEMENT;
  amount: number; // VND
  loanBalance: number; // Tổng dư nợ sau giải ngân
  interestRate: number; // Lãi suất áp dụng (%)
  gracePeriodMonths?: number; // Số tháng ân hạn nếu có
}

/**
 * Bắt Đầu Trả Lãi/Gốc - Kích hoạt thanh toán hàng tháng
 */
export interface StartLoanPaymentsEvent extends TimelineEventBase {
  type: TimelineEventType.START_LOAN_PAYMENTS;
  monthlyPayment: number; // VND/tháng
  interestRate: number; // Lãi suất áp dụng (%)
  remainingMonths: number; // Số tháng còn lại
  paymentType: 'principal_and_interest' | 'interest_only';
}

/**
 * Thiết Lập Ân Hạn Gốc - Chỉ trả lãi trong period này
 */
export interface PrincipalGracePeriodEvent extends TimelineEventBase {
  type: TimelineEventType.PRINCIPAL_GRACE_PERIOD;
  durationMonths: number; // Thời gian ân hạn
  interestOnlyPayment: number; // VND/tháng chỉ trả lãi
  endMonth: number; // Tháng kết thúc ân hạn
}

/**
 * Trả Nợ Trước Hạn - Giảm dư nợ + tính phí phạt
 */
export interface EarlyPaymentEvent extends TimelineEventBase {
  type: TimelineEventType.EARLY_PAYMENT;
  amount: number; // VND
  penaltyFee: number; // Phí phạt (VND)
  penaltyRate: number; // Tỷ lệ phí phạt (%)
  newLoanBalance: number; // Dư nợ mới sau trả trước
  newMonthlyPayment: number; // Khoản trả hàng tháng mới
}

/**
 * Thay Đổi Lãi Suất - Update lãi suất từ thời điểm chỉ định
 */
export interface InterestRateChangeEvent extends TimelineEventBase {
  type: TimelineEventType.INTEREST_RATE_CHANGE;
  newRate: number; // Lãi suất mới (%)
  oldRate: number; // Lãi suất cũ (%)
  reason: 'promotion_end' | 'market_change' | 'bank_policy' | 'user_request';
  newMonthlyPayment: number; // Khoản trả hàng tháng mới
}

/**
 * Giải Ngân Theo Đợt - Cho nhà dự án, dư nợ tăng dần
 */
export interface PhasedDisbursementEvent extends TimelineEventBase {
  type: TimelineEventType.PHASED_DISBURSEMENT;
  amount: number; // VND cho đợt này
  totalDisbursed: number; // Tổng đã giải ngân đến thời điểm này
  totalCommitted: number; // Tổng cam kết vay
  constructionProgress: number; // % tiến độ xây dựng
  interestOnDisbursedAmount: boolean; // Lãi chỉ tính trên số đã giải ngân
}

/**
 * Cập Nhật Dòng Tiền - Tăng lương, tăng giá thuê
 */
export interface CashFlowUpdateEvent extends TimelineEventBase {
  type: TimelineEventType.CASH_FLOW_UPDATE;
  incomeChange: number; // Thay đổi thu nhập (VND/tháng)
  expenseChange: number; // Thay đổi chi phí (VND/tháng)
  rentalIncomeChange: number; // Thay đổi thu nhập thuê (VND/tháng)
  changeType: 'salary_increase' | 'rent_increase' | 'expense_increase' | 'other';
  changePercent: number; // % thay đổi
}

/**
 * Thiết Lập Phí Trả Nợ - Biểu phí phạt theo năm
 */
export interface PaymentFeeScheduleEvent extends TimelineEventBase {
  type: TimelineEventType.PAYMENT_FEE_SCHEDULE;
  feeSchedule: Array<{
    year: number;
    penaltyRate: number; // % phí phạt
    minFee: number; // Phí tối thiểu (VND)
    maxFee: number; // Phí tối đa (VND)
  }>;
  isActive: boolean;
}

/**
 * Union type cho tất cả timeline events
 */
export type TimelineEvent = 
  | CashPaymentEvent
  | LoanDisbursementEvent  
  | StartLoanPaymentsEvent
  | PrincipalGracePeriodEvent
  | EarlyPaymentEvent
  | InterestRateChangeEvent
  | PhasedDisbursementEvent
  | CashFlowUpdateEvent
  | PaymentFeeScheduleEvent;

// ===== MONTHLY BREAKDOWN TYPES =====

/**
 * Thông tin chi tiết cho từng tháng trong timeline 240 tháng
 */
export interface MonthlyBreakdown {
  month: number; // 1-240
  year: number; // Năm thứ mấy (1-20)
  
  // === LOAN DETAILS ===
  loanBalance: number; // Dư nợ đầu tháng
  principalPayment: number; // Trả gốc trong tháng
  interestPayment: number; // Trả lãi trong tháng  
  totalLoanPayment: number; // Tổng trả NH trong tháng
  remainingBalance: number; // Dư nợ cuối tháng
  interestRate: number; // Lãi suất áp dụng trong tháng
  
  // === CASH FLOW ===
  rentalIncome: number; // Thu nhập thuê
  operatingExpenses: number; // Chi phí vận hành
  netPropertyCashFlow: number; // Dòng tiền ròng từ BĐS
  
  // === PERSONAL FINANCE ===
  personalIncome: number; // Thu nhập cá nhân khác
  personalExpenses: number; // Chi phí sinh hoạt
  finalCashFlow: number; // Dòng tiền cuối cùng
  
  // === EVENTS ===
  events: TimelineEvent[]; // Các sự kiện xảy ra trong tháng
  hasEvents: boolean; // Có sự kiện không
  
  // === CUMULATIVE METRICS ===
  cumulativeInterestPaid: number; // Tổng lãi đã trả
  cumulativePrincipalPaid: number; // Tổng gốc đã trả
  cumulativeCashFlow: number; // Tổng dòng tiền tích lũy
  
  // === RATIOS & INDICATORS ===
  debtServiceRatio: number; // Tỷ lệ thanh toán nợ / thu nhập
  occupancyRate: number; // Tỷ lệ lấp đầy
  
  // === TAX & FEES ===
  taxPayable: number; // Thuế phải trả
  penalties: number; // Phí phạt (nếu có)
  otherFees: number; // Phí khác
}

// ===== TIMELINE SCENARIO TYPES =====

/**
 * Kịch bản Timeline - Extend từ CalculationResult hiện tại
 */
export interface TimelineScenario extends Omit<CalculationResult, 'calculatedAt'> {
  // === TIMELINE DATA ===
  timelineId: string;
  monthlyBreakdowns: MonthlyBreakdown[]; // 240 tháng
  events: TimelineEvent[];
  
  // === SUMMARY METRICS ===
  totalInterestPaid: number; // Tổng lãi trả trong 20 năm
  totalPrincipalPaid: number; // Tổng gốc trả
  totalCashFlowGenerated: number; // Tổng dòng tiền sinh ra
  payoffMonth: number; // Tháng trả hết nợ (nếu có early payments)
  
  // === SCENARIO METADATA ===
  scenarioName: string;
  scenarioDescription?: string;
  complexity: 'BASIC' | 'ADVANCED'; // Dựa trên số loại events
  createdAt: Date;
  lastModified: Date;
  
  // === VALIDATION ===
  hasErrors: boolean;
  errors: TimelineValidationError[];
  warnings: TimelineValidationWarning[];
}

/**
 * Lỗi validation cho timeline
 */
export interface TimelineValidationError {
  type: 'LOGIC_ERROR' | 'FINANCIAL_ERROR' | 'DATE_CONFLICT';
  message: string;
  affectedMonths: number[];
  affectedEvents: string[]; // Event IDs
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Cảnh báo validation cho timeline
 */
export interface TimelineValidationWarning {
  type: 'CASH_FLOW_NEGATIVE' | 'HIGH_DEBT_RATIO' | 'VACANCY_RISK';
  message: string;
  affectedMonths: number[];
  recommendation: string;
}

// ===== TIMELINE STATE MANAGEMENT =====

/**
 * State cho Timeline Editor/Manager
 */
export interface TimelineState {
  currentScenario: TimelineScenario | null;
  savedScenarios: TimelineScenario[];
  
  // === EDITING STATE ===
  isEditing: boolean;
  selectedMonth: number | null;
  selectedEvents: string[]; // Event IDs
  draggedEvent: TimelineEvent | null;
  
  // === UI STATE ===
  viewMode: 'BASIC' | 'EXPERT';
  zoomLevel: 'YEAR' | 'QUARTER' | 'MONTH';
  showEvents: TimelineEventType[];
  showOnlyProblems: boolean;
  
  // === CALCULATION STATE ===
  isCalculating: boolean;
  calculationProgress: number; // 0-100%
  lastCalculated: Date | null;
}

// ===== HELPER TYPES =====

/**
 * Configuration cho timeline simulation
 */
export interface TimelineSimulationConfig {
  totalMonths: number; // Default 240
  startDate: Date;
  
  // === CALCULATION SETTINGS ===
  includeInflation: boolean;
  inflationRate: number; // %/năm
  
  includePropertyAppreciation: boolean;
  appreciationRate: number; // %/năm
  
  // === ADVANCED SETTINGS ===
  compoundingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  roundToNearest: number; // VND (e.g., 1000)
  
  // === VALIDATION SETTINGS ===
  strictValidation: boolean;
  allowNegativeCashFlow: boolean;
  warnOnHighDebtRatio: boolean;
  maxDebtServiceRatio: number; // %
}

/**
 * Event creation templates để đơn giản hóa việc tạo events
 */
export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: 'BASIC' | 'ADVANCED';
  type: TimelineEventType;
  defaultValues: Partial<TimelineEvent>;
  validationRules: EventValidationRule[];
}

/**
 * Validation rules cho events
 */
export interface EventValidationRule {
  field: string;
  rule: 'REQUIRED' | 'MIN' | 'MAX' | 'POSITIVE' | 'CUSTOM';
  value?: number | string;
  customValidator?: (event: TimelineEvent, timeline: TimelineScenario) => boolean;
  errorMessage: string;
}

// ===== EXPORT =====
export default {
  TimelineEventType,
  type: {} as TimelineEvent,
  type: {} as TimelineScenario,
  type: {} as MonthlyBreakdown,
};