"use client";

import React, { useState } from "react";
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
import { Calculator, Lightbulb, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { CalculationConfirmationDialog } from "@/components/CalculationConfirmationDialog";

import { PageHeader } from "@/components/PageHeader";
import { PresetScenarios } from "@/components/PresetScenarios";
import { CalculationHistory } from "@/components/CalculationHistory";
import PropertyInputForm from "@/components/PropertyInputForm";
import CalculationResultsModal from "@/components/CalculationResultsModal";
import ScenarioComparison from "@/components/ScenarioComparison";

import { useCalculatorState } from "@/hooks/useCalculatorState";
import { PRESET_SCENARIOS } from "@/constants/presetScenarios";
import {
  RealEstateInputs,
  CalculationResult,
  PresetScenario,
} from "@/types/real-estate";

export default function EnhancedRealEstateCalculatorPage() {
  const { appState, handleCalculate, handlePresetSelect } =
    useCalculatorState();

  // UI State
  const [showPresets, setShowPresets] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [showCalculationConfirm, setShowCalculationConfirm] = useState(false);
  const [pendingCalculation, setPendingCalculation] =
    useState<RealEstateInputs | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] =
    useState<CalculationResult | null>(null);

  // Handlers
  const handleCalculateWithConfirm = (inputs: RealEstateInputs) => {
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
      } catch (error) {
        // Error already handled in hook
      }
    }
    setShowCalculationConfirm(false);
    setPendingCalculation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 space-y-8">
        <PageHeader
          calculationCount={appState.calculationHistory.length}
          hasCurrentResult={!!appState.currentResult}
        />

        <div className="space-y-8">
          <div data-form="property-input">
            <PropertyInputForm
              onCalculate={handleCalculateWithConfirm}
              initialValues={appState.selectedPreset?.inputs}
              selectedPreset={appState.selectedPreset}
              isLoading={appState.isCalculating}
            />
          </div>

          <Collapsible open={showPresets} onOpenChange={setShowPresets}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  {showPresets ? "Ẩn các mẫu có sẵn và lịch sử" : "Hiện các mẫu có sẵn và lịch sử"}
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

          {showComparison && appState.calculationHistory.length > 1 && (
            <ScenarioComparison
              scenarios={appState.calculationHistory.slice(0, 4)}
            />
          )}
        </div>
      </div>

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
    </div>
  );
}
