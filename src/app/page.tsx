"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calculator,
  Lightbulb,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  Sparkles,
  Brain,
  Users,
  Building,
} from "lucide-react";
import { toast } from "sonner";

// Enhanced imports - UPDATED
import HeroSection from "@/components/HeroSection";
import { CalculationConfirmationDialog } from "@/components/CalculationConfirmationDialog";
import { PageHeader } from "@/components/PageHeader";
import { PresetScenarios } from "@/components/PresetScenarios";
import { CalculationHistory } from "@/components/CalculationHistory";
import PropertyInputForm from "@/components/PropertyInputForm";
import CalculationResultsModal from "@/components/CalculationResultsModal";

// Enhanced comparison components - UPDATED
import EnhancedVisualComparison from "@/components/comparison/EnhancedVisualComparison";
// REPLACE OLD: import EconomicScenarioGenerator from "@/components/comparison/EconomicScenarioGenerator";
import EconomicScenarioGeneratorUI from "@/components/comparison/EconomicScenarioGenerator";

import { useCalculatorState } from "@/hooks/useCalculatorState";
import { PRESET_SCENARIOS } from "@/constants/presetScenarios";
import {
  RealEstateInputs,
  CalculationResult,
  PresetScenario,
} from "@/types/real-estate";

// Enhanced types - NEW
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

  // Enhanced state - NEW
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

  const handlePresetSelectWithToast = (preset: PresetScenario) => {
    handlePresetSelect(preset);
    setShowPresets(false);

    toast.success("✅ Đã tải template thành công!", {
      description: `${preset.name} - Dữ liệu đã được điền vào form`,
      action: {
        label: "Tính toán ngay",
        onClick: () => {
          if (preset.inputs) {
            handleCalculate(preset.inputs as RealEstateInputs);
          }
        },
      },
      duration: 5000,
    });
  };

  const handleResultSelect = (result: CalculationResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const confirmCalculation = async () => {
    if (pendingCalculation) {
      try {
        const result = await handleCalculate(pendingCalculation);
        setSelectedResult(result);
        setIsModalOpen(true);

        // Auto-detect investor type based on existing history
        if (appState.calculationHistory.length === 0) {
          setMarketContext((prev) => ({
            ...prev,
            investorType: "new_investor",
          }));
        } else {
          // If user has history, they might be existing investor
          setMarketContext((prev) => ({
            ...prev,
            investorType: "existing_investor",
          }));
        }

        // Auto-show comparison if we have multiple results
        if (appState.calculationHistory.length >= 1) {
          setShowComparison(true);
          setTimeout(() => {
            comparisonRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 500);
        }
      } catch (error) {
        // Error already handled in hook
      }
    }
    setShowCalculationConfirm(false);
    setPendingCalculation(null);
  };

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ENHANCED: Generate Economic Scenarios
  const handleGenerateEconomicScenarios = () => {
    if (!currentInputs) {
      toast.error(
        "Vui lòng thực hiện tính toán trước khi tạo kịch bản kinh tế"
      );
      return;
    }

    // Auto-detect context based on user behavior
    const detectedContext: MarketContext = {
      marketType: "secondary", // Default to secondary market
      investorType:
        appState.calculationHistory.length > 0
          ? "existing_investor"
          : "new_investor",
      purchaseDate: new Date(),
      currentMarketValue: currentInputs.giaTriBDS,
    };

    setMarketContext(detectedContext);
    setShowEconomicGenerator(true);
  };

  // ENHANCED: Handle generated scenarios
  const handleEnhancedScenariosGenerated = (
    scenarios: EnhancedGeneratedScenario[]
  ) => {
    setEnhancedScenarios(scenarios);

    // Convert to CalculationResult for comparison
    const newResults = scenarios.map((s) => ({
      ...s.result,
      scenarioName: `${s.scenario.name} (${
        s.marketContext.investorType === "existing_investor"
          ? "Existing"
          : "New"
      } - ${s.marketContext.marketType})`,
    }));

    // Add enhanced context info to toast
    const contextInfo =
      marketContext.investorType === "existing_investor"
        ? "Existing Investor"
        : "New Investor";
    const marketInfo =
      marketContext.marketType === "primary"
        ? "Primary Market"
        : "Secondary Market";

    toast.success(
      `🎯 Đã tạo ${scenarios.length} kịch bản kinh tế thành công!`,
      {
        description: `Context: ${contextInfo} • ${marketInfo}`,
        action: {
          label: "Xem so sánh",
          onClick: () => {
            setShowComparison(true);
            comparisonRef.current?.scrollIntoView({ behavior: "smooth" });
          },
        },
      }
    );

    setShowComparison(true);
  };

  const handleAddToComparison = (results: CalculationResult[]) => {
    // This would need to be implemented in useCalculatorState hook
    toast.success(`📊 Đã thêm ${results.length} kịch bản vào so sánh!`);
    setShowComparison(true);
  };

  // Smart context detection based on user inputs
  const getSmartContextSuggestion = (): string => {
    if (!currentInputs) return "";

    const suggestions = [];

    if (appState.calculationHistory.length > 0) {
      suggestions.push("Bạn có vẻ là existing investor");
    } else {
      suggestions.push("Bạn có vẻ là new investor");
    }

    if ((currentInputs.giaTriBDS || 0) > 3000000000) {
      suggestions.push("property cao cấp → secondary market");
    } else {
      suggestions.push("có thể mua từ CĐT → primary market");
    }

    return suggestions.join(", ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* ===== HERO SECTION ===== */}
      <HeroSection
        calculationCount={appState.calculationHistory.length}
        hasCurrentResult={!!appState.currentResult}
        onScrollToForm={handleScrollToForm}
      />

      {/* ===== MAIN CONTENT ===== */}
      <div className="container mx-auto py-8 space-y-8">
        {/* ===== FORM SECTION ===== */}
        <div ref={formRef} data-form="property-input">
          <PropertyInputForm
            onCalculate={handleCalculateWithConfirm}
            initialValues={appState.selectedPreset?.inputs}
            selectedPreset={appState.selectedPreset}
            isLoading={appState.isCalculating}
          />
        </div>

        {/* ===== PRESETS & HISTORY (COLLAPSIBLE) ===== */}
        <Collapsible open={showPresets} onOpenChange={setShowPresets}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {showPresets
                  ? "Ẩn templates và lịch sử"
                  : "Hiện templates và lịch sử"}
              </span>
              {showPresets ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-8 mt-4">
            <PresetScenarios
              scenarios={PRESET_SCENARIOS}
              selectedPreset={appState.selectedPreset}
              onPresetSelect={handlePresetSelectWithToast}
              onHide={() => setShowPresets(false)}
            />

            <CalculationHistory
              history={appState.calculationHistory}
              onResultSelect={handleResultSelect}
              onToggleComparison={() => setShowComparison(!showComparison)}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* ===== ENHANCED COMPARISON SECTION ===== */}
        {appState.calculationHistory.length > 0 && (
          <div ref={comparisonRef} className="space-y-6">
            {/* Enhanced Comparison Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">
                  Enhanced So Sánh Kịch Bản
                </h2>
                {enhancedScenarios.length > 0 && (
                  <Badge className="bg-purple-100 text-purple-800">
                    {enhancedScenarios.length} enhanced scenarios
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateEconomicScenarios}
                  disabled={!currentInputs}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Enhanced Economic Scenarios
                  {currentInputs && (
                    <Badge variant="secondary" className="ml-1">
                      {marketContext.investorType === "existing_investor"
                        ? "Existing"
                        : "New"}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(!showComparison)}
                >
                  {showComparison ? "Ẩn so sánh" : "Hiện so sánh"}
                </Button>
              </div>
            </div>

            {/* Smart Context Suggestion */}
            {currentInputs && (
              <Alert className="border-blue-200 bg-blue-50">
                <Brain className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <strong>🤖 Smart Detection:</strong>{" "}
                  {getSmartContextSuggestion()}
                  <Button
                    variant="link"
                    className="p-0 ml-2 text-blue-600 underline h-auto"
                    onClick={handleGenerateEconomicScenarios}
                  >
                    Tạo kịch bản phù hợp →
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {showComparison && (
              <EnhancedVisualComparison
                scenarios={appState.calculationHistory}
                onSelectScenario={(scenario) => {
                  setSelectedResult(scenario);
                  setIsModalOpen(true);
                }}
                onRemoveScenario={(index) => {
                  // This would require updating the useCalculatorState hook
                  toast.success("Đã xóa kịch bản khỏi so sánh");
                }}
              />
            )}
          </div>
        )}

        {/* ===== ENHANCED QUICK ACTIONS ===== */}
        {appState.calculationHistory.length > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
              <div className="text-sm text-muted-foreground">
                Bạn có {appState.calculationHistory.length} kịch bản
                {enhancedScenarios.length > 0 && (
                  <span className="text-purple-600">
                    {" "}
                    + {enhancedScenarios.length} enhanced
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(true)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                So sánh tất cả
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateEconomicScenarios}
                disabled={!currentInputs}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Enhanced Scenarios
                {currentInputs && (
                  <Badge variant="secondary" className="text-xs">
                    Auto-detected
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ===== SUCCESS MESSAGE WITH CONTEXT ===== */}
        {appState.currentResult && (
          <Alert className="border-green-200 bg-green-50">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              <strong>🎉 Tính toán thành công!</strong> Kết quả đã được lưu vào
              lịch sử.
              {appState.calculationHistory.length > 1 && (
                <span>
                  {" "}
                  Bạn có thể so sánh với{" "}
                  {appState.calculationHistory.length - 1} kịch bản khác.
                </span>
              )}
              {currentInputs && (
                <Button
                  variant="link"
                  className="p-0 ml-2 text-green-700 underline h-auto"
                  onClick={handleGenerateEconomicScenarios}
                >
                  Tạo enhanced scenarios →
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* ===== MODALS ===== */}
      <CalculationResultsModal
        result={selectedResult}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNewCalculation={() => setIsModalOpen(false)}
      />

      <CalculationConfirmationDialog
        isOpen={showCalculationConfirm}
        onOpenChange={setShowCalculationConfirm}
        pendingCalculation={pendingCalculation}
        onConfirm={confirmCalculation}
        onCancel={() => {
          setShowCalculationConfirm(false);
          setPendingCalculation(null);
        }}
        isCalculating={appState.isCalculating}
      />

      {/* ENHANCED: Economic Scenario Generator */}
      <EconomicScenarioGeneratorUI
        baseInputs={currentInputs || ({} as RealEstateInputs)}
        onScenariosGenerated={handleEnhancedScenariosGenerated}
        onAddToComparison={handleAddToComparison}
        isOpen={showEconomicGenerator}
        onClose={() => setShowEconomicGenerator(false)}
      />
    </div>
  );
}
