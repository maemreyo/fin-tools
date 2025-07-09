/**
 * TIMELINE INTEGRATION UTILITIES
 * Seamless integration between Timeline System và existing calculator
 */

import { 
  RealEstateInputs, 
  CalculationResult,
  PresetScenario 
} from '@/types/real-estate';
import {
  TimelineScenario,
  TimelineEvent,
  TimelineEventType,
  MonthlyBreakdown
} from '@/types/timeline';
import {
  TimelineEnabledInputs,
  TimelineAwareResult,
  TimelinePresetScenario,
  LegacyToTimelineUpgrade,
  SuggestedEvent
} from '@/types/timeline-integration';
import { calculateRealEstateInvestment } from './real-estate-calculator';
import { TimelineSimulationEngine, createTimelineScenario } from './timeline-engine';
import { EVENT_TEMPLATES, getEventTemplate, TIMELINE_CONFIG } from './timeline-constants';

// ===== CALCULATOR INTEGRATION =====

/**
 * Enhanced calculator that supports both legacy and timeline modes
 */
export class IntegratedRealEstateCalculator {
  
  /**
   * Calculate with timeline support
   */
  static async calculateWithTimeline(
    inputs: TimelineEnabledInputs,
    events?: TimelineEvent[]
  ): Promise<TimelineAwareResult> {
    // First, run legacy calculation for backward compatibility
    const legacyResult = calculateRealEstateInvestment(inputs);

    // If timeline is not enabled, return enhanced legacy result
    if (!inputs.enableTimeline) {
      return this.enhanceLegacyResult(legacyResult, inputs);
    }

    // Generate initial events if not provided
    const timelineEvents = events || this.generateInitialEvents(inputs);

    // Run timeline simulation
    const timelineScenario = await createTimelineScenario(
      inputs,
      timelineEvents,
      inputs.scenarioName || 'Timeline Scenario'
    );

    // Create timeline-aware result
    return this.createTimelineAwareResult(legacyResult, timelineScenario, inputs);
  }

  /**
   * Upgrade legacy calculation to timeline
   */
  static async upgradeLegacyToTimeline(
    legacyResult: CalculationResult,
    upgradeStrategy: 'SIMPLE_PROJECTION' | 'EVENT_BASED' | 'ADVANCED_MODELING' = 'EVENT_BASED'
  ): Promise<LegacyToTimelineUpgrade> {
    const inputs = legacyResult.inputs;
    
    // Generate events based on upgrade strategy
    const generatedEvents = this.generateEventsFromLegacy(inputs, upgradeStrategy);
    
    // Create timeline scenario
    const upgradedScenario = await createTimelineScenario(
      inputs,
      generatedEvents,
      `Upgraded: ${legacyResult.scenarioName || 'Legacy Scenario'}`
    );

    // Calculate accuracy score
    const conversionAccuracy = this.calculateConversionAccuracy(legacyResult, upgradedScenario);

    return {
      originalResult: legacyResult,
      upgradeStrategy,
      generatedEvents,
      monthlyProjection: upgradedScenario.monthlyBreakdowns,
      dataQuality: conversionAccuracy > 85 ? 'HIGH' : conversionAccuracy > 70 ? 'MEDIUM' : 'LOW',
      assumptions: this.getUpgradeAssumptions(upgradeStrategy),
      userVerificationNeeded: this.getUserVerificationNeeded(upgradeStrategy),
      upgradedScenario,
      conversionAccuracy
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Enhance legacy result with timeline preview
   */
  private static enhanceLegacyResult(
    legacyResult: CalculationResult,
    inputs: TimelineEnabledInputs
  ): TimelineAwareResult {
    // Generate 12-month preview using simple projection
    const monthlyPreview = this.generateSimpleMonthlyPreview(legacyResult, inputs);
    
    // Calculate timeline metrics
    const timelineMetrics = this.calculateTimelineMetrics(legacyResult, inputs);
    
    // Generate suggested events
    const suggestedEvents = this.generateSuggestedEvents(legacyResult, inputs);

    return {
      ...legacyResult,
      monthlyPreview,
      timelineMetrics,
      suggestedEvents,
      canUpgradeToTimeline: true,
      upgradeComplexity: this.determineUpgradeComplexity(inputs),
      upgradeRequiredData: this.getUpgradeRequiredData(inputs)
    };
  }

  /**
   * Create timeline-aware result
   */
  private static createTimelineAwareResult(
    legacyResult: CalculationResult,
    timelineScenario: TimelineScenario,
    inputs: TimelineEnabledInputs
  ): TimelineAwareResult {
    // Extract first 12 months for preview
    const monthlyPreview = timelineScenario.monthlyBreakdowns.slice(0, 12);
    
    // Calculate timeline metrics from full scenario
    const timelineMetrics = {
      totalProjectedInterest: timelineScenario.totalInterestPaid,
      averageMonthlyPayment: this.calculateAverageMonthlyPayment(timelineScenario.monthlyBreakdowns),
      cashFlowBreakeven: this.findCashFlowBreakeven(timelineScenario.monthlyBreakdowns),
      payoffProjection: timelineScenario.payoffMonth
    };

    return {
      ...legacyResult,
      monthlyPreview,
      timelineMetrics,
      suggestedEvents: [], // Timeline already has events
      canUpgradeToTimeline: false, // Already a timeline result
      upgradeComplexity: 'SIMPLE',
      upgradeRequiredData: []
    };
  }

  /**
   * Generate initial events from inputs
   */
  private static generateInitialEvents(inputs: TimelineEnabledInputs): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // Add initial cash payment if specified
    if (inputs.initialCashPayment) {
      events.push({
        id: `cash-payment-${Date.now()}`,
        month: inputs.initialCashPayment.month,
        type: TimelineEventType.CASH_PAYMENT,
        name: 'Initial Cash Payment',
        description: 'Initial cash payment for property purchase',
        createdAt: new Date(),
        isActive: true,
        amount: inputs.initialCashPayment.amount,
        purpose: inputs.initialCashPayment.purpose,
        affectsCashFlow: false
      } as any);
    }

    // Add loan disbursement events
    if (inputs.loanDisbursementSchedule) {
      inputs.loanDisbursementSchedule.forEach((disbursement, index) => {
        events.push({
          id: `disbursement-${index}-${Date.now()}`,
          month: disbursement.month,
          type: disbursement.isPhased ? TimelineEventType.PHASED_DISBURSEMENT : TimelineEventType.LOAN_DISBURSEMENT,
          name: disbursement.isPhased ? `Phased Disbursement ${index + 1}` : `Loan Disbursement ${index + 1}`,
          description: `Loan disbursement of ${disbursement.amount.toLocaleString('vi-VN')} VND`,
          createdAt: new Date(),
          isActive: true,
          amount: disbursement.amount,
          interestRate: inputs.laiSuatUuDai,
          loanBalance: disbursement.amount // Will be recalculated
        } as any);
      });
    } else {
      // Default single disbursement
      const loanAmount = inputs.giaTriBDS * (inputs.tyLeVay / 100);
      events.push({
        id: `disbursement-default-${Date.now()}`,
        month: 1,
        type: TimelineEventType.LOAN_DISBURSEMENT,
        name: 'Loan Disbursement',
        description: `Full loan disbursement of ${loanAmount.toLocaleString('vi-VN')} VND`,
        createdAt: new Date(),
        isActive: true,
        amount: loanAmount,
        interestRate: inputs.laiSuatUuDai,
        loanBalance: loanAmount
      } as any);
    }

    // Add start payments event
    const paymentStartMonth = inputs.defaultGracePeriod ? inputs.defaultGracePeriod + 1 : 2;
    events.push({
      id: `start-payments-${Date.now()}`,
      month: paymentStartMonth,
      type: TimelineEventType.START_LOAN_PAYMENTS,
      name: 'Start Loan Payments',
      description: 'Begin regular principal and interest payments',
      createdAt: new Date(),
      isActive: true,
      monthlyPayment: 0, // Will be calculated
      interestRate: inputs.laiSuatUuDai,
      remainingMonths: inputs.thoiGianVay * 12 - paymentStartMonth,
      paymentType: 'principal_and_interest'
    } as any);

    // Add grace period if specified
    if (inputs.defaultGracePeriod && inputs.defaultGracePeriod > 0) {
      events.push({
        id: `grace-period-${Date.now()}`,
        month: 1,
        type: TimelineEventType.PRINCIPAL_GRACE_PERIOD,
        name: 'Principal Grace Period',
        description: `Interest-only payments for ${inputs.defaultGracePeriod} months`,
        createdAt: new Date(),
        isActive: true,
        durationMonths: inputs.defaultGracePeriod,
        interestOnlyPayment: 0, // Will be calculated
        endMonth: inputs.defaultGracePeriod
      } as any);
    }

    // Add interest rate change when promotion ends
    if (inputs.thoiGianUuDai && inputs.thoiGianUuDai > 0) {
      events.push({
        id: `rate-change-${Date.now()}`,
        month: inputs.thoiGianUuDai + 1,
        type: TimelineEventType.INTEREST_RATE_CHANGE,
        name: 'Promotional Rate Ends',
        description: `Interest rate changes from ${inputs.laiSuatUuDai}% to ${inputs.laiSuatThaNoi}%`,
        createdAt: new Date(),
        isActive: true,
        newRate: inputs.laiSuatThaNoi,
        oldRate: inputs.laiSuatUuDai,
        reason: 'promotion_end',
        newMonthlyPayment: 0 // Will be calculated
      } as any);
    }

    return events;
  }

  /**
   * Generate events from legacy calculation
   */
  private static generateEventsFromLegacy(
    inputs: RealEstateInputs,
    strategy: 'SIMPLE_PROJECTION' | 'EVENT_BASED' | 'ADVANCED_MODELING'
  ): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    switch (strategy) {
      case 'SIMPLE_PROJECTION':
        // Basic events based on inputs
        events.push(...this.generateBasicEvents(inputs));
        break;

      case 'EVENT_BASED':
        // More sophisticated events
        events.push(...this.generateBasicEvents(inputs));
        events.push(...this.generateRecommendedEvents(inputs));
        break;

      case 'ADVANCED_MODELING':
        // Full event modeling with optimization
        events.push(...this.generateBasicEvents(inputs));
        events.push(...this.generateRecommendedEvents(inputs));
        events.push(...this.generateOptimizationEvents(inputs));
        break;
    }

    return events;
  }

  private static generateBasicEvents(inputs: RealEstateInputs): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // Loan disbursement
    const loanAmount = inputs.giaTriBDS * (inputs.tyLeVay / 100);
    events.push({
      id: `auto-disbursement-${Date.now()}`,
      month: 1,
      type: TimelineEventType.LOAN_DISBURSEMENT,
      name: 'Auto-generated: Loan Disbursement',
      createdAt: new Date(),
      isActive: true,
      amount: loanAmount,
      interestRate: inputs.laiSuatUuDai,
      loanBalance: loanAmount
    } as any);

    // Start payments
    events.push({
      id: `auto-payments-${Date.now()}`,
      month: 2,
      type: TimelineEventType.START_LOAN_PAYMENTS,
      name: 'Auto-generated: Start Payments',
      createdAt: new Date(),
      isActive: true,
      monthlyPayment: 0, // Will be calculated
      interestRate: inputs.laiSuatUuDai,
      remainingMonths: inputs.thoiGianVay * 12 - 1,
      paymentType: 'principal_and_interest'
    } as any);

    // Rate change
    if (inputs.thoiGianUuDai > 0) {
      events.push({
        id: `auto-rate-change-${Date.now()}`,
        month: inputs.thoiGianUuDai + 1,
        type: TimelineEventType.INTEREST_RATE_CHANGE,
        name: 'Auto-generated: Rate Change',
        createdAt: new Date(),
        isActive: true,
        newRate: inputs.laiSuatThaNoi,
        oldRate: inputs.laiSuatUuDai,
        reason: 'promotion_end',
        newMonthlyPayment: 0
      } as any);
    }

    return events;
  }

  private static generateRecommendedEvents(inputs: RealEstateInputs): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // Rental income increases every 2 years
    for (let year = 2; year <= 20; year += 2) {
      const month = year * 12;
      if (month <= TIMELINE_CONFIG.TOTAL_MONTHS) {
        events.push({
          id: `auto-rent-increase-${year}-${Date.now()}`,
          month,
          type: TimelineEventType.CASH_FLOW_UPDATE,
          name: `Auto-generated: Rent Increase Year ${year}`,
          createdAt: new Date(),
          isActive: true,
          incomeChange: 0,
          expenseChange: 0,
          rentalIncomeChange: inputs.tienThueThang * 0.05, // 5% increase
          changeType: 'rent_increase',
          changePercent: 5
        } as any);
      }
    }

    return events;
  }

  private static generateOptimizationEvents(inputs: RealEstateInputs): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // Early payment optimization
    const disposableIncome = (inputs.thuNhapKhac || 0) - (inputs.chiPhiSinhHoat || 0);
    if (disposableIncome > 10000000) { // 10M VND disposable income
      // Suggest early payment in year 3 and 5
      [36, 60].forEach(month => {
        const earlyPaymentAmount = Math.min(500000000, disposableIncome * 6); // 6 months savings
        events.push({
          id: `auto-early-payment-${month}-${Date.now()}`,
          month,
          type: TimelineEventType.EARLY_PAYMENT,
          name: `Auto-generated: Early Payment Month ${month}`,
          createdAt: new Date(),
          isActive: true,
          amount: earlyPaymentAmount,
          penaltyFee: 0,
          penaltyRate: 1,
          newLoanBalance: 0, // Will be calculated
          newMonthlyPayment: 0 // Will be calculated
        } as any);
      });
    }

    return events;
  }

  // ===== UTILITY METHODS =====

  private static generateSimpleMonthlyPreview(
    result: CalculationResult,
    inputs: TimelineEnabledInputs
  ): MonthlyBreakdown[] {
    const preview: MonthlyBreakdown[] = [];
    const loanAmount = inputs.giaTriBDS * (inputs.tyLeVay / 100);
    let remainingBalance = loanAmount;

    for (let month = 1; month <= 12; month++) {
      const isPreferentialPeriod = month <= (inputs.thoiGianUuDai || 0);
      const interestRate = isPreferentialPeriod ? inputs.laiSuatUuDai : inputs.laiSuatThaNoi;
      const monthlyInterestRate = interestRate / 100 / 12;
      const interestPayment = remainingBalance * monthlyInterestRate;
      const principalPayment = result.steps.tienTraNHThang - interestPayment;
      
      remainingBalance = Math.max(0, remainingBalance - principalPayment);

      preview.push({
        month,
        year: Math.ceil(month / 12),
        loanBalance: remainingBalance + principalPayment,
        principalPayment,
        interestPayment,
        totalLoanPayment: result.steps.tienTraNHThang,
        remainingBalance,
        interestRate,
        rentalIncome: result.steps.thuNhapThueHieuDung,
        operatingExpenses: result.steps.tongChiPhiVanHanh - result.steps.tienTraNHThang,
        netPropertyCashFlow: result.steps.dongTienRongBDS,
        personalIncome: inputs.thuNhapKhac || 0,
        personalExpenses: inputs.chiPhiSinhHoat || 0,
        finalCashFlow: result.steps.dongTienCuoiCung,
        events: [],
        hasEvents: false,
        cumulativeInterestPaid: interestPayment * month,
        cumulativePrincipalPaid: principalPayment * month,
        cumulativeCashFlow: result.steps.dongTienCuoiCung * month,
        debtServiceRatio: 0,
        occupancyRate: inputs.tyLeLapDay,
        taxPayable: result.steps.thueChoThue_Thang,
        penalties: 0,
        otherFees: 0
      });
    }

    return preview;
  }

  private static calculateTimelineMetrics(
    result: CalculationResult,
    inputs: TimelineEnabledInputs
  ) {
    const totalMonths = inputs.thoiGianVay * 12;
    const loanAmount = inputs.giaTriBDS * (inputs.tyLeVay / 100);
    
    // Rough estimation using existing calculation
    const totalInterestPaid = (result.steps.tienTraNHThang * totalMonths) - loanAmount;
    
    return {
      totalProjectedInterest: totalInterestPaid,
      averageMonthlyPayment: result.steps.tienTraNHThang,
      cashFlowBreakeven: result.steps.dongTienRongBDS > 0 ? 1 : totalMonths,
      payoffProjection: totalMonths
    };
  }

  private static generateSuggestedEvents(
    result: CalculationResult,
    inputs: TimelineEnabledInputs
  ): SuggestedEvent[] {
    const suggestions: SuggestedEvent[] = [];

    // Suggest early payment if cash flow is positive
    if (result.steps.dongTienRongBDS > 0) {
      suggestions.push({
        type: TimelineEventType.EARLY_PAYMENT,
        suggestedMonth: 36, // Year 3
        reasoning: 'Positive cash flow allows for early payment to reduce total interest',
        estimatedImpact: {
          cashFlowChange: 0,
          totalSavings: result.steps.dongTienRongBDS * 12 * 0.3, // 30% of annual cash flow
          riskReduction: 'MEDIUM'
        },
        difficulty: 'EASY',
        templateData: {
          type: TimelineEventType.EARLY_PAYMENT,
          amount: result.steps.dongTienRongBDS * 6, // 6 months of cash flow
          penaltyRate: 1
        }
      });
    }

    // Suggest rent increases
    suggestions.push({
      type: TimelineEventType.CASH_FLOW_UPDATE,
      suggestedMonth: 24, // Year 2
      reasoning: 'Regular rent increases help maintain returns against inflation',
      estimatedImpact: {
        cashFlowChange: inputs.tienThueThang * 0.05, // 5% increase
        totalSavings: inputs.tienThueThang * 0.05 * 12 * 18, // Over remaining 18 years
        riskReduction: 'LOW'
      },
      difficulty: 'MODERATE',
      templateData: {
        type: TimelineEventType.CASH_FLOW_UPDATE,
        changeType: 'rent_increase',
        rentalIncomeChange: inputs.tienThueThang * 0.05,
        changePercent: 5
      }
    });

    return suggestions;
  }

  private static calculateAverageMonthlyPayment(breakdowns: MonthlyBreakdown[]): number {
    const totalPayments = breakdowns.reduce((sum, month) => sum + month.totalLoanPayment, 0);
    return totalPayments / breakdowns.length;
  }

  private static findCashFlowBreakeven(breakdowns: MonthlyBreakdown[]): number {
    const positiveMonth = breakdowns.find(month => month.finalCashFlow >= 0);
    return positiveMonth ? positiveMonth.month : TIMELINE_CONFIG.TOTAL_MONTHS;
  }

  private static calculateConversionAccuracy(
    legacyResult: CalculationResult,
    timelineScenario: TimelineScenario
  ): number {
    // Compare key metrics
    const legacyROI = legacyResult.roiHangNam;
    const timelineROI = timelineScenario.roiHangNam;
    const roiAccuracy = 100 - Math.abs(legacyROI - timelineROI) / legacyROI * 100;

    const legacyCashFlow = legacyResult.steps.dongTienRongBDS;
    const timelineFirstYearAvgCashFlow = timelineScenario.monthlyBreakdowns
      .slice(0, 12)
      .reduce((sum, month) => sum + month.netPropertyCashFlow, 0) / 12;
    const cashFlowAccuracy = 100 - Math.abs(legacyCashFlow - timelineFirstYearAvgCashFlow) / Math.abs(legacyCashFlow) * 100;

    return (roiAccuracy + cashFlowAccuracy) / 2;
  }

  private static getUpgradeAssumptions(strategy: string): string[] {
    const baseAssumptions = [
      'Timeline starts from month 1',
      'Initial loan disbursement in month 1',
      'Regular payments start in month 2'
    ];

    switch (strategy) {
      case 'SIMPLE_PROJECTION':
        return [...baseAssumptions, 'No optimization events included'];
      case 'EVENT_BASED':
        return [...baseAssumptions, 'Periodic rent increases assumed', 'Standard timeline events only'];
      case 'ADVANCED_MODELING':
        return [...baseAssumptions, 'Optimization events included', 'Early payment suggestions based on cash flow'];
      default:
        return baseAssumptions;
    }
  }

  private static getUserVerificationNeeded(strategy: string): string[] {
    const baseVerification = [
      'Loan disbursement timing',
      'Interest rate schedule',
      'Monthly payment amounts'
    ];

    switch (strategy) {
      case 'ADVANCED_MODELING':
        return [...baseVerification, 'Early payment feasibility', 'Rent increase assumptions'];
      default:
        return baseVerification;
    }
  }

  private static determineUpgradeComplexity(inputs: TimelineEnabledInputs): 'SIMPLE' | 'MODERATE' | 'COMPLEX' {
    let complexityScore = 0;

    if (inputs.loanDisbursementSchedule && inputs.loanDisbursementSchedule.length > 1) complexityScore += 2;
    if (inputs.defaultGracePeriod && inputs.defaultGracePeriod > 0) complexityScore += 1;
    if (inputs.thoiGianUuDai > 0) complexityScore += 1;
    if (inputs.includeInflation) complexityScore += 1;
    if (inputs.includePropertyAppreciation) complexityScore += 1;

    if (complexityScore <= 2) return 'SIMPLE';
    if (complexityScore <= 4) return 'MODERATE';
    return 'COMPLEX';
  }

  private static getUpgradeRequiredData(inputs: TimelineEnabledInputs): string[] {
    const required: string[] = [];

    if (!inputs.timelineStartDate) required.push('Timeline start date');
    if (!inputs.initialCashPayment) required.push('Initial cash payment details');
    if (!inputs.loanDisbursementSchedule) required.push('Loan disbursement schedule');

    return required;
  }
}

// ===== PRESET INTEGRATION =====

/**
 * Enhanced preset scenarios with timeline support
 */
export class TimelinePresetManager {
  
  /**
   * Convert legacy preset to timeline preset
   */
  static convertLegacyPreset(legacyPreset: PresetScenario): TimelinePresetScenario {
    // Generate timeline events for this preset
    const presetEvents = this.generatePresetEvents(legacyPreset);
    
    return {
      ...legacyPreset,
      hasTimelineEvents: presetEvents.length > 0,
      presetEvents,
      complexity: this.determinePresetComplexity(presetEvents),
      timelineCategory: this.categorizePreset(legacyPreset),
      learningPath: this.generateLearningPath(legacyPreset)
    };
  }

  private static generatePresetEvents(preset: PresetScenario): any[] {
    // Return appropriate event templates based on preset category
    switch (preset.category) {
      case 'chung-cu':
        return this.generateApartmentEvents(preset);
      case 'nha-pho':
        return this.generateTownhouseEvents(preset);
      case 'biet-thu':
        return this.generateVillaEvents(preset);
      default:
        return [];
    }
  }

  private static generateApartmentEvents(preset: PresetScenario): any[] {
    // Standard apartment investment events
    return [
      { ...getEventTemplate('down-payment-template')?.defaultValues, month: 1 },
      { ...getEventTemplate('loan-disbursement-template')?.defaultValues, month: 1 },
      { ...getEventTemplate('rent-increase-template')?.defaultValues, month: 24 }
    ].filter(Boolean);
  }

  private static generateTownhouseEvents(preset: PresetScenario): any[] {
    // Townhouse typically has renovation period
    return [
      { ...getEventTemplate('down-payment-template')?.defaultValues, month: 1 },
      { ...getEventTemplate('loan-disbursement-template')?.defaultValues, month: 1 },
      { ...getEventTemplate('early-payment-template')?.defaultValues, month: 36 }
    ].filter(Boolean);
  }

  private static generateVillaEvents(preset: PresetScenario): any[] {
    // Villa typically has more complex financing
    return [
      { ...getEventTemplate('down-payment-template')?.defaultValues, month: 1 },
      { ...getEventTemplate('phased-disbursement-template')?.defaultValues, month: 1 },
      { ...getEventTemplate('phased-disbursement-template')?.defaultValues, month: 6 },
      { ...getEventTemplate('salary-increase-template')?.defaultValues, month: 12 }
    ].filter(Boolean);
  }

  private static determinePresetComplexity(events: any[]): 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' {
    if (events.length <= 3) return 'BASIC';
    if (events.length <= 6) return 'INTERMEDIATE';
    return 'ADVANCED';
  }

  private static categorizePreset(preset: PresetScenario): any {
    // Simple categorization based on property type and inputs
    if (preset.inputs.tyLeVay && preset.inputs.tyLeVay > 80) {
      return 'FIRST_TIME_BUYER';
    }
    if (preset.inputs.tienThueThang && preset.inputs.giaTriBDS) {
      const yield = (preset.inputs.tienThueThang * 12 / preset.inputs.giaTriBDS) * 100;
      if (yield > 6) return 'INVESTMENT_FOCUSED';
    }
    return 'FLEXIBLE_CASHFLOW';
  }

  private static generateLearningPath(preset: PresetScenario): any {
    return {
      description: `Learn real estate investment through ${preset.name}`,
      keyLessons: [
        'Understanding cash flow analysis',
        'Loan payment calculations',
        'Risk management strategies',
        'Timeline planning'
      ],
      estimatedTimeToMaster: 30 // minutes
    };
  }
}

// ===== EXPORTS =====
export { IntegratedRealEstateCalculator, TimelinePresetManager };