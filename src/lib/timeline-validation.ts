/**
 * TIMELINE VALIDATION SYSTEM
 * Comprehensive validation for timeline events, conflicts, and business logic
 */

import {
  TimelineEvent,
  TimelineEventType,
  TimelineValidationError,
  TimelineValidationWarning,
  TimelineScenario
} from '@/types/timeline';
import { RealEstateInputs } from '@/types/real-estate';
import { TIMELINE_CONFIG, GLOBAL_VALIDATION_RULES } from './timeline-constants';

// ===== VALIDATION RESULT TYPES =====

export interface ValidationResult {
  isValid: boolean;
  errors: TimelineValidationError[];
  warnings: TimelineValidationWarning[];
  suggestions: ValidationSuggestion[];
  score: ValidationScore;
}

export interface ValidationSuggestion {
  type: 'OPTIMIZATION' | 'RISK_REDUCTION' | 'BEST_PRACTICE' | 'AUTOMATION';
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedBenefit?: number; // VND savings
  actionRequired: string;
  autoFixAvailable: boolean;
}

export interface ValidationScore {
  overall: number; // 0-100
  breakdown: {
    logicalConsistency: number;
    financialRealism: number;
    riskManagement: number;
    optimization: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ===== TIMELINE VALIDATOR CLASS =====

export class TimelineValidator {
  private errors: TimelineValidationError[] = [];
  private warnings: TimelineValidationWarning[] = [];
  private suggestions: ValidationSuggestion[] = [];

  /**
   * Main validation method
   */
  validate(
    events: TimelineEvent[],
    inputs: RealEstateInputs,
    scenario?: TimelineScenario
  ): ValidationResult {
    // Reset state
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];

    // Run validation categories
    this.validateEventStructure(events);
    this.validateBusinessLogic(events, inputs);
    this.validateFinancialRealism(events, inputs);
    this.validateRiskFactors(events, inputs, scenario);
    this.validateOptimizationOpportunities(events, inputs, scenario);

    // Calculate validation score
    const score = this.calculateValidationScore();

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions,
      score
    };
  }

  // ===== VALIDATION CATEGORIES =====

  /**
   * Validate event structure and basic requirements
   */
  private validateEventStructure(events: TimelineEvent[]): void {
    // Check for duplicate event IDs
    const eventIds = events.map(e => e.id);
    const duplicateIds = eventIds.filter((id, index) => eventIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      this.errors.push({
        type: 'LOGIC_ERROR',
        message: `Duplicate event IDs found: ${duplicateIds.join(', ')}`,
        affectedMonths: [],
        affectedEvents: duplicateIds,
        severity: 'HIGH'
      });
    }

    // Validate month ranges
    events.forEach(event => {
      if (event.month < 1 || event.month > TIMELINE_CONFIG.TOTAL_MONTHS) {
        this.errors.push({
          type: 'DATE_CONFLICT',
          message: `Event "${event.name}" has invalid month: ${event.month}`,
          affectedMonths: [event.month],
          affectedEvents: [event.id],
          severity: 'HIGH'
        });
      }
    });

    // Check for too many events in single month
    const eventsByMonth = this.groupEventsByMonth(events);
    Object.entries(eventsByMonth).forEach(([month, monthEvents]) => {
      if (monthEvents.length > TIMELINE_CONFIG.MAX_EVENTS_PER_MONTH) {
        this.warnings.push({
          type: 'COMPLEXITY_WARNING',
          message: `Month ${month} has ${monthEvents.length} events (recommended: ≤${TIMELINE_CONFIG.MAX_EVENTS_PER_MONTH})`,
          affectedMonths: [parseInt(month)],
          recommendation: 'Consider spreading events across multiple months for better cash flow management'
        });
      }
    });

    // Check total event count
    if (events.length > TIMELINE_CONFIG.MAX_TOTAL_EVENTS) {
      this.warnings.push({
        type: 'COMPLEXITY_WARNING',
        message: `Total events (${events.length}) exceeds recommended limit (${TIMELINE_CONFIG.MAX_TOTAL_EVENTS})`,
        affectedMonths: [],
        recommendation: 'Consider consolidating similar events or focusing on major financial events only'
      });
    }
  }

  /**
   * Validate business logic rules
   */
  private validateBusinessLogic(events: TimelineEvent[], inputs: RealEstateInputs): void {
    // Apply global validation rules
    Object.entries(GLOBAL_VALIDATION_RULES).forEach(([ruleKey, rule]) => {
      if (!rule.validator(events)) {
        this.errors.push({
          type: 'LOGIC_ERROR',
          message: rule.errorMessage,
          affectedMonths: [],
          affectedEvents: events.map(e => e.id),
          severity: 'HIGH'
        });
      }
    });

    // Validate loan disbursement before payments
    this.validateLoanDisbursementLogic(events);

    // Validate grace period logic
    this.validateGracePeriodLogic(events);

    // Validate early payment logic
    this.validateEarlyPaymentLogic(events);

    // Validate phased disbursement logic
    this.validatePhasedDisbursementLogic(events, inputs);
  }

  /**
   * Validate financial realism
   */
  private validateFinancialRealism(events: TimelineEvent[], inputs: RealEstateInputs): void {
    // Check loan amounts vs property value
    const totalDisbursements = events
      .filter(e => e.type === TimelineEventType.LOAN_DISBURSEMENT || e.type === TimelineEventType.PHASED_DISBURSEMENT)
      .reduce((total, event: any) => total + (event.amount || 0), 0);

    const maxLoanAmount = inputs.giaTriBDS * (inputs.tyLeVay / 100);
    if (totalDisbursements > maxLoanAmount * 1.1) { // 10% tolerance
      this.errors.push({
        type: 'FINANCIAL_ERROR',
        message: `Total loan disbursements (${totalDisbursements.toLocaleString('vi-VN')}) exceed max loan amount (${maxLoanAmount.toLocaleString('vi-VN')})`,
        affectedMonths: [],
        affectedEvents: [],
        severity: 'HIGH'
      });
    }

    // Check early payment amounts
    const earlyPayments = events.filter(e => e.type === TimelineEventType.EARLY_PAYMENT);
    earlyPayments.forEach((payment: any) => {
      if (payment.amount > inputs.giaTriBDS) {
        this.warnings.push({
          type: 'FINANCIAL_WARNING',
          message: `Early payment of ${payment.amount.toLocaleString('vi-VN')} exceeds property value`,
          affectedMonths: [payment.month],
          recommendation: 'Verify early payment amount is realistic'
        });
      }
    });

    // Check interest rates
    const rateChangeEvents = events.filter(e => e.type === TimelineEventType.INTEREST_RATE_CHANGE);
    rateChangeEvents.forEach((event: any) => {
      if (event.newRate < 0 || event.newRate > 50) {
        this.warnings.push({
          type: 'FINANCIAL_WARNING',
          message: `Interest rate of ${event.newRate}% seems unrealistic`,
          affectedMonths: [event.month],
          recommendation: 'Verify interest rate is accurate'
        });
      }
    });

    // Check cash flow updates
    const cashFlowEvents = events.filter(e => e.type === TimelineEventType.CASH_FLOW_UPDATE);
    cashFlowEvents.forEach((event: any) => {
      const totalChange = (event.incomeChange || 0) + (event.rentalIncomeChange || 0) - (event.expenseChange || 0);
      const currentIncome = inputs.thuNhapKhac + inputs.tienThueThang;
      
      if (Math.abs(totalChange) > currentIncome * 0.5) {
        this.warnings.push({
          type: 'FINANCIAL_WARNING',
          message: `Large cash flow change (${totalChange.toLocaleString('vi-VN')}) in month ${event.month}`,
          affectedMonths: [event.month],
          recommendation: 'Verify this cash flow change is realistic and planned'
        });
      }
    });
  }

  /**
   * Validate risk factors
   */
  private validateRiskFactors(
    events: TimelineEvent[], 
    inputs: RealEstateInputs, 
    scenario?: TimelineScenario
  ): void {
    // High loan-to-value ratio risk
    if (inputs.tyLeVay > 80) {
      this.warnings.push({
        type: 'RISK_WARNING',
        message: `High loan-to-value ratio: ${inputs.tyLeVay}%`,
        affectedMonths: [],
        recommendation: 'Consider reducing loan amount or increasing down payment to mitigate risk'
      });
    }

    // Interest rate risk
    const hasVariableRate = events.some(e => e.type === TimelineEventType.INTEREST_RATE_CHANGE);
    if (hasVariableRate) {
      const rateChanges = events.filter(e => e.type === TimelineEventType.INTEREST_RATE_CHANGE);
      const maxRate = Math.max(...rateChanges.map((e: any) => e.newRate));
      
      if (maxRate > inputs.laiSuatThaNoi + 5) {
        this.warnings.push({
          type: 'RISK_WARNING',
          message: `High interest rate scenario: ${maxRate}%`,
          affectedMonths: [],
          recommendation: 'Ensure you can afford payments at the highest projected interest rate'
        });
      }
    }

    // Cash flow risk from scenario analysis
    if (scenario) {
      const negativeCashFlowMonths = scenario.monthlyBreakdowns
        .filter(month => month.finalCashFlow < 0).length;
      
      if (negativeCashFlowMonths > 12) {
        this.warnings.push({
          type: 'CASH_FLOW_RISK',
          message: `${negativeCashFlowMonths} months with negative cash flow projected`,
          affectedMonths: [],
          recommendation: 'Build larger emergency fund or consider increasing rental income'
        });
      }
    }

    // Vacancy risk
    if (inputs.tyLeLapDay < 90) {
      this.warnings.push({
        type: 'VACANCY_RISK',
        message: `High vacancy assumption: ${100 - inputs.tyLeLapDay}% vacancy rate`,
        affectedMonths: [],
        recommendation: 'Consider strategies to improve occupancy rates'
      });
    }
  }

  /**
   * Validate optimization opportunities
   */
  private validateOptimizationOpportunities(
    events: TimelineEvent[], 
    inputs: RealEstateInputs, 
    scenario?: TimelineScenario
  ): void {
    // Early payment optimization
    const hasEarlyPayments = events.some(e => e.type === TimelineEventType.EARLY_PAYMENT);
    if (!hasEarlyPayments && inputs.thuNhapKhac > inputs.chiPhiSinhHoat * 1.5) {
      this.suggestions.push({
        type: 'OPTIMIZATION',
        title: 'Consider Early Loan Payments',
        description: 'Your income allows for early loan payments that could save significant interest',
        impact: 'HIGH',
        estimatedBenefit: this.estimateEarlyPaymentBenefit(inputs),
        actionRequired: 'Add early payment events to your timeline',
        autoFixAvailable: true
      });
    }

    // Rental income optimization
    const hasRentIncreases = events.some(e => 
      e.type === TimelineEventType.CASH_FLOW_UPDATE && 
      (e as any).changeType === 'rent_increase'
    );
    
    if (!hasRentIncreases) {
      this.suggestions.push({
        type: 'BEST_PRACTICE',
        title: 'Plan for Rental Income Increases',
        description: 'Consider periodic rent increases to keep up with market rates',
        impact: 'MEDIUM',
        estimatedBenefit: inputs.tienThueThang * 0.05 * 12 * 10, // 5% increase over 10 years
        actionRequired: 'Add rental income increase events every 2-3 years',
        autoFixAvailable: true
      });
    }

    // Interest rate protection
    const hasRateProtection = events.some(e => e.type === TimelineEventType.INTEREST_RATE_CHANGE);
    if (!hasRateProtection && inputs.laiSuatThaNoi > inputs.laiSuatUuDai + 2) {
      this.suggestions.push({
        type: 'RISK_REDUCTION',
        title: 'Plan for Interest Rate Increases',
        description: 'Your floating rate is significantly higher than promotional rate',
        impact: 'HIGH',
        actionRequired: 'Add interest rate change event when promotion ends',
        autoFixAvailable: true
      });
    }

    // Grace period optimization
    const hasGracePeriod = events.some(e => e.type === TimelineEventType.PRINCIPAL_GRACE_PERIOD);
    if (!hasGracePeriod && inputs.tienThueThang < inputs.giaTriBDS * 0.005) { // Monthly rent < 0.5% of property value
      this.suggestions.push({
        type: 'OPTIMIZATION',
        title: 'Consider Principal Grace Period',
        description: 'Low rental yield suggests grace period might help initial cash flow',
        impact: 'MEDIUM',
        actionRequired: 'Add principal grace period for first 6-12 months',
        autoFixAvailable: true
      });
    }
  }

  // ===== SPECIFIC VALIDATION METHODS =====

  private validateLoanDisbursementLogic(events: TimelineEvent[]): void {
    const disbursements = events.filter(e => 
      e.type === TimelineEventType.LOAN_DISBURSEMENT || 
      e.type === TimelineEventType.PHASED_DISBURSEMENT
    );
    const payments = events.filter(e => 
      e.type === TimelineEventType.EARLY_PAYMENT ||
      e.type === TimelineEventType.START_LOAN_PAYMENTS
    );

    payments.forEach(payment => {
      const hasEarlierDisbursement = disbursements.some(disbursement => 
        disbursement.month <= payment.month
      );
      
      if (!hasEarlierDisbursement) {
        this.errors.push({
          type: 'LOGIC_ERROR',
          message: `Payment in month ${payment.month} occurs before any loan disbursement`,
          affectedMonths: [payment.month],
          affectedEvents: [payment.id],
          severity: 'HIGH'
        });
      }
    });
  }

  private validateGracePeriodLogic(events: TimelineEvent[]): void {
    const gracePeriods = events.filter(e => e.type === TimelineEventType.PRINCIPAL_GRACE_PERIOD);
    const startPayments = events.filter(e => e.type === TimelineEventType.START_LOAN_PAYMENTS);

    gracePeriods.forEach((grace: any) => {
      const graceEndMonth = grace.month + grace.durationMonths;
      
      const conflictingPayments = startPayments.filter(payment => 
        payment.month >= grace.month && payment.month < graceEndMonth
      );

      if (conflictingPayments.length > 0) {
        this.errors.push({
          type: 'LOGIC_ERROR',
          message: `Grace period (months ${grace.month}-${graceEndMonth}) conflicts with loan payment start`,
          affectedMonths: [grace.month],
          affectedEvents: [grace.id, ...conflictingPayments.map(p => p.id)],
          severity: 'HIGH'
        });
      }
    });
  }

  private validateEarlyPaymentLogic(events: TimelineEvent[]): void {
    const earlyPayments = events.filter(e => e.type === TimelineEventType.EARLY_PAYMENT);
    const disbursements = events.filter(e => 
      e.type === TimelineEventType.LOAN_DISBURSEMENT || 
      e.type === TimelineEventType.PHASED_DISBURSEMENT
    );

    earlyPayments.forEach((payment: any) => {
      // Check if there's sufficient loan balance to pay
      const totalDisbursedBeforePayment = disbursements
        .filter(d => d.month <= payment.month)
        .reduce((total, d: any) => total + d.amount, 0);

      const totalPaidBeforeThisPayment = earlyPayments
        .filter(p => p.month < payment.month)
        .reduce((total, p: any) => total + p.amount, 0);

      const availableBalance = totalDisbursedBeforePayment - totalPaidBeforeThisPayment;

      if (payment.amount > availableBalance) {
        this.errors.push({
          type: 'FINANCIAL_ERROR',
          message: `Early payment of ${payment.amount.toLocaleString('vi-VN')} exceeds available loan balance of ${availableBalance.toLocaleString('vi-VN')} in month ${payment.month}`,
          affectedMonths: [payment.month],
          affectedEvents: [payment.id],
          severity: 'HIGH'
        });
      }
    });
  }

  private validatePhasedDisbursementLogic(events: TimelineEvent[], inputs: RealEstateInputs): void {
    const phasedDisbursements = events.filter(e => e.type === TimelineEventType.PHASED_DISBURSEMENT);
    
    if (phasedDisbursements.length > 0) {
      // Check construction progress sequence
      const sortedPhases = [...phasedDisbursements].sort((a, b) => a.month - b.month);
      let lastProgress = 0;
      
      sortedPhases.forEach((phase: any, index) => {
        if (phase.constructionProgress <= lastProgress) {
          this.warnings.push({
            type: 'LOGIC_WARNING',
            message: `Construction progress not increasing: ${lastProgress}% → ${phase.constructionProgress}% in month ${phase.month}`,
            affectedMonths: [phase.month],
            recommendation: 'Ensure construction progress increases with each disbursement'
          });
        }
        lastProgress = phase.constructionProgress;
      });

      // Check total disbursement vs total commitment
      const totalPhased = phasedDisbursements.reduce((total, phase: any) => total + phase.amount, 0);
      const maxLoan = inputs.giaTriBDS * (inputs.tyLeVay / 100);
      
      if (totalPhased > maxLoan) {
        this.errors.push({
          type: 'FINANCIAL_ERROR',
          message: `Total phased disbursements (${totalPhased.toLocaleString('vi-VN')}) exceed loan limit (${maxLoan.toLocaleString('vi-VN')})`,
          affectedMonths: [],
          affectedEvents: phasedDisbursements.map(p => p.id),
          severity: 'HIGH'
        });
      }
    }
  }

  // ===== HELPER METHODS =====

  private groupEventsByMonth(events: TimelineEvent[]): { [month: number]: TimelineEvent[] } {
    return events.reduce((groups, event) => {
      if (!groups[event.month]) groups[event.month] = [];
      groups[event.month].push(event);
      return groups;
    }, {} as { [month: number]: TimelineEvent[] });
  }

  private estimateEarlyPaymentBenefit(inputs: RealEstateInputs): number {
    const loanAmount = inputs.giaTriBDS * (inputs.tyLeVay / 100);
    const averageRate = (inputs.laiSuatUuDai + inputs.laiSuatThaNoi) / 2;
    const monthlyRate = averageRate / 100 / 12;
    const totalMonths = inputs.thoiGianVay * 12;
    
    // Simplified calculation: 20% early payment in year 5 saves roughly this amount
    const earlyPaymentAmount = loanAmount * 0.2;
    const remainingMonths = totalMonths - 60; // After 5 years
    return earlyPaymentAmount * monthlyRate * remainingMonths * 0.7; // 70% approximation
  }

  private calculateValidationScore(): ValidationScore {
    // Calculate component scores
    const logicalConsistency = this.calculateLogicalConsistencyScore();
    const financialRealism = this.calculateFinancialRealismScore();
    const riskManagement = this.calculateRiskManagementScore();
    const optimization = this.calculateOptimizationScore();

    // Calculate overall score
    const overall = Math.round((logicalConsistency + financialRealism + riskManagement + optimization) / 4);

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (overall >= 90) grade = 'A';
    else if (overall >= 80) grade = 'B';
    else if (overall >= 70) grade = 'C';
    else if (overall >= 60) grade = 'D';
    else grade = 'F';

    return {
      overall,
      breakdown: {
        logicalConsistency,
        financialRealism,
        riskManagement,
        optimization
      },
      grade
    };
  }

  private calculateLogicalConsistencyScore(): number {
    const logicErrors = this.errors.filter(e => e.type === 'LOGIC_ERROR').length;
    const logicWarnings = this.warnings.filter(w => w.type === 'LOGIC_WARNING').length;
    
    if (logicErrors > 0) return Math.max(0, 50 - (logicErrors * 20));
    if (logicWarnings > 2) return Math.max(70, 90 - (logicWarnings * 5));
    return 100;
  }

  private calculateFinancialRealismScore(): number {
    const financialErrors = this.errors.filter(e => e.type === 'FINANCIAL_ERROR').length;
    const financialWarnings = this.warnings.filter(w => w.type === 'FINANCIAL_WARNING').length;
    
    if (financialErrors > 0) return Math.max(0, 60 - (financialErrors * 15));
    return Math.max(75, 100 - (financialWarnings * 5));
  }

  private calculateRiskManagementScore(): number {
    const riskWarnings = this.warnings.filter(w => 
      w.type === 'RISK_WARNING' || w.type === 'CASH_FLOW_RISK' || w.type === 'VACANCY_RISK'
    ).length;
    
    return Math.max(60, 100 - (riskWarnings * 10));
  }

  private calculateOptimizationScore(): number {
    const optimizationSuggestions = this.suggestions.filter(s => s.type === 'OPTIMIZATION').length;
    const bestPracticeSuggestions = this.suggestions.filter(s => s.type === 'BEST_PRACTICE').length;
    
    // More suggestions = lower optimization score (more room for improvement)
    const totalSuggestions = optimizationSuggestions + bestPracticeSuggestions;
    return Math.max(60, 100 - (totalSuggestions * 8));
  }
}

// ===== EXPORT =====
export { TimelineValidator };

/**
 * Convenience function for quick validation
 */
export function validateTimelineQuick(
  events: TimelineEvent[],
  inputs: RealEstateInputs
): { isValid: boolean; errorCount: number; warningCount: number } {
  const validator = new TimelineValidator();
  const result = validator.validate(events, inputs);
  
  return {
    isValid: result.isValid,
    errorCount: result.errors.length,
    warningCount: result.warnings.length
  };
}