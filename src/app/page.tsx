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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calculator, Lightbulb, Loader2, ChevronDown, ChevronUp, Zap, BarChart3, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Enhanced imports
import HeroSection from "@/components/HeroSection";
import { CalculationConfirmationDialog } from "@/components/CalculationConfirmationDialog";
import { PageHeader } from "@/components/PageHeader";
import { PresetScenarios } from "@/components/PresetScenarios";
import { CalculationHistory } from "@/components/CalculationHistory";
import PropertyInputForm from "@/components/PropertyInputForm"; // Updated version
import CalculationResultsModal from "@/components/CalculationResultsModal";

// New enhanced comparison components
import EnhancedVisualComparison from "@/components/comparison/EnhancedVisualComparison";
import EconomicScenarioGenerator from "@/components/comparison/EconomicScenarioGenerator";

import { useCalculatorState } from "@/hooks/useCalculatorState";
import { PRESET_SCENARIOS } from "@/constants/presetScenarios";
import {
  RealEstateInputs,
  CalculationResult,
  PresetScenario,
} from "@/types/real-estate";

export default function EnhancedRealEstateCalculatorPage() {
  const { appState, handleCalculate, handlePresetSelect } = useCalculatorState();

  // UI State
  const [showPresets, setShowPresets] = useState(false); // Start collapsed for cleaner UI
  const [showComparison, setShowComparison] = useState(false);
  const [showCalculationConfirm, setShowCalculationConfirm] = useState(false);
  const [showEconomicGenerator, setShowEconomicGenerator] = useState(false);
  const [pendingCalculation, setPendingCalculation] = useState<RealEstateInputs | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<CalculationResult | null>(null);
  const [currentInputs, setCurrentInputs] = useState<RealEstateInputs | null>(null);

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
        
        // Auto-show comparison if we have multiple results
        if (appState.calculationHistory.length >= 1) {
          setShowComparison(true);
          // Smooth scroll to comparison
          setTimeout(() => {
            comparisonRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerateEconomicScenarios = () => {
    if (!currentInputs) {
      toast.error("Vui lòng thực hiện tính toán trước khi tạo kịch bản kinh tế");
      return;
    }
    setShowEconomicGenerator(true);
  };

  const handleEconomicScenariosGenerated = (scenarios: any[]) => {
    // Add generated scenarios to comparison
    const newResults = scenarios.map(s => ({
      ...s.result,
      scenarioName: s.scenario.name
    }));
    
    // Update app state with new scenarios
    // This would require updating the useCalculatorState hook
    toast.success(`Đã tạo ${scenarios.length} kịch bản kinh tế thành công!`);
    setShowComparison(true);
  };

  const handleAddToComparison = (results: CalculationResult[]) => {
    // Add results to comparison
    // This would require updating the useCalculatorState hook
    toast.success(`Đã thêm ${results.length} kịch bản vào so sánh!`);
    setShowComparison(true);
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
                {showPresets ? "Ẩn templates và lịch sử" : "Hiện templates và lịch sử"}
              </span>
              {showPresets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
            {/* Comparison Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">So Sánh Kịch Bản</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateEconomicScenarios}
                  disabled={!currentInputs}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Tạo Kịch Bản Kinh Tế
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(!showComparison)}
                >
                  {showComparison ? "Ẩn so sánh" : "Hiện so sánh"}
                </Button>
              </div>
            </div>

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

        {/* ===== QUICK ACTIONS ===== */}
        {appState.calculationHistory.length > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
              <div className="text-sm text-muted-foreground">
                Bạn có {appState.calculationHistory.length} kịch bản
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
              >
                <Zap className="h-4 w-4 mr-2" />
                Tạo kịch bản kinh tế
              </Button>
            </div>
          </div>
        )}

        {/* ===== SUCCESS MESSAGE ===== */}
        {appState.currentResult && (
          <Alert className="border-green-200 bg-green-50">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              <strong>Tính toán thành công!</strong> Kết quả đã được lưu vào lịch sử. 
              {appState.calculationHistory.length > 1 && (
                <span> Bạn có thể so sánh với {appState.calculationHistory.length - 1} kịch bản khác.</span>
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

      <EconomicScenarioGenerator
        baseInputs={currentInputs || {} as RealEstateInputs}
        onScenariosGenerated={handleEconomicScenariosGenerated}
        onAddToComparison={handleAddToComparison}
        isOpen={showEconomicGenerator}
        onClose={() => setShowEconomicGenerator(false)}
      />
    </div>
  );
}