/**
 * INTEGRATION TYPES - Connecting Timeline System với Existing Codebase
 * Extensions & utilities for seamless integration
 */

import { 
  RealEstateInputs, 
  CalculationResult, 
  CalculationSteps,
  PresetScenario,
  ScenarioComparison 
} from './real-estate';
import { 
  TimelineScenario, 
  TimelineEvent, 
  MonthlyBreakdown,
  TimelineEventType 
} from './timeline';

// ===== EXTENDED INPUT TYPES =====

/**
 * Enhanced RealEstateInputs với timeline initialization data
 */
export interface TimelineEnabledInputs extends RealEstateInputs {
  // === TIMELINE CONFIGURATION ===
  enableTimeline: boolean;
  timelineStartDate: Date;
  
  // === INITIAL EVENTS ===
  initialCashPayment?: {
    month: number;
    amount: number;
    purpose: 'down_payment' | 'renovation' | 'fees';
  };
  
  loanDisbursementSchedule?: {
    month: number;
    amount: number;
    isPhased: boolean; // True cho nhà dự án
  }[];
  
  // === DEFAULT EVENT PREFERENCES ===
  defaultGracePeriod?: number; // Tháng ân hạn mặc định
  preferredEarlyPaymentSchedule?: 'NONE' | 'ANNUAL' | 'BIANNUAL' | 'CUSTOM';
  
  // === ADVANCED SETTINGS ===
  includeInflation: boolean;
  inflationRate: number;
  includePropertyAppreciation: boolean;
  appreciationRate: number;
}

// ===== ENHANCED CALCULATION RESULTS =====

/**
 * Enhanced CalculationResult với timeline preview
 */
export interface TimelineAwareResult extends CalculationResult {
  // === TIMELINE PREVIEW (first 12 months) ===
  monthlyPreview: MonthlyBreakdown[];
  
  // === TIMELINE QUICK METRICS ===
  timelineMetrics: {
    totalProjectedInterest: number; // 20 năm
    averageMonthlyPayment: number;
    cashFlowBreakeven: number; // Tháng thứ mấy dòng tiền dương
    payoffProjection: number; // Tháng trả hết nợ dự kiến
  };
  
  // === SUGGESTED EVENTS ===
  suggestedEvents: SuggestedEvent[];
  
  // === TIMELINE COMPATIBILITY ===
  canUpgradeToTimeline: boolean;
  upgradeComplexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  upgradeRequiredData: string[]; // Missing data fields
}

/**
 * AI-generated event suggestions
 */
export interface SuggestedEvent {
  type: TimelineEventType;
  suggestedMonth: number;
  reasoning: string;
  estimatedImpact: {
    cashFlowChange: number; // VND/tháng
    totalSavings: number; // VND over timeline
    riskReduction: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  difficulty: 'EASY' | 'MODERATE' | 'ADVANCED';
  templateData: Partial<TimelineEvent>;
}

// ===== PRESET SCENARIO EXTENSIONS =====

/**
 * Enhanced PresetScenario với timeline events
 */
export interface TimelinePresetScenario extends PresetScenario {
  // === TIMELINE PRESETS ===
  hasTimelineEvents: boolean;
  presetEvents: TimelineEventTemplate[];
  complexity: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  
  // === SCENARIO CATEGORIES ===
  timelineCategory: 
    | 'FIRST_TIME_BUYER'      // Người mua lần đầu
    | 'INVESTMENT_FOCUSED'    // Đầu tư sinh lời
    | 'UNDER_CONSTRUCTION'    // Nhà đang xây
    | 'EARLY_PAYOFF_STRATEGY' // Chiến lược trả nợ sớm
    | 'FLEXIBLE_CASHFLOW';    // Dòng tiền linh hoạt
  
  // === EDUCATIONAL CONTENT ===
  learningPath: {
    description: string;
    keyLessons: string[];
    estimatedTimeToMaster: number; // minutes
  };
}

/**
 * Template cho preset timeline events
 */
export interface TimelineEventTemplate {
  type: TimelineEventType;
  scheduledMonth: number;
  templateData: Partial<TimelineEvent>;
  isOptional: boolean;
  educationalNote: string;
}

// ===== SCENARIO COMPARISON EXTENSIONS =====

/**
 * Enhanced ScenarioComparison với timeline support
 */
export interface TimelineScenarioComparison extends ScenarioComparison {
  // === TIMELINE-SPECIFIC COMPARISONS ===
  timelineComparison: {
    totalInterestDifference: number;
    cashFlowAdvantage: number; // VND/tháng average
    payoffTimeDifference: number; // months
    riskLevelComparison: ComparisonRiskAnalysis;
  };
  
  // === VISUAL COMPARISON DATA ===
  chartData: {
    monthlyComparison: MonthlyComparisonData[];
    cumulativeComparison: CumulativeComparisonData[];
    eventTimeline: EventComparisonData[];
  };
  
  // === DECISION SUPPORT ===
  recommendation: {
    preferredScenario: string; // scenario ID
    reasoning: string[];
    confidenceLevel: number; // 0-100%
    alternativeConsiderations: string[];
  };
}

/**
 * Risk analysis for scenario comparison
 */
export interface ComparisonRiskAnalysis {
  overall: 'LOWER' | 'SIMILAR' | 'HIGHER';
  factors: {
    cashFlowVolatility: 'LOWER' | 'SIMILAR' | 'HIGHER';
    interestRateExposure: 'LOWER' | 'SIMILAR' | 'HIGHER';
    liquidityRequirement: 'LOWER' | 'SIMILAR' | 'HIGHER';
  };
  explanation: string;
}

/**
 * Monthly comparison data for charts
 */
export interface MonthlyComparisonData {
  month: number;
  scenarios: {
    [scenarioId: string]: {
      cashFlow: number;
      loanBalance: number;
      totalPaid: number;
    };
  };
}

/**
 * Cumulative comparison data
 */
export interface CumulativeComparisonData {
  month: number;
  scenarios: {
    [scenarioId: string]: {
      totalInterestPaid: number;
      totalCashFlowGenerated: number;
      netPosition: number; // Total cash flow - total interest paid
    };
  };
}

/**
 * Event comparison data for timeline visualization
 */
export interface EventComparisonData {
  month: number;
  scenarios: {
    [scenarioId: string]: {
      events: TimelineEvent[];
      hasSignificantEvent: boolean;
    };
  };
}

// ===== MIGRATION & UPGRADE UTILITIES =====

/**
 * Utility type for upgrading legacy calculations to timeline
 */
export interface LegacyToTimelineUpgrade {
  originalResult: CalculationResult;
  upgradeStrategy: 'SIMPLE_PROJECTION' | 'EVENT_BASED' | 'ADVANCED_MODELING';
  
  // === CONVERSION DATA ===
  generatedEvents: TimelineEvent[];
  monthlyProjection: MonthlyBreakdown[];
  
  // === UPGRADE METADATA ===
  dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  assumptions: string[];
  userVerificationNeeded: string[];
  
  // === RESULT ===
  upgradedScenario: TimelineScenario;
  conversionAccuracy: number; // 0-100%
}

// ===== FORM & UI INTEGRATION TYPES =====

/**
 * Form state for timeline-enabled property input
 */
export interface TimelinePropertyFormState {
  // === BASIC FORM DATA ===
  basicInputs: RealEstateInputs;
  
  // === TIMELINE ACTIVATION ===
  timelineMode: 'DISABLED' | 'BASIC' | 'ADVANCED';
  
  // === PROGRESSIVE DISCLOSURE STATE ===
  currentStep: 'PROPERTY' | 'LOAN' | 'TIMELINE' | 'REVIEW';
  completedSteps: string[];
  
  // === TIMELINE FORM DATA ===
  initialEvents: Partial<TimelineEvent>[];
  eventFormErrors: { [eventId: string]: string[] };
  
  // === VALIDATION STATE ===
  isValid: boolean;
  validationErrors: FormValidationError[];
  canProceedToTimeline: boolean;
}

/**
 * Form validation errors
 */
export interface FormValidationError {
  field: string;
  type: 'REQUIRED' | 'INVALID_VALUE' | 'BUSINESS_LOGIC' | 'TIMELINE_CONFLICT';
  message: string;
  severity: 'ERROR' | 'WARNING';
}

// ===== ADVANCED ANALYTICS TYPES =====

/**
 * Advanced analytics for timeline scenarios
 */
export interface TimelineAnalytics {
  // === PERFORMANCE METRICS ===
  performanceScore: number; // 0-100
  riskScore: number; // 0-100
  complexityScore: number; // 0-100
  
  // === CASH FLOW ANALYSIS ===
  cashFlowStability: {
    volatility: number; // Standard deviation
    trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING';
    seasonality: SeasonalityPattern[];
  };
  
  // === STRESS TEST RESULTS ===
  stressTests: {
    interestRateShock: StressTestResult;
    vacancyStress: StressTestResult;
    incomeReduction: StressTestResult;
    constructionDelay: StressTestResult; // For under-construction properties
  };
  
  // === OPTIMIZATION SUGGESTIONS ===
  optimizations: OptimizationSuggestion[];
}

/**
 * Seasonality pattern analysis
 */
export interface SeasonalityPattern {
  period: 'QUARTERLY' | 'ANNUAL';
  pattern: number[]; // Relative multipliers
  confidence: number; // 0-100%
  description: string;
}

/**
 * Stress test result
 */
export interface StressTestResult {
  testName: string;
  stressParameter: number; // e.g., +2% interest rate
  impact: {
    cashFlowChange: number; // VND/tháng
    totalCostChange: number; // VND over timeline
    monthsToBreakeven: number | null;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigation: string[];
}

/**
 * Optimization suggestion
 */
export interface OptimizationSuggestion {
  type: 'EVENT_ADDITION' | 'EVENT_MODIFICATION' | 'TIMING_ADJUSTMENT';
  description: string;
  estimatedBenefit: number; // VND savings
  implementationDifficulty: 'EASY' | 'MODERATE' | 'HARD';
  suggestedEvent?: Partial<TimelineEvent>;
  reasoning: string;
}

// ===== EXPORT =====
export type {
  TimelineEnabledInputs,
  TimelineAwareResult,
  TimelinePresetScenario,
  TimelineScenarioComparison,
  LegacyToTimelineUpgrade,
  TimelinePropertyFormState,
  TimelineAnalytics,
};