/**
 * TIMELINE SIMULATION ENGINE
 * Core engine để simulate 240-month timeline với event processing
 */

import { 
  TimelineScenario,
  TimelineEvent,
  MonthlyBreakdown,
  TimelineEventType,
  TimelineValidationError,
  TimelineValidationWarning,
  TimelineSimulationConfig
} from '@/types/timeline';
import { RealEstateInputs, CalculationSteps } from '@/types/real-estate';
import { calculatePMT, calculateDetailedPayments } from './financial-utils';
import { 
  TIMELINE_CONFIG, 
  GLOBAL_VALIDATION_RULES,
  DEFAULT_TIMELINE_CONFIG 
} from './timeline-constants';

// ===== CORE SIMULATION ENGINE =====

/**
 * Timeline Simulation Engine
 * Processes 240 months với event-driven architecture
 */
export class TimelineSimulationEngine {
  private config: TimelineSimulationConfig;
  private errors: TimelineValidationError[] = [];
  private warnings: TimelineValidationWarning[] = [];

  constructor(config: Partial<TimelineSimulationConfig> = {}) {
    this.config = { ...DEFAULT_TIMELINE_CONFIG, ...config };
  }

  /**
   * Main simulation method - tạo complete timeline scenario
   */
  async simulateTimeline(
    inputs: RealEstateInputs,
    events: TimelineEvent[],
    scenarioName?: string
  ): Promise<TimelineScenario> {
    // Reset validation state
    this.errors = [];
    this.warnings = [];

    // Validate inputs và events
    this.validateInputs(inputs);
    this.validateEvents(events);
    
    // Nếu có lỗi nghiêm trọng, throw error
    if (this.errors.some(e => e.severity === 'HIGH')) {
      throw new Error(`Timeline validation failed: ${this.errors[0].message}`);
    }

    // Sort events by month
    const sortedEvents = [...events].sort((a, b) => a.month - b.month);

    // Initialize timeline state
    const timelineState = this.initializeTimelineState(inputs);

    // Generate monthly breakdowns
    const monthlyBreakdowns = await this.generateMonthlyBreakdowns(
      inputs, 
      sortedEvents, 
      timelineState
    );

    // Calculate summary metrics
    const summaryMetrics = this.calculateSummaryMetrics(monthlyBreakdowns);

    // Create timeline scenario
    const scenario: TimelineScenario = {
      // Base fields from CalculationResult
      inputs,
      steps: monthlyBreakdowns[0]?.loanBalance ? this.extractCalculationSteps(monthlyBreakdowns[0]) : {} as CalculationSteps,
      roiHangNam: summaryMetrics.averageAnnualROI,
      paybackPeriod: summaryMetrics.paybackPeriodYears,
      netPresentValue: summaryMetrics.netPresentValue,
      warnings: this.warnings.map(w => w.message),
      suggestions: this.generateSuggestions(monthlyBreakdowns),
      scenarioName: scenarioName || 'Timeline Scenario',

      // Timeline-specific fields
      timelineId: this.generateTimelineId(),
      monthlyBreakdowns,
      events: sortedEvents,
      
      // Summary metrics
      totalInterestPaid: summaryMetrics.totalInterestPaid,
      totalPrincipalPaid: summaryMetrics.totalPrincipalPaid,
      totalCashFlowGenerated: summaryMetrics.totalCashFlowGenerated,
      payoffMonth: summaryMetrics.payoffMonth,
      
      // Metadata
      complexity: this.determineComplexity(events),
      createdAt: new Date(),
      lastModified: new Date(),
      
      // Validation
      hasErrors: this.errors.length > 0,
      errors: this.errors,
      warnings: this.warnings,
    };

    return scenario;
  }

  /**
   * Initialize timeline state từ inputs
   */
  private initializeTimelineState(inputs: RealEstateInputs) {
    const initialLoanAmount = inputs.giaTriBDS * (inputs.tyLeVay / 100);
    
    return {
      // === LOAN STATE ===
      currentLoanBalance: 0, // Sẽ tăng khi có disbursement
      totalDisbursed: 0,
      currentInterestRate: inputs.laiSuatUuDai,
      currentMonthlyPayment: 0,
      
      // === CASH FLOW STATE ===
      currentRentalIncome: inputs.tienThueThang,
      currentPersonalIncome: inputs.thuNhapKhac || 0,
      currentPersonalExpenses: inputs.chiPhiSinhHoat || 0,
      currentOperatingExpenses: inputs.phiQuanLy,
      
      // === PAYMENT STATE ===
      isInGracePeriod: false,
      gracePeriodEndMonth: 0,
      hasStartedPayments: false,
      
      // === CUMULATIVE STATE ===
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      totalCashFlowGenerated: 0,
      
      // === FEE STATE ===
      currentPenaltyRate: 0,
      feeScheduleActive: false,
    };
  }

  /**
   * Generate monthly breakdowns for entire timeline
   */
  private async generateMonthlyBreakdowns(
    inputs: RealEstateInputs,
    events: TimelineEvent[],
    initialState: any
  ): Promise<MonthlyBreakdown[]> {
    const breakdowns: MonthlyBreakdown[] = [];
    let currentState = { ...initialState };

    // Group events by month cho efficient processing
    const eventsByMonth = this.groupEventsByMonth(events);

    for (let month = 1; month <= this.config.totalMonths; month++) {
      // Process events for this month
      const monthEvents = eventsByMonth[month] || [];
      currentState = await this.processMonthEvents(
        month, 
        monthEvents, 
        currentState, 
        inputs
      );

      // Calculate monthly values
      const monthlyBreakdown = this.calculateMonthlyBreakdown(
        month,
        currentState,
        monthEvents,
        inputs
      );

      // Update cumulative state
      currentState = this.updateCumulativeState(currentState, monthlyBreakdown);

      breakdowns.push(monthlyBreakdown);

      // Performance optimization: yield control periodically
      if (month % 24 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return breakdowns;
  }

  /**
   * Process tất cả events trong một tháng
   */
  private async processMonthEvents(
    month: number,
    events: TimelineEvent[],
    currentState: any,
    inputs: RealEstateInputs
  ): Promise<any> {
    let newState = { ...currentState };

    for (const event of events) {
      newState = await this.processEvent(event, newState, inputs, month);
    }

    return newState;
  }

  /**
   * Process single event và update state
   */
  private async processEvent(
    event: TimelineEvent,
    currentState: any,
    inputs: RealEstateInputs,
    month: number
  ): Promise<any> {
    const newState = { ...currentState };

    switch (event.type) {
      case TimelineEventType.CASH_PAYMENT:
        // Cash payment doesn't affect loan state, only cash flow
        break;

      case TimelineEventType.LOAN_DISBURSEMENT:
        const disbursementEvent = event as any; // Type assertion cho typescript
        newState.currentLoanBalance += disbursementEvent.amount;
        newState.totalDisbursed += disbursementEvent.amount;
        newState.currentInterestRate = disbursementEvent.interestRate;
        
        // Recalculate monthly payment if not in grace period
        if (!newState.isInGracePeriod) {
          newState.currentMonthlyPayment = this.calculateMonthlyPayment(
            newState.currentLoanBalance,
            newState.currentInterestRate,
            inputs.thoiGianVay,
            month
          );
        }
        break;

      case TimelineEventType.START_LOAN_PAYMENTS:
        const startPaymentEvent = event as any;
        newState.hasStartedPayments = true;
        newState.isInGracePeriod = false;
        newState.currentMonthlyPayment = startPaymentEvent.monthlyPayment;
        break;

      case TimelineEventType.PRINCIPAL_GRACE_PERIOD:
        const graceEvent = event as any;
        newState.isInGracePeriod = true;
        newState.gracePeriodEndMonth = month + graceEvent.durationMonths - 1;
        newState.currentMonthlyPayment = graceEvent.interestOnlyPayment;
        break;

      case TimelineEventType.EARLY_PAYMENT:
        const earlyPaymentEvent = event as any;
        newState.currentLoanBalance = Math.max(
          0, 
          newState.currentLoanBalance - earlyPaymentEvent.amount
        );
        
        // Recalculate monthly payment với loan balance mới
        if (newState.currentLoanBalance > 0) {
          newState.currentMonthlyPayment = this.calculateMonthlyPayment(
            newState.currentLoanBalance,
            newState.currentInterestRate,
            inputs.thoiGianVay,
            month
          );
        } else {
          newState.currentMonthlyPayment = 0;
        }
        break;

      case TimelineEventType.INTEREST_RATE_CHANGE:
        const rateChangeEvent = event as any;
        newState.currentInterestRate = rateChangeEvent.newRate;
        
        // Recalculate monthly payment với lãi suất mới
        if (newState.currentLoanBalance > 0 && !newState.isInGracePeriod) {
          newState.currentMonthlyPayment = this.calculateMonthlyPayment(
            newState.currentLoanBalance,
            newState.currentInterestRate,
            inputs.thoiGianVay,
            month
          );
        }
        break;

      case TimelineEventType.CASH_FLOW_UPDATE:
        const cashFlowEvent = event as any;
        newState.currentRentalIncome += cashFlowEvent.rentalIncomeChange || 0;
        newState.currentPersonalIncome += cashFlowEvent.incomeChange || 0;
        newState.currentPersonalExpenses += cashFlowEvent.expenseChange || 0;
        break;

      case TimelineEventType.PHASED_DISBURSEMENT:
        const phasedEvent = event as any;
        newState.currentLoanBalance += phasedEvent.amount;
        newState.totalDisbursed += phasedEvent.amount;
        
        // Interest chỉ tính trên số đã giải ngân
        if (phasedEvent.interestOnDisbursedAmount) {
          // Monthly payment sẽ được tính dựa trên totalDisbursed
          newState.currentMonthlyPayment = this.calculateMonthlyPayment(
            newState.totalDisbursed,
            newState.currentInterestRate,
            inputs.thoiGianVay,
            month
          );
        }
        break;

      case TimelineEventType.PAYMENT_FEE_SCHEDULE:
        const feeEvent = event as any;
        newState.feeScheduleActive = true;
        // Fee schedule sẽ được apply khi có early payments
        break;
    }

    // Check và end grace period nếu đến hạn
    if (newState.isInGracePeriod && month >= newState.gracePeriodEndMonth) {
      newState.isInGracePeriod = false;
      newState.currentMonthlyPayment = this.calculateMonthlyPayment(
        newState.currentLoanBalance,
        newState.currentInterestRate,
        inputs.thoiGianVay,
        month
      );
    }

    return newState;
  }

  /**
   * Calculate monthly breakdown cho một tháng
   */
  private calculateMonthlyBreakdown(
    month: number,
    currentState: any,
    events: TimelineEvent[],
    inputs: RealEstateInputs
  ): MonthlyBreakdown {
    // Calculate loan payments
    const monthlyInterestRate = currentState.currentInterestRate / 100 / 12;
    const interestPayment = currentState.currentLoanBalance * monthlyInterestRate;
    const principalPayment = currentState.isInGracePeriod ? 
      0 : 
      Math.max(0, currentState.currentMonthlyPayment - interestPayment);
    
    // Calculate operating expenses
    const operatingExpenses = this.calculateOperatingExpenses(inputs, month);
    
    // Calculate net cash flow
    const effectiveRentalIncome = currentState.currentRentalIncome * (inputs.tyLeLapDay / 100);
    const netPropertyCashFlow = effectiveRentalIncome - currentState.currentMonthlyPayment - operatingExpenses;
    const finalCashFlow = netPropertyCashFlow + currentState.currentPersonalIncome - currentState.currentPersonalExpenses;

    // Calculate ratios
    const totalIncome = currentState.currentPersonalIncome + effectiveRentalIncome;
    const debtServiceRatio = totalIncome > 0 ? (currentState.currentMonthlyPayment / totalIncome) * 100 : 0;

    return {
      month,
      year: Math.ceil(month / 12),
      
      // Loan details
      loanBalance: currentState.currentLoanBalance,
      principalPayment,
      interestPayment,
      totalLoanPayment: currentState.currentMonthlyPayment,
      remainingBalance: Math.max(0, currentState.currentLoanBalance - principalPayment),
      interestRate: currentState.currentInterestRate,
      
      // Cash flow
      rentalIncome: effectiveRentalIncome,
      operatingExpenses,
      netPropertyCashFlow,
      
      // Personal finance
      personalIncome: currentState.currentPersonalIncome,
      personalExpenses: currentState.currentPersonalExpenses,
      finalCashFlow,
      
      // Events
      events,
      hasEvents: events.length > 0,
      
      // Cumulative metrics (sẽ được update sau)
      cumulativeInterestPaid: currentState.totalInterestPaid + interestPayment,
      cumulativePrincipalPaid: currentState.totalPrincipalPaid + principalPayment,
      cumulativeCashFlow: currentState.totalCashFlowGenerated + finalCashFlow,
      
      // Ratios
      debtServiceRatio,
      occupancyRate: inputs.tyLeLapDay,
      
      // Tax & fees
      taxPayable: this.calculateTax(effectiveRentalIncome, inputs.thueSuatChoThue),
      penalties: this.calculatePenalties(events, currentState),
      otherFees: 0,
    };
  }

  // ===== HELPER METHODS =====

  /**
   * Calculate monthly payment using existing PMT function
   */
  private calculateMonthlyPayment(
    loanAmount: number,
    interestRate: number,
    loanTermYears: number,
    currentMonth: number
  ): number {
    const remainingMonths = (loanTermYears * 12) - currentMonth + 1;
    if (remainingMonths <= 0 || loanAmount <= 0) return 0;
    
    return Math.abs(calculatePMT(interestRate, remainingMonths, loanAmount));
  }

  /**
   * Calculate operating expenses for a month
   */
  private calculateOperatingExpenses(inputs: RealEstateInputs, month: number): number {
    const yearlyMaintenance = inputs.giaTriBDS * (inputs.phiBaoTri / 100);
    const yearlyCapEx = inputs.giaTriBDS * (inputs.duPhongCapEx / 100);
    const yearlyInsurance = inputs.giaTriBDS * (inputs.baoHiemTaiSan / 100);
    
    return (yearlyMaintenance + yearlyCapEx + yearlyInsurance) / 12 + inputs.phiQuanLy;
  }

  /**
   * Calculate tax for rental income
   */
  private calculateTax(rentalIncome: number, taxRate: number): number {
    return rentalIncome * (taxRate / 100);
  }

  /**
   * Calculate penalties from early payment events
   */
  private calculatePenalties(events: TimelineEvent[], currentState: any): number {
    return events
      .filter(e => e.type === TimelineEventType.EARLY_PAYMENT)
      .reduce((total, event: any) => total + (event.penaltyFee || 0), 0);
  }

  /**
   * Group events by month for efficient processing
   */
  private groupEventsByMonth(events: TimelineEvent[]): { [month: number]: TimelineEvent[] } {
    return events.reduce((groups, event) => {
      const month = event.month;
      if (!groups[month]) groups[month] = [];
      groups[month].push(event);
      return groups;
    }, {} as { [month: number]: TimelineEvent[] });
  }

  // ===== VALIDATION METHODS =====

  /**
   * Validate inputs
   */
  private validateInputs(inputs: RealEstateInputs): void {
    if (!inputs.giaTriBDS || inputs.giaTriBDS <= 0) {
      this.errors.push({
        type: 'FINANCIAL_ERROR',
        message: 'Giá trị bất động sản phải lớn hơn 0',
        affectedMonths: [],
        affectedEvents: [],
        severity: 'HIGH'
      });
    }

    if (!inputs.thoiGianVay || inputs.thoiGianVay <= 0) {
      this.errors.push({
        type: 'FINANCIAL_ERROR',
        message: 'Thời gian vay phải lớn hơn 0',
        affectedMonths: [],
        affectedEvents: [],
        severity: 'HIGH'
      });
    }
  }

  /**
   * Validate events
   */
  private validateEvents(events: TimelineEvent[]): void {
    // Validate individual events
    events.forEach(event => this.validateEvent(event));
    
    // Validate business logic rules
    Object.values(GLOBAL_VALIDATION_RULES).forEach(rule => {
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
  }

  /**
   * Validate single event
   */
  private validateEvent(event: TimelineEvent): void {
    if (event.month < 1 || event.month > this.config.totalMonths) {
      this.errors.push({
        type: 'DATE_CONFLICT',
        message: `Event ${event.name} có tháng không hợp lệ: ${event.month}`,
        affectedMonths: [event.month],
        affectedEvents: [event.id],
        severity: 'HIGH'
      });
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Update cumulative state
   */
  private updateCumulativeState(currentState: any, breakdown: MonthlyBreakdown): any {
    return {
      ...currentState,
      totalInterestPaid: breakdown.cumulativeInterestPaid,
      totalPrincipalPaid: breakdown.cumulativePrincipalPaid,
      totalCashFlowGenerated: breakdown.cumulativeCashFlow,
      currentLoanBalance: breakdown.remainingBalance,
    };
  }

  /**
   * Extract calculation steps from first month
   */
  private extractCalculationSteps(firstMonth: MonthlyBreakdown): CalculationSteps {
    return {
      soTienVay: firstMonth.loanBalance,
      vonTuCo: 0, // Will be calculated from inputs
      tongVonBanDau: 0,
      tienTraNHThang: firstMonth.totalLoanPayment,
      chiPhiBaoTriThang: 0,
      duPhongCapExThang: 0,
      baoHiemTaiSanThang: 0,
      tongChiPhiVanHanh: firstMonth.operatingExpenses,
      thuNhapThueHieuDung: firstMonth.rentalIncome,
      thueChoThue_Thang: firstMonth.taxPayable,
      dongTienRongBDS: firstMonth.netPropertyCashFlow,
      dongTienCuoiCung: firstMonth.finalCashFlow,
    };
  }

  /**
   * Calculate summary metrics
   */
  private calculateSummaryMetrics(breakdowns: MonthlyBreakdown[]) {
    const totalInterestPaid = breakdowns[breakdowns.length - 1]?.cumulativeInterestPaid || 0;
    const totalPrincipalPaid = breakdowns[breakdowns.length - 1]?.cumulativePrincipalPaid || 0;
    const totalCashFlowGenerated = breakdowns[breakdowns.length - 1]?.cumulativeCashFlow || 0;
    
    // Find payoff month (when loan balance reaches 0)
    const payoffMonth = breakdowns.findIndex(b => b.remainingBalance <= 0) + 1;
    
    // Calculate average annual ROI
    const totalInvested = totalPrincipalPaid + totalInterestPaid;
    const averageAnnualROI = totalInvested > 0 ? 
      ((totalCashFlowGenerated / totalInvested) * 100) / (this.config.totalMonths / 12) : 0;
    
    // Simple NPV calculation
    const discountRate = 0.08; // 8% discount rate
    const netPresentValue = breakdowns.reduce((npv, breakdown, index) => {
      const monthlyRate = discountRate / 12;
      const discountFactor = Math.pow(1 + monthlyRate, -(index + 1));
      return npv + (breakdown.finalCashFlow * discountFactor);
    }, 0);

    return {
      totalInterestPaid,
      totalPrincipalPaid,
      totalCashFlowGenerated,
      payoffMonth: payoffMonth || this.config.totalMonths,
      averageAnnualROI,
      netPresentValue,
      paybackPeriodYears: payoffMonth ? payoffMonth / 12 : this.config.totalMonths / 12,
    };
  }

  /**
   * Generate suggestions based on timeline analysis
   */
  private generateSuggestions(breakdowns: MonthlyBreakdown[]): string[] {
    const suggestions: string[] = [];

    // Check for negative cash flow months
    const negativeCashFlowMonths = breakdowns.filter(b => b.finalCashFlow < 0).length;
    if (negativeCashFlowMonths > 12) {
      suggestions.push('Cân nhắc tăng thu nhập thuê hoặc giảm chi phí để cải thiện dòng tiền');
    }

    // Check for high debt service ratio
    const highDebtServiceMonths = breakdowns.filter(b => b.debtServiceRatio > 50).length;
    if (highDebtServiceMonths > 24) {
      suggestions.push('Tỷ lệ thanh toán nợ cao, cân nhắc trả nợ trước hạn để giảm rủi ro');
    }

    return suggestions;
  }

  /**
   * Determine scenario complexity
   */
  private determineComplexity(events: TimelineEvent[]): 'BASIC' | 'ADVANCED' {
    const advancedEventTypes = [
      TimelineEventType.PHASED_DISBURSEMENT,
      TimelineEventType.CASH_FLOW_UPDATE,
      TimelineEventType.PAYMENT_FEE_SCHEDULE
    ];
    
    const hasAdvancedEvents = events.some(e => advancedEventTypes.includes(e.type));
    return hasAdvancedEvents || events.length > 5 ? 'ADVANCED' : 'BASIC';
  }

  /**
   * Generate unique timeline ID
   */
  private generateTimelineId(): string {
    return `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ===== EXPORT =====
export { TimelineSimulationEngine };

/**
 * Factory function để tạo timeline simulation
 */
export async function createTimelineScenario(
  inputs: RealEstateInputs,
  events: TimelineEvent[],
  scenarioName?: string,
  config?: Partial<TimelineSimulationConfig>
): Promise<TimelineScenario> {
  const engine = new TimelineSimulationEngine(config);
  return await engine.simulateTimeline(inputs, events, scenarioName);
}

/**
 * Helper function để validate timeline events
 */
export function validateTimelineEvents(events: TimelineEvent[]): {
  isValid: boolean;
  errors: TimelineValidationError[];
  warnings: TimelineValidationWarning[];
} {
  const engine = new TimelineSimulationEngine();
  const errors: TimelineValidationError[] = [];
  const warnings: TimelineValidationWarning[] = [];

  // Validate using engine's validation methods
  try {
    // This will populate engine's internal errors/warnings
    (engine as any).validateEvents(events);
    errors.push(...(engine as any).errors);
    warnings.push(...(engine as any).warnings);
  } catch (error) {
    errors.push({
      type: 'LOGIC_ERROR',
      message: error instanceof Error ? error.message : 'Unknown validation error',
      affectedMonths: [],
      affectedEvents: [],
      severity: 'HIGH'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}