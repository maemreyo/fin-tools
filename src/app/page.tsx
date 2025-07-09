"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Calculator,
  Calendar,
  Home,
  Building,
  MapPin,
  TrendingUp,
  Download,
  History,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart3,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Brain,
  Zap,
  Lightbulb,
  Settings,
  Eye,
  ChevronRight,
  Rocket,
  Target,
  Clock,
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
    category: "chung-cu",
    location: "hanoi",
    inputs: {
      giaTriBDS: 2397000000,
      chiPhiTrangBi: 100000000,
      vonTuCo: 750000000,
      tyLeVay: 70,
      thoiGianVay: 35,
      laiSuatUuDai: 8.0,
      thoiGianUuDai: 12,
      laiSuatThaNoi: 10.0,
      tienThueThang: 6000000,
      phiQuanLy: 480000,
      tyLeLapDay: 95,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "1br-gialam-official",
    name: "1PN Gia Lâm (Theo CĐT)",
    description:
      "Phân tích dựa trên phiếu tính giá chính thức từ Chủ đầu tư cho căn 1PN diện tích 44.8m2.",
    category: "chung-cu",
    location: "hanoi",
    inputs: {
      giaTriBDS: 3512264492,
      chiPhiTrangBi: 150000000,
      vonTuCo: 750000000,
      tyLeVay: 70,
      thoiGianVay: 35,
      laiSuatUuDai: 8.0,
      thoiGianUuDai: 24, // Dựa trên chính sách ân hạn thực tế
      laiSuatThaNoi: 10.0,
      tienThueThang: 14000000,
      phiQuanLy: 716800,
      tyLeLapDay: 95,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "2br-namtuliem-standard",
    name: "2PN Nam Từ Liêm (Kịch bản Tiêu chuẩn)",
    description:
      "Một phương án tham khảo cho căn hộ 2PN điển hình tại khu vực Mỹ Đình, Nam Từ Liêm, phù hợp cho gia đình ở hoặc đầu tư cho thuê.",
    category: "chung-cu",
    location: "hanoi",
    inputs: {
      giaTriBDS: 4000000000,
      chiPhiTrangBi: 200000000,
      vonTuCo: 750000000,
      tyLeVay: 60,
      thoiGianVay: 25,
      laiSuatUuDai: 7.8,
      thoiGianUuDai: 18,
      laiSuatThaNoi: 9.8,
      tienThueThang: 16000000,
      phiQuanLy: 1200000,
      tyLeLapDay: 95,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "starter-apartment",
    name: "🏠 Chung cư starter - Người mới",
    description: "Căn hộ 2PN phù hợp đầu tư lần đầu, vốn ít, dòng tiền ổn định",
    category: "chung-cu",
    location: "hcm",
    inputs: {
      giaTriBDS: 2800000000, // 2.8 tỷ
      vonTuCo: 1000000000, // 1 tỷ (user có)
      chiPhiTrangBi: 40000000, // 40 triệu
      tienThueThang: 18000000, // 18 triệu
      laiSuatUuDai: 7.5,
      thoiGianUuDai: 12,
      laiSuatThaNoi: 9.5,
      thoiGianVay: 25,
      phiQuanLy: 400000,
      tyLeLapDay: 95,
      phiBaoTri: 1,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "premium-investment",
    name: "💎 Căn hộ cao cấp - Nhà đầu tư",
    description:
      "Căn hộ 3PN cao cấp, ROI cao, thích hợp investor có kinh nghiệm",
    category: "chung-cu",
    location: "hcm",
    inputs: {
      giaTriBDS: 5200000000,
      vonTuCo: 1800000000,
      chiPhiTrangBi: 80000000,
      tienThueThang: 35000000,
      laiSuatUuDai: 6.8,
      thoiGianUuDai: 18,
      laiSuatThaNoi: 8.8,
      thoiGianVay: 20,
      phiQuanLy: 800000,
      tyLeLapDay: 98,
      phiBaoTri: 0.8,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "townhouse-family",
    name: "🏘️ Nhà phố - Gia đình trẻ",
    description:
      "Nhà phố 4x15m, vừa ở vừa cho thuê, phù hợp gia đình có con nhỏ",
    category: "nha-pho",
    location: "hcm",
    inputs: {
      giaTriBDS: 7800000000,
      vonTuCo: 2500000000,
      chiPhiTrangBi: 150000000,
      tienThueThang: 25000000,
      laiSuatUuDai: 7.2,
      thoiGianUuDai: 24,
      laiSuatThaNoi: 9.2,
      thoiGianVay: 25,
      phiQuanLy: 200000,
      tyLeLapDay: 90,
      phiBaoTri: 1.2,
      thueSuatChoThue: 10,
    },
  },
];

// ===== INTERFACE TYPES =====
type CalculatorMode = "CLASSIC" | "TIMELINE";
type ViewState = "INPUT" | "RESULTS" | "TIMELINE";

interface AppState {
  mode: CalculatorMode;
  viewState: ViewState;
  currentInputs: RealEstateInputs | null;
  currentResult: CalculationResult | null;
  selectedPreset: PresetScenario | null;
  calculationHistory: CalculationResult[];
  timelineScenarios: TimelineScenario[];
  isCalculating: boolean;
  hasTimelineAccess: boolean;
}

// ===== MAIN COMPONENT =====
export default function EnhancedRealEstateCalculatorPage() {
  // ===== STATE MANAGEMENT =====
  const [appState, setAppState] = useState<AppState>({
    mode: "CLASSIC",
    viewState: "INPUT",
    currentInputs: null,
    currentResult: null,
    selectedPreset: null,
    calculationHistory: [],
    timelineScenarios: [],
    isCalculating: false,
    hasTimelineAccess: true,
  });

  // UI State
  const [showPresets, setShowPresets] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [showCalculationConfirm, setShowCalculationConfirm] = useState(false);
  const [pendingCalculation, setPendingCalculation] =
    useState<RealEstateInputs | null>(null);

  // ===== LOAD SAVED DATA =====
  useEffect(() => {
    const savedHistory = localStorage.getItem("calculation-history");
    const savedScenarios = localStorage.getItem("timeline-scenarios");

    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setAppState((prev) => ({ ...prev, calculationHistory: history }));
      } catch (error) {
        console.error("Failed to load calculation history:", error);
      }
    }

    if (savedScenarios) {
      try {
        const scenarios = JSON.parse(savedScenarios);
        setAppState((prev) => ({ ...prev, timelineScenarios: scenarios }));
      } catch (error) {
        console.error("Failed to load timeline scenarios:", error);
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
          description: `ROI: ${(result.roiHangNam || 0).toFixed(
            1
          )}% - Dòng tiền: ${(
            (result.steps.dongTienRongBDS || 0) / 1000000
          ).toFixed(1)}M ₫`,
        });
      } catch (error) {
        console.error("Calculation error:", error);
        setAppState((prev) => ({ ...prev, isCalculating: false }));

        toast.error("Lỗi tính toán", {
          description: "Vui lòng kiểm tra lại thông tin đầu vào",
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
        viewState: "INPUT", // Ensure we're in input view
      }));
      setShowPresets(false);

      // Enhanced toast with action buttons
      toast.success("✅ Đã tải template thành công!", {
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

  // ===== RENDER MAIN PAGE =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* ===== ENHANCED PAGE HEADER ===== */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            {/* ENHANCED Header với value proposition */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg mb-6 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">
                    Smart Calculator
                  </span>
                </div>
                <div className="h-4 w-px bg-primary/20" />
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">
                    AI-Powered
                  </span>
                </div>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Tính Toán Đầu Tư Bất Động Sản
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                <span className="font-semibold text-blue-600">
                  Hiểu bạn như chính bạn.
                </span>{" "}
                Chỉ cần giá nhà và số tiền bạn có - chúng tôi sẽ tính toán tất
                cả còn lại.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Tính toán real-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Phân tích rủi ro thông minh</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Gợi ý tối ưu hóa</span>
                </div>
              </div>

              {/* Enhanced Stats Section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      Tính toán
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {appState.calculationHistory.length}
                  </p>
                  <p className="text-sm text-blue-700">
                    Phân tích đã thực hiện
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      AI Insights
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {appState.currentResult ? "Sẵn sàng" : "Chờ dữ liệu"}
                  </p>
                  <p className="text-sm text-purple-700">
                    Trạng thái phân tích
                  </p>
                </div>
              </div>
            </div>

            {/* ===== MODE SELECTOR ===== */}
            {/* <div className="flex justify-center">
              <Tabs
                value={appState.mode}
              >
                <TabsList className="grid w-full grid-cols-2 max-w-md h-12">
                  <TabsTrigger
                    value="CLASSIC"
                    className="flex items-center gap-2 px-6"
                  >
                    <Calculator className="h-4 w-4" />
                    Classic Mode
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div> */}
          </CardHeader>
        </Card>

        {/* ===== CLASSIC MODE ===== */}
        {appState.mode === "CLASSIC" && (
          <div className="space-y-8">
            {/* Preset Scenarios */}
            {showPresets && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      <CardTitle className="text-amber-900">
                        Mẫu Có Sẵn
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPresets(false)}
                    >
                      Ẩn
                    </Button>
                  </div>
                  <CardDescription className="text-amber-700">
                    Chọn mẫu để bắt đầu nhanh với thông số thực tế
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PRESET_SCENARIOS.map((preset) => (
                      <Card
                        key={preset.id}
                        className={`cursor-pointer hover:shadow-lg transition-all duration-200 bg-white group ${
                          appState.selectedPreset?.id === preset.id
                            ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                            : "border-amber-200 hover:border-amber-400"
                        }`}
                        onClick={() => handlePresetSelect(preset)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">
                                  {preset.name}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {preset.description}
                                </p>
                              </div>
                              {appState.selectedPreset?.id === preset.id && (
                                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                              )}
                            </div>

                            {/* Key Metrics Preview */}
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">
                                  Giá BDS:
                                </span>
                                <span className="font-medium">
                                  {(
                                    preset.inputs.giaTriBDS / 1000000000
                                  ).toFixed(1)}
                                  B ₫
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">
                                  Tiền thuê:
                                </span>
                                <span className="font-medium text-green-600">
                                  {(
                                    preset.inputs.tienThueThang / 1000000
                                  ).toFixed(0)}
                                  M ₫/tháng
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">
                                  Vay:
                                </span>
                                <span className="font-medium">
                                  {preset.inputs.tyLeVay}% -{" "}
                                  {preset.inputs.thoiGianVay} năm
                                </span>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {preset.category}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {preset.location}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-blue-600 group-hover:text-blue-700">
                                <span>Chọn</span>
                                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Calculation History */}
            {appState.calculationHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      <CardTitle>Lịch Sử Tính Toán</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowComparison(!showComparison)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      So sánh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {appState.calculationHistory
                      .slice(0, 6)
                      .map((result, index) => (
                        <Card
                          key={result.calculationId || index}
                          className="cursor-pointer hover:shadow-sm transition-all border-gray-200"
                          onClick={() =>
                            setAppState((prev) => ({
                              ...prev,
                              currentResult: result,
                              viewState: "RESULTS",
                            }))
                          }
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">
                                Tính toán #{index + 1}
                              </div>
                              <Badge
                                variant={
                                  (result.steps.dongTienRongBDS || 0) > 0
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs shrink-0"
                              >
                                {(result.steps.dongTienRongBDS || 0) > 0
                                  ? "Lời"
                                  : "Lỗ"}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  ROI:
                                </span>
                                <span
                                  className={`font-semibold ${
                                    (result.roiHangNam || 0) > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {(result.roiHangNam || 0).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Dòng tiền:
                                </span>
                                <span
                                  className={`font-semibold ${
                                    (result.steps.dongTienRongBDS || 0) > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {(
                                    (result.steps.dongTienRongBDS || 0) /
                                    1000000
                                  ).toFixed(1)}
                                  M ₫
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground pt-1 border-t">
                                {new Date(
                                  result.calculatedAt || ""
                                ).toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Input Form */}
            <div data-form="property-input">
              <PropertyInputForm
                onCalculate={handleCalculateWithConfirm}
                initialValues={appState.selectedPreset?.inputs}
                selectedPreset={appState.selectedPreset}
                isLoading={appState.isCalculating}
                mode={appState.mode}
              />
            </div>

            {/* Results Section */}
            {appState.currentResult && appState.viewState === "RESULTS" && (
              <div className="space-y-6">
                <CalculationResults result={appState.currentResult} />
                <AIAdvisorySystem result={appState.currentResult} />
              </div>
            )}

            {/* Scenario Comparison */}
            {showComparison && appState.calculationHistory.length > 1 && (
              <ScenarioComparison
                results={appState.calculationHistory.slice(0, 4)}
              />
            )}
          </div>
        )}
      </div>

      {/* ===== CALCULATION CONFIRMATION DIALOG ===== */}
      <Dialog
        open={showCalculationConfirm}
        onOpenChange={setShowCalculationConfirm}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Xác nhận tính toán
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn thực hiện phân tích đầu tư bất động sản này
              không?
            </DialogDescription>
          </DialogHeader>

          {pendingCalculation && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">
                  Thông tin sẽ được phân tích:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Giá BDS:</span>
                    <span className="ml-2 font-medium">
                      {(pendingCalculation.giaTriBDS / 1000000000).toFixed(1)}B
                      ₫
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tiền thuê:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {(pendingCalculation.tienThueThang / 1000000).toFixed(0)}M
                      ₫/tháng
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vay:</span>
                    <span className="ml-2 font-medium">
                      {pendingCalculation.tyLeVay}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="ml-2 font-medium">
                      {pendingCalculation.thoiGianVay} năm
                    </span>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <strong>Miễn phí:</strong> Tính toán này hoàn toàn miễn phí và
                  không giới hạn số lần sử dụng.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCalculationConfirm(false);
                    setPendingCalculation(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    if (pendingCalculation) {
                      handleCalculate(pendingCalculation);
                    }
                    setShowCalculationConfirm(false);
                    setPendingCalculation(null);
                  }}
                  disabled={appState.isCalculating}
                >
                  {appState.isCalculating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tính toán...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Bắt đầu phân tích
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
