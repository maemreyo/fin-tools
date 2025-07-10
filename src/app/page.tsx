"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  Sparkles,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import HeroSection from "@/components/HeroSection";
import { CalculationConfirmationDialog } from "@/components/CalculationConfirmationDialog";
import { PageHeader } from "@/components/PageHeader";
import { PresetScenarios } from "@/components/PresetScenarios";
import { CalculationHistory } from "@/components/CalculationHistory";
import PropertyInputForm from "@/components/PropertyInputForm";
import EnhancedCalculationResultsModal from "@/components/CalculationResultsModalEnhanced";
import EnhancedPropertyInputForm from "@/components/PropertyInputFormEnhanced";
import SaleScenarioAnalysis from "@/components/SaleScenarioAnalysis";
import EnhancedVisualComparison from "@/components/comparison/EnhancedVisualComparison";
import EconomicScenarioGeneratorUI from "@/components/comparison/EconomicScenarioGenerator";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { PRESET_SCENARIOS } from "@/constants/presetScenarios";
import {
  RealEstateInputs,
  CalculationResult,
  PresetScenario,
} from "@/types/real-estate";
import {
  RealEstateInputsWithSaleAnalysis,
  CalculationResultWithSale,
} from "@/types/sale-scenario";
import { calculateRealEstateInvestmentWithSale } from "@/lib/real-estate-calculator-enhanced";
import {
  EnhancedGeneratedScenario,
  MarketContext,
} from "@/lib/enhanced-economic-scenarios";
import { Badge } from "@/components/ui/badge";

export default function EnhancedRealEstateCalculatorPage() {
  const { appState, handleCalculate, handlePresetSelect } =
    useCalculatorState();

  // UI State
  const [showPresets, setShowPresets] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showCalculationConfirm, setShowCalculationConfirm] = useState(false);
  const [showEconomicGenerator, setShowEconomicGenerator] = useState(false);
  const [pendingCalculation, setPendingCalculation] =
    useState<RealEstateInputs | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] =
    useState<CalculationResult | null>(null);
  const [currentInputs, setCurrentInputs] = useState<RealEstateInputs | null>(
    null
  );

  // Enhanced state - NEW FOR SALE ANALYSIS
  const [useSaleAnalysis, setUseSaleAnalysis] = useState(false);
  const [saleResults, setSaleResults] =
    useState<CalculationResultWithSale | null>(null);
  const [marketContext, setMarketContext] = useState<MarketContext>({
    marketType: "secondary",
    investorType: "new_investor",
    purchaseDate: new Date(),
  });
  const [enhancedScenarios, setEnhancedScenarios] = useState<
    EnhancedGeneratedScenario[]
  >([]);

  // Refs for smooth scrolling
  const formRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  // ===== ENHANCED HANDLERS =====
  const handleCalculateWithConfirm = (inputs: RealEstateInputs) => {
    setCurrentInputs(inputs);
    setPendingCalculation(inputs);
    setShowCalculationConfirm(true);
  };

  const handleCalculateWithSaleAnalysis = (
    inputs: RealEstateInputsWithSaleAnalysis
  ) => {
    try {
      const result = calculateRealEstateInvestmentWithSale(inputs);
      setSaleResults(result);
      setCurrentInputs(inputs as RealEstateInputs);

      // Also set for legacy components
      if (result.saleAnalysis) {
        setSelectedResult(result);
        setIsModalOpen(true);
      }

      toast.success("✅ Tính toán hoàn tất với Sale Analysis!");

      // Scroll to results
      setTimeout(() => {
        comparisonRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("❌ Có lỗi trong quá trình tính toán. Vui lòng thử lại.");
    }
  };

  const handlePresetSelectWithToast = (preset: PresetScenario) => {
    handlePresetSelect(preset);
    setShowPresets(false);

    toast.success("✅ Đã tải template thành công!");
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleConfirmCalculation = async () => {
    if (pendingCalculation) {
      const result = await handleCalculate(pendingCalculation);
      setSelectedResult(result);
      setIsModalOpen(true);
      setShowCalculationConfirm(false);
      setPendingCalculation(null);

      toast.success("🎉 Phân tích hoàn tất! Xem kết quả chi tiết.");

      // Auto scroll to comparison section
      setTimeout(() => {
        comparisonRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleToggleSaleAnalysis = () => {
    setUseSaleAnalysis(!useSaleAnalysis);
    setSaleResults(null); // Clear previous results when switching modes

    toast.info(
      useSaleAnalysis
        ? "Chuyển về chế độ tính toán cơ bản"
        : "🚀 Chuyển sang chế độ Sale Analysis - Enhanced!"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Page Header */}
      <PageHeader
        calculationCount={appState.calculationHistory.length}
        hasCurrentResult={!!selectedResult || !!saleResults}
      />

      {/* Hero Section */}
      <HeroSection
        onScrollToForm={() =>
          formRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      />

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Mode Toggle Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Chế độ tính toán:</span>
            </div>
            <Button
              variant={useSaleAnalysis ? "default" : "outline"}
              onClick={handleToggleSaleAnalysis}
              className="flex items-center gap-2"
            >
              {useSaleAnalysis ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Sale Analysis Mode
                  <Badge variant="secondary">Enhanced</Badge>
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Basic Mode
                </>
              )}
            </Button>
          </div>
          {useSaleAnalysis && (
            <p className="text-sm text-muted-foreground mt-2">
              Phân tích chi tiết kịch bản bán bất động sản với dự phóng ROI và
              thời điểm tối ưu
            </p>
          )}
        </div>

        {/* Preset Scenarios Section */}
        <Collapsible open={showPresets} onOpenChange={setShowPresets}>
          <div className="text-center">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="lg" className="mb-4">
                <Building className="mr-2 h-4 w-4" />
                Template Scenarios
                {showPresets ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <PresetScenarios
              scenarios={PRESET_SCENARIOS}
              onPresetSelect={handlePresetSelectWithToast}
              selectedPreset={appState.selectedPreset || null}
              onHide={() => setShowPresets(false)}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Input Form Section */}
        <div ref={formRef} className="scroll-mt-20">
          {useSaleAnalysis ? (
            <EnhancedPropertyInputForm
              onCalculate={handleCalculateWithSaleAnalysis}
              isLoading={false}
              selectedPreset={appState.selectedPreset || null}
            />
          ) : (
            <PropertyInputForm
              onCalculate={handleCalculateWithConfirm}
              isLoading={false}
              selectedPreset={appState.selectedPreset || null}
            />
          )}
        </div>

        {/* Results Section */}
        {(selectedResult || saleResults) && (
          <div ref={comparisonRef} className="scroll-mt-20 space-y-8">
            {/* Sale Analysis Results */}
            {saleResults && saleResults.saleAnalysis && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    🎯 Sale Scenario Analysis
                  </h2>
                  <p className="text-muted-foreground">
                    Phân tích chi tiết kịch bản bán bất động sản
                  </p>
                </div>
                <SaleScenarioAnalysis result={saleResults} />
              </div>
            )}

            {/* Economic Scenarios Section */}
            <Collapsible
              open={showEconomicGenerator}
              onOpenChange={setShowEconomicGenerator}
            >
              <div className="text-center">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="lg" className="mb-4">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Economic Scenarios Analysis
                    {showEconomicGenerator ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                {currentInputs && (
                  <EconomicScenarioGeneratorUI
                    inputs={currentInputs}
                    onScenariosGenerated={setEnhancedScenarios}
                    onAddToComparison={(results) => {
                      // This would typically add to appState.calculationHistory or a dedicated comparison state
                      // For now, just show a toast
                      toast.success(
                        `📊 Đã thêm ${results.length} kịch bản vào so sánh!`
                      );
                      setShowComparison(true); // Assuming you want to show comparison after adding
                    }}
                    isOpen={showEconomicGenerator}
                    onClose={() => setShowEconomicGenerator(false)}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Enhanced Comparison Section */}
            <Collapsible open={showComparison} onOpenChange={setShowComparison}>
              <div className="text-center">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="lg" className="mb-4">
                    <Zap className="mr-2 h-4 w-4" />
                    Advanced Comparison
                    {showComparison ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                {enhancedScenarios.length > 0 && (
                  <EnhancedVisualComparison
                    scenarios={enhancedScenarios.map((s) => s.result)}
                    onSelectScenario={(result) => {
                      setSelectedResult(result);
                      setIsModalOpen(true);
                    }}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Calculation History */}
        {appState.calculationHistory.length > 0 && (
          <CalculationHistory
            history={appState.calculationHistory}
            onResultSelect={(result) => {
              setSelectedResult(result);
              setIsModalOpen(true);
            }}
            onToggleComparison={() => setShowComparison(!showComparison)}
          />
        )}
      </div>

      {/* Modals */}
      {/* Calculation Confirmation Dialog */}
      <CalculationConfirmationDialog
        isOpen={showCalculationConfirm}
        onOpenChange={setShowCalculationConfirm}
        pendingCalculation={pendingCalculation}
        onConfirm={handleConfirmCalculation}
        onCancel={() => {
          setShowCalculationConfirm(false);
          setPendingCalculation(null);
        }}
        isCalculating={appState.isCalculating}
      />

      {/* Results Modal */}
      <EnhancedCalculationResultsModal
        result={selectedResult}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedResult(null);
        }}
        onNewCalculation={() => {
          setIsModalOpen(false);
          setSelectedResult(null);
          formRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}
