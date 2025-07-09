/**
 * TIMELINE EVENT PROCESSORS
 * Specialized processors for each event type với detailed business logic
 */

import {
  TimelineEvent,
  TimelineEventType,
  CashPaymentEvent,
  LoanDisbursementEvent,
  StartLoanPaymentsEvent,
  PrincipalGracePeriodEvent,
  EarlyPaymentEvent,
  InterestRateChangeEvent,
  PhasedDisbursementEvent,
  CashFlowUpdateEvent,
  PaymentFeeScheduleEvent
} from '@/types/timeline';
import { RealEstateInputs } from '@/types/real-estate';
import { calculatePMT } from './financial-utils';

// ===== EVENT PROCESSOR INTERFACE =====

export interface EventProcessorResult {
  stateChanges: Partial<TimelineState>;
  additionalEffects: AdditionalEffect[];
  warnings: string[];
  calculatedValues: { [key: string]: number };
}

export interface TimelineState {
  // === LOAN STATE ===
  currentLoanBalance: number;
  totalDisbursed: number;
  totalCommittedLoan: number;
  currentInterestRate: number;
  currentMonthlyPayment: number;
  
  // === PAYMENT STATE ===
  isInGracePeriod: boolean;
  gracePeriodEndMonth: number;
  hasStartedPayments: boolean;
  principalPaymentStartMonth: number;
  
  // === CASH FLOW STATE ===
  currentRentalIncome: number;
  currentPersonalIncome: number;
  currentPersonalExpenses: number;
  currentOperatingExpenses: number;
  
  // === FEE STATE ===
  activeFeeSchedule?: Array<{
    year: number;
    penaltyRate: number;
    minFee: number;
    maxFee: number;
  }>;
  
  // === CUMULATIVE STATE ===
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalCashFlowGenerated: number;
  totalPenaltiesPaid: number;
  
  // === METADATA ===
  lastCalculationMonth: number;
  significantEvents: string[]; // Event IDs that had major impact
}

export interface AdditionalEffect {
  type: 'RECALCULATE_PAYMENTS' | 'UPDATE_SCHEDULE' | 'TRIGGER_WARNING' | 'CREATE_DERIVED_EVENT';
  description: string;
  data?: any;
}

// ===== ABSTRACT BASE PROCESSOR =====

abstract class BaseEventProcessor<T extends TimelineEvent> {
  abstract process(
    event: T,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult;

  /**
   * Helper method để tính monthly payment
   */
  protected calculateMonthlyPayment(
    loanBalance: number,
    interestRate: number,
    loanTermYears: number,
    currentMonth: number
  ): number {
    const remainingMonths = Math.max(0, (loanTermYears * 12) - currentMonth + 1);
    if (remainingMonths <= 0 || loanBalance <= 0) return 0;
    
    return Math.abs(calculatePMT(interestRate, remainingMonths, loanBalance));
  }

  /**
   * Helper method để calculate penalty fees
   */
  protected calculatePenaltyFee(
    amount: number,
    penaltyRate: number,
    feeSchedule?: TimelineState['activeFeeSchedule'],
    currentMonth?: number
  ): number {
    if (!feeSchedule || !currentMonth) {
      return amount * (penaltyRate / 100);
    }

    const currentYear = Math.ceil(currentMonth / 12);
    const applicableFee = feeSchedule.find(fee => fee.year === currentYear) || feeSchedule[0];
    
    const calculatedFee = amount * (applicableFee.penaltyRate / 100);
    return Math.max(
      applicableFee.minFee,
      Math.min(applicableFee.maxFee, calculatedFee)
    );
  }
}

// ===== SPECIFIC EVENT PROCESSORS =====

/**
 * Cash Payment Event Processor
 */
export class CashPaymentProcessor extends BaseEventProcessor<CashPaymentEvent> {
  process(
    event: CashPaymentEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult {
    const warnings: string[] = [];
    const additionalEffects: AdditionalEffect[] = [];

    // Validate cash payment amount
    if (event.amount <= 0) {
      warnings.push(`Cash payment amount must be positive: ${event.amount}`);
    }

    // Check if this is unusually large payment
    const propertyValue = inputs.giaTriBDS;
    if (event.amount > propertyValue * 0.5) {
      warnings.push(`Large cash payment detected: ${event.amount.toLocaleString('vi-VN')} VND`);
    }

    // Cash payments don't affect loan state directly
    // But they might affect cash flow if they're ongoing expenses
    const stateChanges: Partial<TimelineState> = {};
    
    if (event.affectsCashFlow) {
      // If it's a recurring cost, reduce available cash flow
      if (event.purpose === 'renovation' || event.purpose === 'other') {
        additionalEffects.push({
          type: 'UPDATE_SCHEDULE',
          description: `Cash payment affects monthly cash flow`,
          data: { monthlyImpact: -event.amount }
        });
      }
    }

    return {
      stateChanges,
      additionalEffects,
      warnings,
      calculatedValues: {
        cashOutflow: event.amount,
        cumulativeCashPayments: (currentState.totalCashFlowGenerated || 0) - event.amount
      }
    };
  }
}

/**
 * Loan Disbursement Event Processor
 */
export class LoanDisbursementProcessor extends BaseEventProcessor<LoanDisbursementEvent> {
  process(
    event: LoanDisbursementEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult {
    const warnings: string[] = [];
    const additionalEffects: AdditionalEffect[] = [];

    // Validate disbursement
    const maxLoanAmount = inputs.giaTriBDS * (inputs.tyLeVay / 100);
    const newTotalDisbursed = currentState.totalDisbursed + event.amount;
    
    if (newTotalDisbursed > maxLoanAmount * 1.1) { // Allow 10% tolerance
      warnings.push(`Disbursement exceeds loan limit: ${newTotalDisbursed.toLocaleString('vi-VN')} > ${maxLoanAmount.toLocaleString('vi-VN')}`);
    }

    const stateChanges: Partial<TimelineState> = {
      currentLoanBalance: currentState.currentLoanBalance + event.amount,
      totalDisbursed: newTotalDisbursed,
      currentInterestRate: event.interestRate
    };

    // Update monthly payment if not in grace period
    if (!currentState.isInGracePeriod && currentState.hasStartedPayments) {
      const newMonthlyPayment = this.calculateMonthlyPayment(
        stateChanges.currentLoanBalance!,
        event.interestRate,
        inputs.thoiGianVay,
        currentMonth
      );
      
      stateChanges.currentMonthlyPayment = newMonthlyPayment;
      
      additionalEffects.push({
        type: 'RECALCULATE_PAYMENTS',
        description: `Monthly payment recalculated due to disbursement: ${newMonthlyPayment.toLocaleString('vi-VN')} VND`,
        data: { newPayment: newMonthlyPayment }
      });
    }

    // If there's a grace period specified, set it up
    if (event.gracePeriodMonths && event.gracePeriodMonths > 0) {
      stateChanges.isInGracePeriod = true;
      stateChanges.gracePeriodEndMonth = currentMonth + event.gracePeriodMonths - 1;
      
      additionalEffects.push({
        type: 'UPDATE_SCHEDULE',
        description: `Grace period set: ${event.gracePeriodMonths} months`,
        data: { gracePeriodEnd: stateChanges.gracePeriodEndMonth }
      });
    }

    return {
      stateChanges,
      additionalEffects,
      warnings,
      calculatedValues: {
        newLoanBalance: stateChanges.currentLoanBalance!,
        totalDisbursed: newTotalDisbursed,
        monthlyInterestAccrual: stateChanges.currentLoanBalance! * (event.interestRate / 100 / 12)
      }
    };
  }
}

/**
 * Start Loan Payments Event Processor
 */
export class StartLoanPaymentsProcessor extends BaseEventProcessor<StartLoanPaymentsEvent> {
  process(
    event: StartLoanPaymentsEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult {
    const warnings: string[] = [];
    const additionalEffects: AdditionalEffect[] = [];

    // Validate that there's a loan to pay
    if (currentState.currentLoanBalance <= 0) {
      warnings.push('Cannot start loan payments: no outstanding loan balance');
    }

    // Check if already started payments
    if (currentState.hasStartedPayments) {
      warnings.push('Loan payments already started');
    }

    const stateChanges: Partial<TimelineState> = {
      hasStartedPayments: true,
      principalPaymentStartMonth: currentMonth,
      currentMonthlyPayment: event.monthlyPayment,
      currentInterestRate: event.interestRate
    };

    // End grace period if active
    if (currentState.isInGracePeriod) {
      stateChanges.isInGracePeriod = false;
      stateChanges.gracePeriodEndMonth = 0;
      
      additionalEffects.push({
        type: 'UPDATE_SCHEDULE',
        description: 'Grace period ended due to loan payment start',
        data: { previousGracePeriodEnd: currentState.gracePeriodEndMonth }
      });
    }

    // Validate payment amount vs calculated amount
    const calculatedPayment = this.calculateMonthlyPayment(
      currentState.currentLoanBalance,
      event.interestRate,
      inputs.thoiGianVay,
      currentMonth
    );

    const paymentDifference = Math.abs(event.monthlyPayment - calculatedPayment);
    if (paymentDifference > calculatedPayment * 0.1) { // 10% tolerance
      warnings.push(`Payment amount differs significantly from calculated: ${event.monthlyPayment.toLocaleString('vi-VN')} vs ${calculatedPayment.toLocaleString('vi-VN')}`);
    }

    return {
      stateChanges,
      additionalEffects,
      warnings,
      calculatedValues: {
        calculatedMonthlyPayment: calculatedPayment,
        paymentDifference,
        remainingPayments: event.remainingMonths
      }
    };
  }
}

/**
 * Principal Grace Period Event Processor
 */
export class PrincipalGracePeriodProcessor extends BaseEventProcessor<PrincipalGracePeriodEvent> {
  process(
    event: PrincipalGracePeriodEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult {
    const warnings: string[] = [];
    const additionalEffects: AdditionalEffect[] = [];

    // Validate grace period
    if (currentState.hasStartedPayments) {
      warnings.push('Cannot set grace period: loan payments already started');
    }

    if (event.durationMonths <= 0) {
      warnings.push('Grace period duration must be positive');
    }

    const stateChanges: Partial<TimelineState> = {
      isInGracePeriod: true,
      gracePeriodEndMonth: event.endMonth || (currentMonth + event.durationMonths - 1),
      currentMonthlyPayment: event.interestOnlyPayment
    };

    // Calculate expected interest-only payment
    const expectedInterestPayment = currentState.currentLoanBalance * (currentState.currentInterestRate / 100 / 12);
    const paymentDifference = Math.abs(event.interestOnlyPayment - expectedInterestPayment);
    
    if (paymentDifference > expectedInterestPayment * 0.05) { // 5% tolerance
      warnings.push(`Interest-only payment differs from expected: ${event.interestOnlyPayment.toLocaleString('vi-VN')} vs ${expectedInterestPayment.toLocaleString('vi-VN')}`);
    }

    additionalEffects.push({
      type: 'UPDATE_SCHEDULE',
      description: `Grace period activated for ${event.durationMonths} months`,
      data: {
        startMonth: currentMonth,
        endMonth: stateChanges.gracePeriodEndMonth,
        interestOnlyAmount: event.interestOnlyPayment
      }
    });

    return {
      stateChanges,
      additionalEffects,
      warnings,
      calculatedValues: {
        expectedInterestPayment,
        totalInterestDuringGrace: event.interestOnlyPayment * event.durationMonths,
        gracePeriodSavings: (expectedInterestPayment - event.interestOnlyPayment) * event.durationMonths
      }
    };
  }
}

/**
 * Early Payment Event Processor
 */
export class EarlyPaymentProcessor extends BaseEventProcessor<EarlyPaymentEvent> {
  process(
    event: EarlyPaymentEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult {
    const warnings: string[] = [];
    const additionalEffects: AdditionalEffect[] = [];

    // Validate early payment
    if (event.amount <= 0) {
      warnings.push('Early payment amount must be positive');
    }

    if (event.amount > currentState.currentLoanBalance) {
      warnings.push(`Early payment exceeds loan balance: ${event.amount.toLocaleString('vi-VN')} > ${currentState.currentLoanBalance.toLocaleString('vi-VN')}`);
    }

    // Calculate penalty fee
    const penaltyFee = this.calculatePenaltyFee(
      event.amount,
      event.penaltyRate,
      currentState.activeFeeSchedule,
      currentMonth
    );

    const newLoanBalance = Math.max(0, currentState.currentLoanBalance - event.amount);
    
    // Recalculate monthly payment
    const newMonthlyPayment = newLoanBalance > 0 ? 
      this.calculateMonthlyPayment(
        newLoanBalance,
        currentState.currentInterestRate,
        inputs.thoiGianVay,
        currentMonth
      ) : 0;

    const stateChanges: Partial<TimelineState> = {
      currentLoanBalance: newLoanBalance,
      currentMonthlyPayment: newMonthlyPayment,
      totalPrincipalPaid: currentState.totalPrincipalPaid + event.amount,
      totalPenaltiesPaid: currentState.totalPenaltiesPaid + penaltyFee
    };

    // Calculate interest savings
    const remainingMonths = Math.max(0, (inputs.thoiGianVay * 12) - currentMonth);
    const interestSavings = this.calculateInterestSavings(
      event.amount,
      currentState.currentInterestRate,
      remainingMonths
    );

    additionalEffects.push({
      type: 'RECALCULATE_PAYMENTS',
      description: `Monthly payment reduced due to early payment: ${currentState.currentMonthlyPayment.toLocaleString('vi-VN')} → ${newMonthlyPayment.toLocaleString('vi-VN')}`,
      data: {
        oldPayment: currentState.currentMonthlyPayment,
        newPayment: newMonthlyPayment,
        reduction: currentState.currentMonthlyPayment - newMonthlyPayment
      }
    });

    if (newLoanBalance === 0) {
      additionalEffects.push({
        type: 'TRIGGER_WARNING',
        description: 'Loan fully paid off',
        data: { payoffMonth: currentMonth }
      });
    }

    return {
      stateChanges,
      additionalEffects,
      warnings,
      calculatedValues: {
        penaltyFee,
        newLoanBalance,
        newMonthlyPayment,
        interestSavings,
        netSavings: interestSavings - penaltyFee,
        paymentReduction: currentState.currentMonthlyPayment - newMonthlyPayment
      }
    };
  }

  private calculateInterestSavings(
    earlyPaymentAmount: number,
    interestRate: number,
    remainingMonths: number
  ): number {
    const monthlyRate = interestRate / 100 / 12;
    // Simplified calculation: compound interest on the early payment amount
    return earlyPaymentAmount * monthlyRate * remainingMonths * 0.7; // 70% approximation factor
  }
}

/**
 * Interest Rate Change Event Processor
 */
export class InterestRateChangeProcessor extends BaseEventProcessor<InterestRateChangeEvent> {
  process(
    event: InterestRateChangeEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult {
    const warnings: string[] = [];
    const additionalEffects: AdditionalEffect[] = [];

    // Validate interest rate
    if (event.newRate < 0 || event.newRate > 50) {
      warnings.push(`Interest rate seems unrealistic: ${event.newRate}%`);
    }

    const rateDifference = event.newRate - event.oldRate;
    
    // Calculate new monthly payment
    const newMonthlyPayment = currentState.currentLoanBalance > 0 && !currentState.isInGracePeriod ?
      this.calculateMonthlyPayment(
        currentState.currentLoanBalance,
        event.newRate,
        inputs.thoiGianVay,
        currentMonth
      ) : currentState.currentMonthlyPayment;

    const stateChanges: Partial<TimelineState> = {
      currentInterestRate: event.newRate,
      currentMonthlyPayment: newMonthlyPayment
    };

    const paymentDifference = newMonthlyPayment - currentState.currentMonthlyPayment;
    
    additionalEffects.push({
      type: 'RECALCULATE_PAYMENTS',
      description: `Interest rate changed: ${event.oldRate}% → ${event.newRate}% (${rateDifference > 0 ? '+' : ''}${(rateDifference || 0).toFixed(2)}%)`,
      data: {
        oldRate: event.oldRate,
        newRate: event.newRate,
        rateDifference,
        paymentChange: paymentDifference
      }
    });

    if (Math.abs(paymentDifference) > 1000000) { // 1M VND threshold
      additionalEffects.push({
        type: 'TRIGGER_WARNING',
        description: `Significant payment change: ${paymentDifference > 0 ? '+' : ''}${paymentDifference.toLocaleString('vi-VN')} VND/month`,
        data: { significantChange: true }
      });
    }

    return {
      stateChanges,
      additionalEffects,
      warnings,
      calculatedValues: {
        newMonthlyPayment,
        paymentDifference,
        rateDifference,
        annualPaymentChange: paymentDifference * 12
      }
    };
  }
}

/**
 * Cash Flow Update Event Processor
 */
export class CashFlowUpdateProcessor extends BaseEventProcessor<CashFlowUpdateEvent> {
  process(
    event: CashFlowUpdateEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult {
    const warnings: string[] = [];
    const additionalEffects: AdditionalEffect[] = [];

    const stateChanges: Partial<TimelineState> = {};

    // Apply income changes
    if (event.incomeChange !== 0) {
      stateChanges.currentPersonalIncome = (currentState.currentPersonalIncome || 0) + event.incomeChange;
      
      if (stateChanges.currentPersonalIncome < 0) {
        warnings.push('Personal income became negative');
      }
    }

    // Apply expense changes
    if (event.expenseChange !== 0) {
      stateChanges.currentPersonalExpenses = (currentState.currentPersonalExpenses || 0) + event.expenseChange;
      
      if (stateChanges.currentPersonalExpenses < 0) {
        warnings.push('Personal expenses became negative');
      }
    }

    // Apply rental income changes
    if (event.rentalIncomeChange !== 0) {
      stateChanges.currentRentalIncome = (currentState.currentRentalIncome || 0) + event.rentalIncomeChange;
      
      if (stateChanges.currentRentalIncome < 0) {
        warnings.push('Rental income became negative');
      }
    }

    // Calculate net cash flow impact
    const netCashFlowChange = (event.incomeChange + event.rentalIncomeChange) - event.expenseChange;
    
    additionalEffects.push({
      type: 'UPDATE_SCHEDULE',
      description: `Cash flow updated: ${event.changeType} (${netCashFlowChange > 0 ? '+' : ''}${netCashFlowChange.toLocaleString('vi-VN')} VND/month)`,
      data: {
        changeType: event.changeType,
        netChange: netCashFlowChange,
        changePercent: event.changePercent
      }
    });

    return {
      stateChanges,
      additionalEffects,
      warnings,
      calculatedValues: {
        netCashFlowChange,
        newPersonalIncome: stateChanges.currentPersonalIncome || currentState.currentPersonalIncome,
        newRentalIncome: stateChanges.currentRentalIncome || currentState.currentRentalIncome,
        newPersonalExpenses: stateChanges.currentPersonalExpenses || currentState.currentPersonalExpenses
      }
    };
  }
}

/**
 * Phased Disbursement Event Processor
 */
export class PhasedDisbursementProcessor extends BaseEventProcessor<PhasedDisbursementEvent> {
  process(
    event: PhasedDisbursementEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult {
    const warnings: string[] = [];
    const additionalEffects: AdditionalEffect[] = [];

    // Validate construction progress
    if (event.constructionProgress < 0 || event.constructionProgress > 100) {
      warnings.push(`Invalid construction progress: ${event.constructionProgress}%`);
    }

    // Check if total disbursement is reasonable
    const newTotalDisbursed = event.totalDisbursed + event.amount;
    const maxLoanAmount = inputs.giaTriBDS * (inputs.tyLeVay / 100);
    
    if (newTotalDisbursed > maxLoanAmount) {
      warnings.push(`Total disbursed exceeds loan limit: ${newTotalDisbursed.toLocaleString('vi-VN')} > ${maxLoanAmount.toLocaleString('vi-VN')}`);
    }

    const stateChanges: Partial<TimelineState> = {
      currentLoanBalance: currentState.currentLoanBalance + event.amount,
      totalDisbursed: newTotalDisbursed
    };

    // For phased disbursement, interest is calculated only on disbursed amount
    if (event.interestOnDisbursedAmount) {
      // Recalculate monthly payment based on totalDisbursed, not totalCommitted
      const newMonthlyPayment = this.calculateMonthlyPayment(
        newTotalDisbursed,
        currentState.currentInterestRate,
        inputs.thoiGianVay,
        currentMonth
      );
      
      stateChanges.currentMonthlyPayment = newMonthlyPayment;
      
      additionalEffects.push({
        type: 'RECALCULATE_PAYMENTS',
        description: `Payment recalculated for phased disbursement: ${newMonthlyPayment.toLocaleString('vi-VN')} VND (based on ${newTotalDisbursed.toLocaleString('vi-VN')} disbursed)`,
        data: { 
          disbursedAmount: newTotalDisbursed,
          newPayment: newMonthlyPayment,
          constructionProgress: event.constructionProgress
        }
      });
    }

    return {
      stateChanges,
      additionalEffects,
      warnings,
      calculatedValues: {
        newTotalDisbursed,
        constructionProgress: event.constructionProgress,
        remainingCommitment: event.totalCommitted - newTotalDisbursed,
        interestOnlyOnDisbursed: event.interestOnDisbursedAmount
      }
    };
  }
}

/**
 * Payment Fee Schedule Event Processor
 */
export class PaymentFeeScheduleProcessor extends BaseEventProcessor<PaymentFeeScheduleEvent> {
  process(
    event: PaymentFeeScheduleEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult {
    const warnings: string[] = [];
    const additionalEffects: AdditionalEffect[] = [];

    // Validate fee schedule
    if (!event.feeSchedule || event.feeSchedule.length === 0) {
      warnings.push('Fee schedule is empty');
    }

    // Check for reasonable fee rates
    event.feeSchedule.forEach(fee => {
      if (fee.penaltyRate > 10) {
        warnings.push(`High penalty rate in year ${fee.year}: ${fee.penaltyRate}%`);
      }
      
      if (fee.minFee > fee.maxFee) {
        warnings.push(`Invalid fee range in year ${fee.year}: min (${fee.minFee}) > max (${fee.maxFee})`);
      }
    });

    const stateChanges: Partial<TimelineState> = {
      activeFeeSchedule: event.feeSchedule
    };

    additionalEffects.push({
      type: 'UPDATE_SCHEDULE',
      description: `Fee schedule activated with ${event.feeSchedule.length} year(s) of rates`,
      data: { 
        feeSchedule: event.feeSchedule,
        isActive: event.isActive
      }
    });

    return {
      stateChanges,
      additionalEffects,
      warnings,
      calculatedValues: {
        yearsWithFees: event.feeSchedule.length,
        averagePenaltyRate: event.feeSchedule.reduce((sum, fee) => sum + fee.penaltyRate, 0) / event.feeSchedule.length,
        maxPenaltyRate: Math.max(...event.feeSchedule.map(fee => fee.penaltyRate))
      }
    };
  }
}

// ===== UPDATE PROCESSOR FACTORY =====

export class EventProcessorFactory {
  private static processors = new Map<TimelineEventType, BaseEventProcessor<any>>([
    [TimelineEventType.CASH_PAYMENT, new CashPaymentProcessor()],
    [TimelineEventType.LOAN_DISBURSEMENT, new LoanDisbursementProcessor()],
    [TimelineEventType.START_LOAN_PAYMENTS, new StartLoanPaymentsProcessor()],
    [TimelineEventType.PRINCIPAL_GRACE_PERIOD, new PrincipalGracePeriodProcessor()],
    [TimelineEventType.EARLY_PAYMENT, new EarlyPaymentProcessor()],
    [TimelineEventType.INTEREST_RATE_CHANGE, new InterestRateChangeProcessor()],
    [TimelineEventType.CASH_FLOW_UPDATE, new CashFlowUpdateProcessor()],
    [TimelineEventType.PHASED_DISBURSEMENT, new PhasedDisbursementProcessor()],
    [TimelineEventType.PAYMENT_FEE_SCHEDULE, new PaymentFeeScheduleProcessor()],
  ]);

  static getProcessor(eventType: TimelineEventType): BaseEventProcessor<any> | null {
    return this.processors.get(eventType) || null;
  }

  static processEvent(
    event: TimelineEvent,
    currentState: TimelineState,
    inputs: RealEstateInputs,
    currentMonth: number
  ): EventProcessorResult | null {
    const processor = this.getProcessor(event.type);
    if (!processor) {
      return null;
    }

    return processor.process(event, currentState, inputs, currentMonth);
  }

  static getSupportedEventTypes(): TimelineEventType[] {
    return Array.from(this.processors.keys());
  }

  static isEventTypeSupported(eventType: TimelineEventType): boolean {
    return this.processors.has(eventType);
  }
}

// ===== EXPORT =====
export {
  TimelineState,
  EventProcessorResult,
  AdditionalEffect
};