
import { useState, useCallback, useEffect } from 'react';
import { RealEstateInputs, CalculationResult, PresetScenario } from '@/types/real-estate';
import { calculateRealEstateInvestment } from '@/lib/real-estate-calculator';
import { toast } from 'sonner';

type CalculatorMode = 'CLASSIC';
type ViewState = 'INPUT' | 'RESULTS';

interface AppState {
  mode: CalculatorMode;
  viewState: ViewState;
  currentInputs: RealEstateInputs | null;
  currentResult: CalculationResult | null;
  selectedPreset: PresetScenario | null;
  calculationHistory: CalculationResult[];
  isCalculating: boolean;
}

export const useCalculatorState = () => {
  const [appState, setAppState] = useState<AppState>({
    mode: 'CLASSIC',
    viewState: 'INPUT',
    currentInputs: null,
    currentResult: null,
    selectedPreset: null,
    calculationHistory: [],
    isCalculating: false,
  });

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

  const handleCalculate = useCallback(async (inputs: RealEstateInputs) => {
    setAppState(prev => ({ ...prev, isCalculating: true }));

    try {
      const result = calculateRealEstateInvestment(inputs);
      const enhancedResult = {
        ...result,
        calculatedAt: new Date().toISOString(),
        calculationId: `calc_${Date.now()}`,
        inputs: inputs,
      };

      setAppState(prev => ({
        ...prev,
        currentInputs: inputs,
        currentResult: enhancedResult,
        viewState: 'INPUT',
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
    } catch (error) {
      console.error('Calculation error:', error);
      setAppState(prev => ({ ...prev, isCalculating: false }));
      toast.error('Lỗi tính toán', {
        description: 'Vui lòng kiểm tra lại thông tin đầu vào',
      });
      throw error;
    }
  }, [appState.calculationHistory]);

  const handlePresetSelect = useCallback((preset: PresetScenario) => {
    setAppState(prev => ({
      ...prev,
      selectedPreset: preset,
      viewState: 'INPUT',
    }));
  }, []);

  return {
    appState,
    setAppState,
    handleCalculate,
    handlePresetSelect,
  };
};
