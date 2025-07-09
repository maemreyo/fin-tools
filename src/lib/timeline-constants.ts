/**
 * TIMELINE CONSTANTS & UTILITIES
 * Constants, defaults, and utility functions for Event Timeline System
 */

import { 
  TimelineEventType, 
  EventTemplate,
  TimelineSimulationConfig,
  EventValidationRule 
} from '@/types/timeline';

// ===== TIMELINE CONSTANTS =====

/**
 * Timeline configuration defaults
 */
export const TIMELINE_CONFIG = {
  TOTAL_MONTHS: 240, // 20 years
  MAX_YEARS: 20,
  MONTHS_PER_YEAR: 12,
  
  // === UI CONSTANTS ===
  MIN_ZOOM_MONTHS: 12, // Minimum months to show in zoom
  MAX_ZOOM_MONTHS: 240, // Maximum months to show in zoom
  DEFAULT_ZOOM_MONTHS: 60, // Default 5 years view
  
  // === CALCULATION CONSTANTS ===
  CALCULATION_PRECISION: 2, // Decimal places
  MIN_CASH_FLOW: -1000000000, // -1 tỷ VND minimum
  MAX_LOAN_AMOUNT: 50000000000, // 50 tỷ VND maximum
  
  // === VALIDATION CONSTANTS ===
  MIN_EVENT_SPACING: 1, // Minimum months between conflicting events
  MAX_EVENTS_PER_MONTH: 5, // Maximum events per month
  MAX_TOTAL_EVENTS: 50, // Maximum total events in timeline
} as const;

/**
 * Event type metadata và configurations
 */
export const EVENT_TYPE_CONFIG = {
  [TimelineEventType.CASH_PAYMENT]: {
    icon: '💰',
    color: '#10B981', // Green
    category: 'BASIC',
    priority: 1,
    description: 'Thanh toán bằng vốn tự có',
    tooltip: 'Dòng tiền ra, chưa ảnh hưởng đến dư nợ vay',
    allowMultiple: true,
    conflictsWith: [],
    requiredFields: ['amount', 'purpose'],
    defaultDuration: 1, // months
  },
  
  [TimelineEventType.LOAN_DISBURSEMENT]: {
    icon: '🏦',
    color: '#3B82F6', // Blue
    category: 'BASIC',
    priority: 2,
    description: 'Giải ngân khoản vay',
    tooltip: 'Dư nợ tăng, bắt đầu tính lãi',
    allowMultiple: true,
    conflictsWith: [],
    requiredFields: ['amount', 'interestRate'],
    defaultDuration: 1,
  },
  
  [TimelineEventType.START_LOAN_PAYMENTS]: {
    icon: '📅',
    color: '#8B5CF6', // Purple
    category: 'BASIC',
    priority: 3,
    description: 'Bắt đầu trả nợ định kỳ',
    tooltip: 'Kích hoạt thanh toán gốc + lãi hàng tháng',
    allowMultiple: false,
    conflictsWith: [TimelineEventType.PRINCIPAL_GRACE_PERIOD],
    requiredFields: ['monthlyPayment', 'interestRate'],
    defaultDuration: 1,
  },
  
  [TimelineEventType.PRINCIPAL_GRACE_PERIOD]: {
    icon: '⏸️',
    color: '#F59E0B', // Amber
    category: 'BASIC',
    priority: 4,
    description: 'Thiết lập ân hạn gốc',
    tooltip: 'Chỉ trả lãi, hoãn trả gốc trong thời gian này',
    allowMultiple: true,
    conflictsWith: [TimelineEventType.START_LOAN_PAYMENTS],
    requiredFields: ['durationMonths', 'interestOnlyPayment'],
    defaultDuration: 12,
  },
  
  [TimelineEventType.EARLY_PAYMENT]: {
    icon: '⚡',
    color: '#EF4444', // Red
    category: 'BASIC',
    priority: 5,
    description: 'Trả nợ trước hạn',
    tooltip: 'Giảm dư nợ gốc, có thể có phí phạt',
    allowMultiple: true,
    conflictsWith: [],
    requiredFields: ['amount'],
    defaultDuration: 1,
  },
  
  [TimelineEventType.INTEREST_RATE_CHANGE]: {
    icon: '📈',
    color: '#F97316', // Orange
    category: 'BASIC',
    priority: 6,
    description: 'Thay đổi lãi suất',
    tooltip: 'Cập nhật lãi suất vay từ thời điểm này',
    allowMultiple: true,
    conflictsWith: [],
    requiredFields: ['newRate', 'reason'],
    defaultDuration: 1,
  },
  
  [TimelineEventType.PHASED_DISBURSEMENT]: {
    icon: '🏗️',
    color: '#6366F1', // Indigo
    category: 'ADVANCED',
    priority: 7,
    description: 'Giải ngân theo đợt',
    tooltip: 'Cho nhà dự án, giải ngân theo tiến độ xây dựng',
    allowMultiple: true,
    conflictsWith: [],
    requiredFields: ['amount', 'constructionProgress'],
    defaultDuration: 1,
  },
  
  [TimelineEventType.CASH_FLOW_UPDATE]: {
    icon: '💹',
    color: '#14B8A6', // Teal
    category: 'ADVANCED',
    priority: 8,
    description: 'Cập nhật dòng tiền',
    tooltip: 'Thay đổi thu nhập thuê, lương, hoặc chi phí',
    allowMultiple: true,
    conflictsWith: [],
    requiredFields: ['changeType'],
    defaultDuration: 1,
  },
  
  [TimelineEventType.PAYMENT_FEE_SCHEDULE]: {
    icon: '⚖️',
    color: '#84CC16', // Lime
    category: 'ADVANCED',
    priority: 9,
    description: 'Thiết lập biểu phí',
    tooltip: 'Cấu hình phí phạt trả nợ trước hạn theo thời gian',
    allowMultiple: false,
    conflictsWith: [],
    requiredFields: ['feeSchedule'],
    defaultDuration: 240, // Applies for entire timeline
  },
} as const;

// ===== EVENT TEMPLATES =====

/**
 * Pre-defined event templates for quick creation
 */
export const EVENT_TEMPLATES: EventTemplate[] = [
  // === BASIC TEMPLATES ===
  {
    id: 'down-payment-template',
    name: 'Thanh toán vốn tự có',
    description: 'Thanh toán số tiền vốn tự có cho mua nhà',
    category: 'BASIC',
    type: TimelineEventType.CASH_PAYMENT,
    defaultValues: {
      type: TimelineEventType.CASH_PAYMENT,
      month: 1,
      amount: 1000000000, // 1 tỷ
      purpose: 'down_payment',
      affectsCashFlow: false,
    } as any,
    validationRules: [
      {
        field: 'amount',
        rule: 'POSITIVE',
        errorMessage: 'Số tiền phải lớn hơn 0'
      },
      {
        field: 'month',
        rule: 'MIN',
        value: 1,
        errorMessage: 'Tháng phải từ 1 trở lên'
      }
    ],
  },
  
  {
    id: 'loan-disbursement-template',
    name: 'Giải ngân khoản vay',
    description: 'Ngân hàng giải ngân tiền vay',
    category: 'BASIC',
    type: TimelineEventType.LOAN_DISBURSEMENT,
    defaultValues: {
      type: TimelineEventType.LOAN_DISBURSEMENT,
      month: 1,
      amount: 2000000000, // 2 tỷ
      interestRate: 8.0,
      gracePeriodMonths: 0,
    } as any,
    validationRules: [
      {
        field: 'amount',
        rule: 'POSITIVE',
        errorMessage: 'Số tiền vay phải lớn hơn 0'
      },
      {
        field: 'interestRate',
        rule: 'POSITIVE',
        errorMessage: 'Lãi suất phải lớn hơn 0'
      }
    ],
  },
  
  {
    id: 'early-payment-template',
    name: 'Trả nợ trước hạn',
    description: 'Trả một phần hoặc toàn bộ nợ gốc trước hạn',
    category: 'BASIC',
    type: TimelineEventType.EARLY_PAYMENT,
    defaultValues: {
      type: TimelineEventType.EARLY_PAYMENT,
      month: 36, // Sau 3 năm
      amount: 500000000, // 500 triệu
      penaltyRate: 1.0, // 1%
    } as any,
    validationRules: [
      {
        field: 'amount',
        rule: 'POSITIVE',
        errorMessage: 'Số tiền trả trước phải lớn hơn 0'
      },
      {
        field: 'month',
        rule: 'MIN',
        value: 1,
        errorMessage: 'Không thể trả trước khi có nợ'
      }
    ],
  },
  
  // === ADVANCED TEMPLATES ===
  {
    id: 'phased-disbursement-template',
    name: 'Giải ngân theo đợt',
    description: 'Giải ngân theo tiến độ xây dựng (nhà dự án)',
    category: 'ADVANCED',
    type: TimelineEventType.PHASED_DISBURSEMENT,
    defaultValues: {
      type: TimelineEventType.PHASED_DISBURSEMENT,
      month: 6,
      amount: 500000000,
      constructionProgress: 25, // 25%
      interestOnDisbursedAmount: true,
    } as any,
    validationRules: [
      {
        field: 'constructionProgress',
        rule: 'MIN',
        value: 0,
        errorMessage: 'Tiến độ không thể âm'
      },
      {
        field: 'constructionProgress',
        rule: 'MAX', 
        value: 100,
        errorMessage: 'Tiến độ không thể vượt 100%'
      }
    ],
  },
  
  {
    id: 'salary-increase-template',
    name: 'Tăng lương',
    description: 'Cập nhật thu nhập cá nhân tăng',
    category: 'ADVANCED',
    type: TimelineEventType.CASH_FLOW_UPDATE,
    defaultValues: {
      type: TimelineEventType.CASH_FLOW_UPDATE,
      month: 12, // Sau 1 năm
      incomeChange: 5000000, // +5 triệu/tháng
      changeType: 'salary_increase',
      changePercent: 20, // +20%
    } as any,
    validationRules: [
      {
        field: 'changePercent',
        rule: 'MIN',
        value: -50,
        errorMessage: 'Thay đổi không thể giảm quá 50%'
      }
    ],
  },
  
  {
    id: 'rent-increase-template',
    name: 'Tăng giá thuê',
    description: 'Cập nhật thu nhập từ cho thuê',
    category: 'ADVANCED',
    type: TimelineEventType.CASH_FLOW_UPDATE,
    defaultValues: {
      type: TimelineEventType.CASH_FLOW_UPDATE,
      month: 24, // Sau 2 năm
      rentalIncomeChange: 3000000, // +3 triệu/tháng
      changeType: 'rent_increase',
      changePercent: 15, // +15%
    } as any,
    validationRules: [],
  },
];

// ===== VALIDATION RULES =====

/**
 * Global validation rules cho timeline events
 */
export const GLOBAL_VALIDATION_RULES = {
  // === BUSINESS LOGIC RULES ===
  LOAN_BEFORE_PAYMENT: {
    description: 'Phải có giải ngân trước khi trả nợ',
    validator: (events: any[]) => {
      const disbursements = events.filter(e => e.type === TimelineEventType.LOAN_DISBURSEMENT);
      const payments = events.filter(e => e.type === TimelineEventType.EARLY_PAYMENT);
      
      return payments.every(payment => 
        disbursements.some(disbursement => disbursement.month <= payment.month)
      );
    },
    errorMessage: 'Không thể trả nợ trước khi có khoản vay'
  },
  
  GRACE_PERIOD_LOGIC: {
    description: 'Ân hạn gốc phải có logic hợp lý',
    validator: (events: any[]) => {
      const gracePeriods = events.filter(e => e.type === TimelineEventType.PRINCIPAL_GRACE_PERIOD);
      const startPayments = events.filter(e => e.type === TimelineEventType.START_LOAN_PAYMENTS);
      
      return gracePeriods.every(grace => 
        !startPayments.some(start => 
          start.month >= grace.month && 
          start.month < grace.month + grace.durationMonths
        )
      );
    },
    errorMessage: 'Ân hạn gốc không thể chồng lấp với việc bắt đầu trả nợ'
  },
  
  // === FINANCIAL LOGIC RULES ===
  REALISTIC_AMOUNTS: {
    description: 'Số tiền phải trong phạm vi hợp lý',
    validator: (events: any[]) => {
      return events.every(event => {
        if (event.amount && event.amount > TIMELINE_CONFIG.MAX_LOAN_AMOUNT) {
          return false;
        }
        return true;
      });
    },
    errorMessage: 'Số tiền vượt quá giới hạn cho phép'
  },
} as const;

// ===== DEFAULT CONFIGURATIONS =====

/**
 * Default timeline simulation configuration
 */
export const DEFAULT_TIMELINE_CONFIG: TimelineSimulationConfig = {
  totalMonths: TIMELINE_CONFIG.TOTAL_MONTHS,
  startDate: new Date(),
  
  // === CALCULATION SETTINGS ===
  includeInflation: false,
  inflationRate: 3.0, // 3%/năm
  
  includePropertyAppreciation: false,
  appreciationRate: 5.0, // 5%/năm
  
  // === ADVANCED SETTINGS ===
  compoundingFrequency: 'MONTHLY',
  roundToNearest: 1000, // 1,000 VND
  
  // === VALIDATION SETTINGS ===
  strictValidation: true,
  allowNegativeCashFlow: false,
  warnOnHighDebtRatio: true,
  maxDebtServiceRatio: 50, // 50%
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get event type configuration
 */
export function getEventTypeConfig(type: TimelineEventType) {
  return EVENT_TYPE_CONFIG[type];
}

/**
 * Get event template by ID
 */
export function getEventTemplate(templateId: string) {
  return EVENT_TEMPLATES.find(template => template.id === templateId);
}

/**
 * Get event templates by category
 */
export function getEventTemplatesByCategory(category: 'BASIC' | 'ADVANCED') {
  return EVENT_TEMPLATES.filter(template => template.category === category);
}

/**
 * Check if month is valid for timeline
 */
export function isValidTimelineMonth(month: number): boolean {
  return month >= 1 && month <= TIMELINE_CONFIG.TOTAL_MONTHS;
}

/**
 * Convert month to year and month display
 */
export function monthToYearMonth(month: number): { year: number; monthInYear: number } {
  const year = Math.ceil(month / TIMELINE_CONFIG.MONTHS_PER_YEAR);
  const monthInYear = ((month - 1) % TIMELINE_CONFIG.MONTHS_PER_YEAR) + 1;
  return { year, monthInYear };
}

/**
 * Convert year and month to timeline month
 */
export function yearMonthToTimelineMonth(year: number, monthInYear: number): number {
  return (year - 1) * TIMELINE_CONFIG.MONTHS_PER_YEAR + monthInYear;
}

/**
 * Get month display name
 */
export function getMonthDisplayName(month: number): string {
  const { year, monthInYear } = monthToYearMonth(month);
  const monthNames = [
    'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
    'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
  ];
  return `${monthNames[monthInYear - 1]} / Năm ${year}`;
}

// ===== EXPORT =====
export {
  TIMELINE_CONFIG,
  EVENT_TYPE_CONFIG,
  EVENT_TEMPLATES,
  GLOBAL_VALIDATION_RULES,
  DEFAULT_TIMELINE_CONFIG,
};