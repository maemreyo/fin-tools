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
// ✅ UPDATED: Use modal instead of inline results
import CalculationResultsModal from "@/components/CalculationResultsModal";
import ScenarioComparison from "@/components/ScenarioComparison";
import { AIAdvisorySystem } from "@/components/AIAdvisorySystem";
import {
  RealEstateInputs,
  CalculationResult,
  PresetScenario,
} from "@/types/real-estate";
import { TimelineScenario } from "@/types/timeline";
// ✅ UPDATED: Use fixed calculator
import { calculateRealEstateInvestment } from "@/lib/real-estate-calculator";

// ===== LAZY LOAD TIMELINE COMPONENTS =====
const TimelineDashboard = dynamic(
  () =>
    import("@/components/timeline/TimelineDashboard").then((mod) => ({
      default: mod.TimelineDashboard,
    })),
  {
    loading: () => (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Đang tải Timeline Mode...</p>
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

// ===== ENHANCED PRESET SCENARIOS =====
const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "studio-gialam-cautious",
    name: "Studio Gia Lâm (Kịch bản Thận trọng)",
    description:
      "Kịch bản thận trọng cho căn Studio tại Masterise Lakeside, dựa trên các giả định lãi suất cao và tiền thuê thấp.",
    category: "chung-cu",
    location: "hanoi",
    inputs: {
      giaTriBDS: 2397000000,
      vonTuCo: 719100000,
      chiPhiTrangBi: 100000000,
      tienThueThang: 6000000,
      laiSuatUuDai: 8,
      thoiGianUuDai: 12,
      laiSuatThaNoi: 10,
      thoiGianVay: 35,
      phiQuanLy: 480000,
      tyLeLapDay: 95,
      thueSuatChoThue: 10,
      thuNhapKhac: 50000000,
      chiPhiSinhHoat: 15000000,
    },
  },
  {
    id: "chung-cu-hcm-optimistic",
    name: "Chung Cư HCM (Kịch bản Lạc quan)",
    description: "Đầu tư chung cư tại TP.HCM với kỳ vọng tăng trưởng tốt",
    category: "chung-cu",
    location: "hcm",
    inputs: {
      giaTriBDS: 3500000000,
      vonTuCo: 1050000000,
      chiPhiTrangBi: 150000000,
      tienThueThang: 12000000,
      laiSuatUuDai: 7.5,
      thoiGianUuDai: 24,
      laiSuatThaNoi: 9.5,
      thoiGianVay: 30,
      phiQuanLy: 600000,
      tyLeLapDay: 98,
      thueSuatChoThue: 10,
      thuNhapKhac: 80000000,
      chiPhiSinhHoat: 25000000,
    },
  },
  {
    id: "nha-pho-danang",
    name: "Nhà Phố Đà Nẵng",
    description: "Đầu tư nhà phố tại Đà Nẵng, phù hợp gia đình có con nhỏ",
    category: "nha-pho",
    location: "danang",
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
      thuNhapKhac: 50000000,
      chiPhiSinhHoat: 15000000,
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
  // ✅ NEW: Modal state
  showResultsModal: boolean;
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
    showResultsModal: false, // ✅ NEW
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

  // ✅ UPDATED: Enhanced calculation handler with modal
  const handleCalculate = useCallback(
    async (inputs: RealEstateInputs) => {
      setAppState((prev) => ({ ...prev, isCalculating: true }));

      try {
        // ✅ Use fixed calculator that eliminates null/NaN
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
          showResultsModal: true, // ✅ NEW: Show modal instead of inline
          calculationHistory: [
            enhancedResult,
            ...prev.calculationHistory.slice(0, 9),
          ],
        }));

        // Save to localStorage
        const newHistory = [
          enhancedResult,
          ...appState.calculationHistory.slice(0, 9),
        ];
        localStorage.setItem("calculation-history", JSON.stringify(newHistory));

        toast.success("Tính toán thành công! 🎉", {
          description: "Kết quả đã sẵn sàng để xem.",
        });
      } catch (error) {
        console.error("Calculation error:", error);
        setAppState((prev) => ({ ...prev, isCalculating: false }));

        // ✅ IMPROVED: Better error handling
        toast.error("Lỗi tính toán", {
          description:
            error instanceof Error
              ? error.message
              : "Vui lòng kiểm tra lại dữ liệu đầu vào.",
        });
      }
    },
    [appState.calculationHistory]
  );

  // ✅ NEW: Modal handlers
  const handleCloseResultsModal = useCallback(() => {
    setAppState((prev) => ({ ...prev, showResultsModal: false }));
  }, []);

  const handleNewCalculation = useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      showResultsModal: false,
      viewState: "INPUT",
      currentResult: null,
    }));
  }, []);

  const handleUpgradeToTimeline = useCallback(() => {
    if (appState.currentResult) {
      setAppState((prev) => ({
        ...prev,
        mode: "TIMELINE",
        viewState: "TIMELINE",
        showResultsModal: false,
      }));
      toast.success("Chuyển sang Timeline Mode! 🚀");
    }
  }, [appState.currentResult]);

  // Timeline mode handlers
  const handleSwitchToTimeline = useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      mode: "TIMELINE",
      viewState: "TIMELINE",
    }));
  }, []);

  const handleSwitchToClassic = useCallback(() => {
    setAppState((prev) => ({ ...prev, mode: "CLASSIC", viewState: "INPUT" }));
  }, []);

  // Preset handlers
  const handlePresetSelect = useCallback((preset: PresetScenario) => {
    setAppState((prev) => ({ ...prev, selectedPreset: preset }));
    toast.success(`Đã tải template "${preset.name}"`);
  }, []);

  // Confirm calculation handler
  const handleConfirmCalculation = useCallback(() => {
    if (pendingCalculation) {
      handleCalculate(pendingCalculation);
      setPendingCalculation(null);
      setShowCalculationConfirm(false);
    }
  }, [pendingCalculation, handleCalculate]);

  // ===== COMPUTED VALUES =====
  const hasCalculationHistory = appState.calculationHistory.length > 0;
  const currentCalculation = appState.currentResult;

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* ===== HEADER SECTION ===== */}
        <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white border-0">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="h-8 w-8" />
              <CardTitle className="text-3xl font-bold">
                Real Estate Calculator Pro
              </CardTitle>
            </div>
            <CardDescription className="text-blue-100 text-lg">
              Phân tích đầu tư bất động sản chuyên nghiệp với AI hỗ trợ
            </CardDescription>

            {/* Mode Selector */}
            <div className="flex justify-center mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <div className="flex gap-1">
                  <Button
                    variant={
                      appState.mode === "CLASSIC" ? "secondary" : "ghost"
                    }
                    onClick={handleSwitchToClassic}
                    className={`${
                      appState.mode === "CLASSIC"
                        ? "bg-white text-blue-600"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Classic Mode
                  </Button>
                  <Button
                    variant={
                      appState.mode === "TIMELINE" ? "secondary" : "ghost"
                    }
                    onClick={handleSwitchToTimeline}
                    className={`${
                      appState.mode === "TIMELINE"
                        ? "bg-white text-green-600"
                        : "text-white hover:bg-white/20"
                    } relative`}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Timeline Mode
                    <Badge className="ml-2 bg-yellow-400 text-yellow-900 text-xs">
                      Pro
                    </Badge>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* ===== CLASSIC MODE ===== */}
        {appState.mode === "CLASSIC" && (
          <div className="space-y-8">
            {/* ===== PRESET SCENARIOS SECTION ===== */}
            {showPresets && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Templates Sẵn Có
                      </CardTitle>
                      <CardDescription>
                        Chọn template phù hợp để bắt đầu nhanh
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPresets(false)}
                    >
                      Ẩn
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRESET_SCENARIOS.map((preset) => (
                      <Card
                        key={preset.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          appState.selectedPreset?.id === preset.id
                            ? "border-blue-500 bg-blue-50"
                            : ""
                        }`}
                        onClick={() => handlePresetSelect(preset)}
                      >
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-sm">
                                {preset.name}
                              </h4>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {preset.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {preset.location}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {preset.description}
                            </p>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span>Giá trị:</span>
                                <span className="font-medium">
                                  {preset.inputs.giaTriBDS
                                    ? `${(
                                        preset.inputs.giaTriBDS / 1000000000
                                      ).toFixed(1)}B`
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Thuê/tháng:</span>
                                <span className="font-medium">
                                  {preset.inputs.tienThueThang
                                    ? `${(
                                        preset.inputs.tienThueThang / 1000000
                                      ).toFixed(0)}M`
                                    : "N/A"}
                                </span>
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

            {/* ===== MAIN CALCULATION FORM ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PropertyInputForm
                  onCalculate={handleCalculateWithConfirm}
                  isLoading={appState.isCalculating}
                  showTimelineToggle={false}
                  selectedPreset={appState.selectedPreset}
                />
              </div>

              <div className="space-y-6">
                {/* Quick Stats */}
                {hasCalculationHistory && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Lịch Sử Tính Toán
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {appState.calculationHistory
                          .slice(0, 3)
                          .map((calc, index) => (
                            <div
                              key={calc.calculationId || index}
                              className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setAppState((prev) => ({
                                  ...prev,
                                  currentResult: calc,
                                  showResultsModal: true,
                                }));
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-sm font-medium">
                                    {calc.inputs.giaTriBDS
                                      ? `${(
                                          calc.inputs.giaTriBDS / 1000000000
                                        ).toFixed(1)}B VND`
                                      : "N/A"}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {calc.calculatedAt
                                      ? new Date(
                                          calc.calculatedAt
                                        ).toLocaleDateString("vi-VN")
                                      : "N/A"}
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    (calc.steps?.dongTienRongBDS || 0) > 0
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {(calc.roiHangNam || 0).toFixed(1)}% ROI
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>

                      {hasCalculationHistory && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => setShowComparison(true)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          So sánh kịch bản
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* AI Advisory */}
                {currentCalculation && (
                  <AIAdvisorySystem
                    result={currentCalculation}
                    onTimelineUpgrade={handleUpgradeToTimeline}
                  />
                )}

                {/* Feature Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Tính Năng Nổi Bật
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Tính toán ROI chính xác</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Phân tích dòng tiền chi tiết</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Cảnh báo rủi ro thông minh</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span>AI Advisory System</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Rocket className="h-4 w-4 text-purple-500" />
                        <span>Timeline Mode (Pro)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ===== TIMELINE MODE ===== */}
        {appState.mode === "TIMELINE" && (
          <div className="space-y-8">
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <div>
                    <CardTitle className="text-purple-800">
                      Timeline Mode - Phân tích 240 tháng
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                      Mô phỏng chi tiết với events và scenarios
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <TimelineDashboard />
          </div>
        )}

        {/* ===== MODALS ===== */}

        {/* ✅ NEW: Results Modal */}
        <CalculationResultsModal
          result={appState.currentResult}
          isOpen={appState.showResultsModal}
          onClose={handleCloseResultsModal}
          onNewCalculation={handleNewCalculation}
          onUpgradeToTimeline={handleUpgradeToTimeline}
        />

        {/* Calculation Confirmation Dialog */}
        <Dialog
          open={showCalculationConfirm}
          onOpenChange={setShowCalculationConfirm}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận tính toán</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn thực hiện tính toán với dữ liệu hiện tại?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCalculationConfirm(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleConfirmCalculation}>
                {appState.isCalculating && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Xác nhận
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scenario Comparison Modal */}
        {showComparison && (
          <Dialog open={showComparison} onOpenChange={setShowComparison}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>So sánh kịch bản</DialogTitle>
                <DialogDescription>
                  Phân tích và so sánh các kịch bản đầu tư
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-auto">
                <ScenarioComparison scenarios={appState.calculationHistory} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
