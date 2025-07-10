
import { useState, useCallback, useEffect } from 'react';
import { RealEstateInputs, CalculationResult, PresetScenario, CalculationResultWithSale } from '@/types/real-estate';
import { RealEstateInputsWithSaleAnalysis } from '@/types/sale-scenario';
import { calculateRealEstateInvestmentWithSale } from '@/lib/real-estate-calculator-enhanced';
import { toast } from 'sonner';
import { v4 as uuidv4 } from "uuid";

// Defines the overall state of the application managed by this hook
export interface AppState {
  currentInputs: RealEstateInputs | null;
  currentResult: CalculationResultWithSale | null;
  history: HistoryEntry[];
  comparisonScenarios: CalculationResultWithSale[];
  isLoading: boolean;
  error: string | null;
  activeTab: "main" | "comparison" | "history";
  showConfirmDialog: boolean;
  selectedPreset: PresetScenario | null;
  calculationHistory: CalculationResultWithSale[]; // For the history component
  isCalculating: boolean;
}

// Represents a single entry in the calculation history
export interface HistoryEntry {
  id: string;
  timestamp: string;
  inputs: RealEstateInputs;
  result: CalculationResultWithSale;
  scenarioName?: string;
}

const initialState: AppState = {
  currentInputs: null,
  currentResult: null,
  history: [],
  comparisonScenarios: [],
  isLoading: false,
  error: null,
  activeTab: "main",
  showConfirmDialog: false,
  selectedPreset: null,
  calculationHistory: [],
  isCalculating: false,
};

export const useCalculatorState = () => {
  const [appState, setAppState] = useState<AppState>(initialState);

  // Load saved data
  useEffect(() => {
    const savedHistory = localStorage.getItem('calculation-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setAppState(prev => ({ ...prev, calculationHistory: history }));
      } catch (error) {
        console.error('Failed to load calculation history:', error);
      }
    }
  }, []);

  const handleCalculate = useCallback(async (inputs: RealEstateInputsWithSaleAnalysis) => {
    setAppState(prev => ({ ...prev, isCalculating: true }));

    try {
      const result = calculateRealEstateInvestmentWithSale(inputs);
      const enhancedResult: CalculationResultWithSale = {
        ...result,
        calculatedAt: new Date().toISOString(),
        calculationId: uuidv4(),
        inputs: inputs,
      };

      setAppState(prev => ({
        ...prev,
        currentInputs: inputs,
        currentResult: enhancedResult,
        isCalculating: false,
        calculationHistory: [enhancedResult, ...prev.calculationHistory.slice(0, 9)],
      }));

      // Save to localStorage
      const newHistory = [enhancedResult, ...appState.calculationHistory.slice(0, 9)];
      localStorage.setItem('calculation-history', JSON.stringify(newHistory));

      toast.success('Tính toán thành công!', {
        description: `ROI: ${(result.roiHangNam || 0).toFixed(1)}% - Dòng tiền: ${((result.steps.dongTienRongBDS || 0) / 1000000).toFixed(1)}M ₫`,
      });

      return enhancedResult;
    } catch (error: any) {
      console.error('Calculation error:', error);
      setAppState(prev => ({ ...prev, isCalculating: false }));
      toast.error('Lỗi tính toán', {
        description: error.message || 'Vui lòng kiểm tra lại thông tin đầu vào',
      });
      throw error;
    }
  }, []);

  const handlePresetSelect = useCallback((preset: PresetScenario) => {
    setAppState(prev => ({
      ...prev,
      selectedPreset: preset,
    }));
    toast.info(`Đã chọn kịch bản mẫu: ${preset.name}`);
  }, []);

  const handleClearHistory = useCallback(() => {
    setAppState((prev) => ({ ...prev, history: [], calculationHistory: [] }));
    toast.info("Đã xóa lịch sử tính toán.");
  }, []);

  const handleRemoveHistoryEntry = useCallback((id: string) => {
    setAppState((prev) => ({
      ...prev,
      history: prev.history.filter((entry) => entry.id !== id),
      calculationHistory: prev.calculationHistory.filter(
        (result) => result.calculationId !== id
      ), // Assuming calculationId matches history entry id
    }));
    toast.info("Đã xóa mục khỏi lịch sử.");
  }, []);

  const handleToggleConfirmDialog = useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      showConfirmDialog: !prev.showConfirmDialog,
    }));
  }, []);

  return {
    appState,
    handleCalculate,
    handlePresetSelect,
    handleClearHistory,
    handleRemoveHistoryEntry,
    handleToggleConfirmDialog,
  };
};
