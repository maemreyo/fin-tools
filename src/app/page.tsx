// src/app/page.tsx
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Calculator,
  Calendar,
  Home,
  TrendingUp,
  BookOpen,
  Sparkles,
  CheckCircle,
  BarChart3,
  Eye,
  Rocket,
  Target,
} from "lucide-react";

import PropertyInputForm from "@/components/PropertyInputForm";
import CalculationResults from "@/components/CalculationResults";
import ScenarioComparison from "@/components/ScenarioComparison";
import { AIAdvisorySystem } from "@/components/AIAdvisorySystem";
import {
  RealEstateInputs,
  CalculationResult,
  PresetScenario,
} from "@/types/real-estate";
import { calculateRealEstateInvestment } from "@/lib/real-estate-calculator";

// ===== PRESET SCENARIOS =====
const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "studio-gialam-cautious",
    name: "Studio Gia Lâm (Kịch bản Thận trọng)",
    description:
      "Kịch bản thận trọng cho căn Studio tại Masterise Lakeside, dựa trên các giả định lãi suất cao và tiền thuê thấp mà chúng ta đã thảo luận.",
    inputs: {
      giaTriBDS: 1650000000,
      vonTuCo: 500000000,
      tienThueThang: 7000000,
      laiSuatUuDai: 8.5,
      laiSuatThaNoi: 11.5,
      thoiGianVay: 20,
      thoiGianUuDai: 24,
      tyLeLapDay: 85,
      phiQuanLy: 200000,
      phiBaoTri: 1.2,
      baoHiemTaiSan: 0.15,
      thueSuatChoThue: 10,
      chiPhiTrangBi: 50000000,
      chiPhiGiaoDich: 33000000,
    },
    category: "studio",
    riskLevel: "conservative",
    marketCondition: "stable",
    tags: ["Thận trọng", "Lãi suất cao", "Dòng tiền ổn định"],
  },
  {
    id: "studio-gialam-optimistic",
    name: "Studio Gia Lâm (Kịch bản Lạc quan)",
    description:
      "Kịch bản lạc quan với lãi suất ưu đãi tốt hơn và tiền thuê cao hơn, phù hợp cho thị trường phát triển.",
    inputs: {
      giaTriBDS: 1650000000,
      vonTuCo: 500000000,
      tienThueThang: 8500000,
      laiSuatUuDai: 7.5,
      laiSuatThaNoi: 9.5,
      thoiGianVay: 20,
      thoiGianUuDai: 36,
      tyLeLapDay: 90,
      phiQuanLy: 150000,
      phiBaoTri: 1.0,
      baoHiemTaiSan: 0.12,
      thueSuatChoThue: 8,
      chiPhiTrangBi: 45000000,
      chiPhiGiaoDich: 28000000,
    },
    category: "studio",
    riskLevel: "moderate",
    marketCondition: "growth",
    tags: ["Lạc quan", "Lãi suất tốt", "Dòng tiền cao"],
  },
  {
    id: "apartment-2br-typical",
    name: "Căn hộ 2PN (Kịch bản Điển hình)",
    description:
      "Kịch bản điển hình cho căn hộ 2 phòng ngủ, phù hợp cho gia đình trẻ hoặc đầu tư cho thuê.",
    inputs: {
      giaTriBDS: 3200000000,
      vonTuCo: 1000000000,
      tienThueThang: 15000000,
      laiSuatUuDai: 8.0,
      laiSuatThaNoi: 10.5,
      thoiGianVay: 20,
      thoiGianUuDai: 24,
      tyLeLapDay: 80,
      phiQuanLy: 400000,
      phiBaoTri: 1.5,
      baoHiemTaiSan: 0.18,
      thueSuatChoThue: 10,
      chiPhiTrangBi: 80000000,
      chiPhiGiaoDich: 64000000,
    },
    category: "apartment",
    riskLevel: "moderate",
    marketCondition: "stable",
    tags: ["2 phòng ngủ", "Gia đình", "Đầu tư"],
  },
];

// ===== MAIN APP COMPONENT =====

interface AppState {
  viewState: "INPUT" | "RESULTS" | "COMPARISON";
  currentInputs: RealEstateInputs | null;
  currentResult: CalculationResult | null;
  calculationHistory: CalculationResult[];
  isCalculating: boolean;
  selectedPreset: PresetScenario | null;
}

export default function RealEstateCalculatorApp() {
  // ===== STATE MANAGEMENT =====
  const [appState, setAppState] = useState<AppState>({
    viewState: "INPUT",
    currentInputs: null,
    currentResult: null,
    calculationHistory: [],
    isCalculating: false,
    selectedPreset: null,
  });

  // UI State
  const [showCalculationConfirm, setShowCalculationConfirm] = useState(false);
  const [pendingCalculation, setPendingCalculation] =
    useState<RealEstateInputs | null>(null);
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  // ===== LIFECYCLE HOOKS =====
  useEffect(() => {
    const savedHistory = localStorage.getItem("calculation-history");

    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setAppState((prev) => ({ ...prev, calculationHistory: history }));
      } catch (error) {
        console.error("Failed to load calculation history:", error);
      }
    }
  }, []);

  // ===== CALCULATION HANDLERS =====
  const handleCalculateWithConfirm = useCallback((inputs: RealEstateInputs) => {
    setPendingCalculation(inputs);
    setShowCalculationConfirm(true);
  }, []);

  const handleCalculate = useCallback(
    async (inputs: RealEstateInputs) => {
      setAppState((prev) => ({ ...prev, isCalculating: true }));

      try {
        const result = calculateRealEstateInvestment(inputs);

        // Enhanced result with metadata
        const enhancedResult = {
          ...result,
          calculatedAt: new Date().toISOString(),
          calculationId: `calc_${Date.now()}`,
          inputs: inputs,
        };

        setAppState((prev) => ({
          ...prev,
          currentInputs: inputs,
          currentResult: enhancedResult,
          viewState: "RESULTS",
          isCalculating: false,
          calculationHistory: [
            enhancedResult,
            ...prev.calculationHistory.slice(0, 9),
          ], // Keep last 10
        }));

        // Save to localStorage
        const newHistory = [
          enhancedResult,
          ...appState.calculationHistory.slice(0, 9),
        ];
        localStorage.setItem("calculation-history", JSON.stringify(newHistory));

        toast.success("Tính toán thành công!", {
          description: "Kết quả đã được cập nhật và lưu vào lịch sử",
          duration: 3000,
        });
      } catch (error) {
        console.error("Calculation error:", error);
        setAppState((prev) => ({ ...prev, isCalculating: false }));
        toast.error("Lỗi tính toán", {
          description: "Vui lòng kiểm tra lại dữ liệu đầu vào",
          duration: 4000,
        });
      }
    },
    [appState.calculationHistory]
  );



  // ===== PRESET HANDLERS =====
  const handlePresetSelect = useCallback(
    (preset: PresetScenario) => {
      setAppState((prev) => ({
        ...prev,
        selectedPreset: preset,
        viewState: "INPUT",
      }));

      setShowPresetDialog(false);

      toast.success("Đã áp dụng kịch bản mẫu", {
        description: `${preset.name} - Dữ liệu đã được điền vào form`,
        action: {
          label: "Tính toán ngay",
          onClick: () => {
            // Auto-calculate if user wants
            if (preset.inputs) {
              handleCalculate(preset.inputs as RealEstateInputs);
            }
          },
        },
        duration: 5000,
      });

      // Smooth scroll to form
      setTimeout(() => {
        const formElement = document.querySelector(
          '[data-form="property-input"]'
        );
        if (formElement) {
          formElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }, 100);
    },
    [handleCalculate]
  );



  // ===== RENDER METHODS =====
  const renderHeader = () => (
    <div className="text-center space-y-4 mb-8">
      <div className="flex items-center justify-center gap-3">
        <div className="p-3 bg-blue-100 rounded-full">
          <Home className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Real Estate Calculator
        </h1>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Công cụ tính toán đầu tư bất động sản thông minh với phân tích chi tiết
      </p>
    </div>
  );

  const renderPresetScenarios = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Kịch bản mẫu
            </CardTitle>
            <CardDescription>
              Các kịch bản đã được tính toán sẵn để bạn tham khảo
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => setShowPresetDialog(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Xem tất cả
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_SCENARIOS.map((preset) => (
            <Card
              key={preset.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
              onClick={() => handlePresetSelect(preset)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{preset.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {preset.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {preset.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {preset.tags?.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {renderHeader()}
        {renderPresetScenarios()}

        {/* Main Content */}
        <div className="space-y-6">
          <Tabs
            value={appState.viewState}
            onValueChange={(value) =>
              setAppState((prev) => ({
                ...prev,
                viewState: value as "INPUT" | "RESULTS" | "COMPARISON",
              }))
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="INPUT">
                <Calculator className="h-4 w-4 mr-2" />
                Nhập liệu
              </TabsTrigger>
              <TabsTrigger value="RESULTS" disabled={!appState.currentResult}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Kết quả
              </TabsTrigger>
              <TabsTrigger
                value="COMPARISON"
                disabled={appState.calculationHistory.length < 2}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                So sánh
              </TabsTrigger>
            </TabsList>

            <TabsContent value="INPUT" className="space-y-6">
              <PropertyInputForm
                onCalculate={handleCalculate}
                isCalculating={appState.isCalculating}
                presetData={appState.selectedPreset?.inputs}
              />
            </TabsContent>

            <TabsContent value="RESULTS" className="space-y-6">
              {appState.currentResult && (
                <>
                  <CalculationResults
                    result={appState.currentResult}
                    inputs={appState.currentInputs!}
                  />
                  <AIAdvisorySystem
                    result={appState.currentResult}
                    onTimelineUpgrade={() => {
                      if (appState.currentInputs) {
                        handleTimelineActivate({
                          ...appState.currentInputs,
                          enableTimeline: true,
                          timelineStartDate: new Date(),
                        });
                      }
                    }}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="COMPARISON" className="space-y-6">
              <ScenarioComparison
                scenarios={appState.calculationHistory}
                onScenarioSelect={(scenario) => {
                  setAppState((prev) => ({
                    ...prev,
                    currentResult: scenario,
                    currentInputs: scenario.inputs,
                    viewState: "RESULTS",
                  }));
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Calculation Confirmation Dialog */}
        <Dialog
          open={showCalculationConfirm}
          onOpenChange={setShowCalculationConfirm}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận tính toán</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn tính toán với dữ liệu này không?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCalculationConfirm(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  if (pendingCalculation) {
                    handleCalculate(pendingCalculation);
                    setShowCalculationConfirm(false);
                    setPendingCalculation(null);
                  }
                }}
              >
                Tính toán
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preset Dialog */}
        <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Kịch bản mẫu</DialogTitle>
              <DialogDescription>
                Chọn kịch bản phù hợp để bắt đầu tính toán
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {PRESET_SCENARIOS.map((preset) => (
                <Card
                  key={preset.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handlePresetSelect(preset)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{preset.name}</h4>
                        <Badge variant="secondary">{preset.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {preset.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {preset.tags?.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Giá trị BĐS:</span>
                        <span className="font-medium">
                          {preset.inputs?.giaTriBDS
                            ? `${(preset.inputs.giaTriBDS / 1000000).toFixed(
                                0
                              )}M`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
