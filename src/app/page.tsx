// src/app/page.tsx - FIXED COMPARISON LOGIC
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

import PropertyInputForm from "@/components/PropertyInputForm";
import CalculationResults from "@/components/CalculationResults";
import ScenarioComparison from "@/components/ScenarioComparison";
import {
  RealEstateInputs,
  CalculationResult,
  PresetScenario,
} from "@/types/real-estate";
import { calculateRealEstateInvestment } from "@/lib/real-estate-calculator";

// Enhanced Preset scenarios
const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "chung-cu-hcm-basic",
    name: "Chung cư 2PN Quận 7, TP.HCM",
    description:
      "Căn hộ chung cư điển hình cho thuê, phù hợp đầu tư cho người mới",
    category: "chung-cu",
    location: "hcm",
    inputs: {
      giaTriBDS: 3500000000, // 3.5 tỷ
      chiPhiTrangBi: 50000000, // 50 triệu
      tyLeVay: 70,
      chiPhiMua: 2,
      baoHiemKhoanVay: 1.5,
      laiSuatUuDai: 8,
      thoiGianUuDai: 12,
      laiSuatThaNoi: 10,
      thoiGianVay: 20,
      tienThueThang: 25000000, // 25 triệu
      phiQuanLy: 500000,
      baoHiemTaiSan: 0.1,
      tyLeLapDay: 95,
      phiBaoTri: 1,
      duPhongCapEx: 1,
      thueSuatChoThue: 10,
      chiPhiBan: 3,
      thuNhapKhac: 30000000,
      chiPhiSinhHoat: 20000000,
    },
  },
  {
    id: "nha-pho-hanoi",
    name: "Nhà phố 4 tầng Cầu Giấy, Hà Nội",
    description: "Nhà phố cho thuê văn phòng hoặc ở ghép, ROI cao",
    category: "nha-pho",
    location: "hanoi",
    inputs: {
      giaTriBDS: 6000000000, // 6 tỷ
      chiPhiTrangBi: 100000000, // 100 triệu
      tyLeVay: 65,
      chiPhiMua: 2.5,
      baoHiemKhoanVay: 1.5,
      laiSuatUuDai: 7.5,
      thoiGianUuDai: 24,
      laiSuatThaNoi: 9.5,
      thoiGianVay: 25,
      tienThueThang: 40000000, // 40 triệu
      phiQuanLy: 800000,
      baoHiemTaiSan: 0.15,
      tyLeLapDay: 90,
      phiBaoTri: 1.5,
      duPhongCapEx: 1.5,
      thueSuatChoThue: 10,
      chiPhiBan: 3,
      thuNhapKhac: 50000000,
      chiPhiSinhHoat: 30000000,
    },
  },
  {
    id: "chung-cu-luxury-danang",
    name: "Chung cư cao cấp Đà Nẵng",
    description: "Căn hộ view biển, cho thuê ngắn hạn, thị trường du lịch",
    category: "chung-cu",
    location: "danang",
    inputs: {
      giaTriBDS: 4500000000, // 4.5 tỷ
      chiPhiTrangBi: 80000000, // 80 triệu
      tyLeVay: 75,
      chiPhiMua: 2,
      baoHiemKhoanVay: 1.5,
      laiSuatUuDai: 8.5,
      thoiGianUuDai: 18,
      laiSuatThaNoi: 10.5,
      thoiGianVay: 20,
      tienThueThang: 30000000, // 30 triệu
      phiQuanLy: 1000000,
      baoHiemTaiSan: 0.2,
      tyLeLapDay: 85, // Lower due to seasonal tourism
      phiBaoTri: 2,
      duPhongCapEx: 2,
      thueSuatChoThue: 10,
      chiPhiBan: 3,
      thuNhapKhac: 40000000,
      chiPhiSinhHoat: 25000000,
    },
  },
  {
    id: "budget-apartment",
    name: "Chung cư giá rẻ ngoại thành",
    description: "Đầu tư với ngân sách hạn chế, phù hợp người lao động",
    category: "chung-cu",
    location: "other",
    inputs: {
      giaTriBDS: 1800000000, // 1.8 tỷ
      chiPhiTrangBi: 30000000, // 30 triệu
      tyLeVay: 80,
      chiPhiMua: 2,
      baoHiemKhoanVay: 1.5,
      laiSuatUuDai: 9,
      thoiGianUuDai: 12,
      laiSuatThaNoi: 11,
      thoiGianVay: 20,
      tienThueThang: 12000000, // 12 triệu
      phiQuanLy: 300000,
      baoHiemTaiSan: 0.1,
      tyLeLapDay: 95,
      phiBaoTri: 1,
      duPhongCapEx: 1,
      thueSuatChoThue: 10,
      chiPhiBan: 3,
      thuNhapKhac: 20000000,
      chiPhiSinhHoat: 15000000,
    },
  },
];

export default function RealEstateCalculator() {
  // States
  const [currentResult, setCurrentResult] =
    React.useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [selectedPreset, setSelectedPreset] =
    React.useState<PresetScenario | null>(null);
  const [calculationHistory, setCalculationHistory] = React.useState<
    CalculationResult[]
  >([]);
  const [currentView, setCurrentView] = React.useState<"single" | "comparison">(
    "single"
  );
  const [comparisonScenarios, setComparisonScenarios] = React.useState<
    CalculationResult[]
  >([]);
  const [presetDialogOpen, setPresetDialogOpen] = React.useState(false);

  // Load history from localStorage on mount
  React.useEffect(() => {
    const savedHistory = localStorage.getItem("real-estate-calculator-history");
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setCalculationHistory(history);
      } catch (error) {
        console.error("Error loading history:", error);
      }
    }
  }, []);

  // Save to history
  const saveToHistory = React.useCallback(
    (result: CalculationResult) => {
      const newHistory = [result, ...calculationHistory.slice(0, 9)]; // Keep last 10
      setCalculationHistory(newHistory);
      localStorage.setItem(
        "real-estate-calculator-history",
        JSON.stringify(newHistory)
      );
    },
    [calculationHistory]
  );

  // ENHANCED: Main calculation handler with better error handling
  const handleCalculate = async (inputs: RealEstateInputs) => {
    console.log("handleCalculate called with:", inputs);
    setIsCalculating(true);

    try {
      // Simulate async calculation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Perform calculation
      const result = calculateRealEstateInvestment(inputs);

      // Add metadata
      result.scenarioName = selectedPreset?.name || "Kịch bản tùy chỉnh";
      result.calculatedAt = new Date().toISOString();

      setCurrentResult(result);
      saveToHistory(result);

      toast.success("✅ Tính toán hoàn tất!", {
        description: `Dòng tiền ròng: ${result.steps.dongTienRongBDS.toLocaleString(
          "vi-VN"
        )} VNĐ/tháng`,
      });
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("❌ Lỗi tính toán", {
        description:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra trong quá trình tính toán",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // ENHANCED: Preset selection with proper form value loading
  const handlePresetSelect = (preset: PresetScenario) => {
    console.log("Selecting preset:", preset);
    setSelectedPreset(preset);
    setPresetDialogOpen(false);

    // Clear current result to show form
    setCurrentResult(null);

    toast.success(`✅ Đã áp dụng: ${preset.name}`, {
      description: "Thông tin đã được điền tự động vào form",
    });
  };

  // Export functionality
  const handleExport = () => {
    if (!currentResult) return;

    const exportData = {
      ...currentResult,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `real-estate-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("📄 Đã xuất báo cáo thành công!");
  };

  // Navigation
  const handleNewCalculation = () => {
    setCurrentResult(null);
    setSelectedPreset(null);
    setCurrentView("single");
  };

  // FIXED: Comparison functionality with better logic
  const handleAddToComparison = (result: CalculationResult) => {
    const exists = comparisonScenarios.some(
      (s) => s.calculatedAt === result.calculatedAt
    );

    if (exists) {
      toast.error("⚠️ Kịch bản đã có trong danh sách so sánh");
      return;
    }

    if (comparisonScenarios.length >= 5) {
      toast.error("⚠️ Đã đạt giới hạn", {
        description: "Chỉ có thể so sánh tối đa 5 kịch bản",
      });
      return;
    }

    setComparisonScenarios((prev) => [...prev, result]);
    toast.success("✅ Đã thêm vào so sánh!", {
      description: `Hiện có ${
        comparisonScenarios.length + 1
      } kịch bản để so sánh`,
    });
  };

  const handleRemoveFromComparison = (index: number) => {
    setComparisonScenarios((prev) => prev.filter((_, i) => i !== index));
    toast.success("🗑️ Đã xóa kịch bản khỏi so sánh");
  };

  const handleStartComparison = () => {
    if (
      currentResult &&
      !comparisonScenarios.some(
        (s) => s.calculatedAt === currentResult.calculatedAt
      )
    ) {
      handleAddToComparison(currentResult);
    }
    setCurrentView("comparison");
  };

  const handleAddNewScenario = () => {
    setCurrentView("single");
    setCurrentResult(null);
    setSelectedPreset(null);
  };

  // Helper functions for UI
  const getCategoryIcon = (category: PresetScenario["category"]) => {
    switch (category) {
      case "chung-cu":
        return <Building className="h-5 w-5" />;
      case "nha-pho":
        return <Home className="h-5 w-5" />;
      default:
        return <Home className="h-5 w-5" />;
    }
  };

  const getLocationName = (location: PresetScenario["location"]) => {
    switch (location) {
      case "hcm":
        return "TP. Hồ Chí Minh";
      case "hanoi":
        return "Hà Nội";
      case "danang":
        return "Đà Nẵng";
      default:
        return "Khác";
    }
  };

  // ENHANCED: Better comparison availability check
  const canAccessComparison =
    comparisonScenarios.length >= 1 || currentResult !== null;
  const hasEnoughForComparison = comparisonScenarios.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-4">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">
              Real Estate Calculator
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tính Toán Đầu Tư Bất Động Sản
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Phân tích chuyên sâu dòng tiền, ROI và các chỉ số quan trọng để đưa
            ra quyết định đầu tư thông minh
          </p>
        </div>

        {/* Navigation Tabs - FIXED LOGIC */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-lg shadow-md border">
            <Button
              variant={currentView === "single" ? "default" : "ghost"}
              onClick={() => setCurrentView("single")}
              className="mr-1"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Tính Toán Đơn
            </Button>
            <Button
              variant={currentView === "comparison" ? "default" : "ghost"}
              onClick={() => setCurrentView("comparison")}
              disabled={!canAccessComparison}
              className="relative"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              So Sánh Kịch Bản
              {comparisonScenarios.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {comparisonScenarios.length}
                </Badge>
              )}
              {!canAccessComparison && (
                <span className="absolute -top-2 -right-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Info message for comparison */}
        {!canAccessComparison && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Mẹo:</strong> Hoàn thành ít nhất một tính toán để sử
                  dụng tính năng so sánh kịch bản
                </p>
              </div>
            </div>
          </div>
        )}

        {currentView === "single" ? (
          // Single Calculation View
          !currentResult ? (
            <div className="max-w-6xl mx-auto">
              {/* Quick Start Section - ENHANCED */}
              <Card className="mb-6 border-2 border-primary/20 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Bắt Đầu Nhanh
                  </CardTitle>
                  <CardDescription>
                    Chọn kịch bản mẫu để bắt đầu nhanh hoặc nhập thông tin tự
                    tùy chỉnh
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {PRESET_SCENARIOS.map((preset) => (
                      <Card
                        key={preset.id}
                        className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                          selectedPreset?.id === preset.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handlePresetSelect(preset)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            {getCategoryIcon(preset.category)}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm leading-tight mb-1">
                                {preset.name}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {getLocationName(preset.location)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {preset.description}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Giá trị:</span>
                              <span className="font-medium">
                                {(
                                  preset.inputs.giaTriBDS! / 1000000000
                                ).toFixed(1)}
                                B
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Thuê:</span>
                              <span className="font-medium">
                                {(
                                  preset.inputs.tienThueThang! / 1000000
                                ).toFixed(0)}
                                M/tháng
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center">
                    <Dialog
                      open={presetDialogOpen}
                      onOpenChange={setPresetDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Xem tất cả templates
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Chọn Template Kịch Bản</DialogTitle>
                          <DialogDescription>
                            Chọn một kịch bản phù hợp để bắt đầu nhanh
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {PRESET_SCENARIOS.map((preset) => (
                            <Card
                              key={preset.id}
                              className="cursor-pointer hover:shadow-md transition-all"
                              onClick={() => handlePresetSelect(preset)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  {getCategoryIcon(preset.category)}
                                  <div>
                                    <h4 className="font-semibold">
                                      {preset.name}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {getLocationName(preset.location)}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {preset.description}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Giá trị:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {(
                                        preset.inputs.giaTriBDS! / 1000000000
                                      ).toFixed(1)}
                                      B VNĐ
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Thuê:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {(
                                        preset.inputs.tienThueThang! / 1000000
                                      ).toFixed(0)}
                                      M/tháng
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Vay:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {preset.inputs.tyLeVay}%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Lãi suất:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {preset.inputs.laiSuatUuDai}%
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
                </CardContent>
              </Card>

              {/* Recent Calculations History */}
              {calculationHistory.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Tính Toán Gần Đây
                    </CardTitle>
                    <CardDescription>
                      Các kết quả tính toán trước đó của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {calculationHistory.slice(0, 6).map((result, index) => (
                        <Card
                          key={index}
                          className="cursor-pointer hover:shadow-md transition-all border"
                          onClick={() => setCurrentResult(result)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">
                                {result.scenarioName || "Kịch bản tùy chỉnh"}
                              </h4>
                              <Badge
                                variant={
                                  result.steps.dongTienRongBDS > 0
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {result.steps.dongTienRongBDS > 0
                                  ? "Dương"
                                  : "Âm"}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  ROI:
                                </span>
                                <span className="font-medium">
                                  {result.roiHangNam.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Dòng tiền:
                                </span>
                                <span
                                  className={`font-medium ${
                                    result.steps.dongTienRongBDS > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {result.steps.dongTienRongBDS.toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  ₫
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(
                                result.calculatedAt || ""
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Main Form */}
              <PropertyInputForm
                onCalculate={handleCalculate}
                initialValues={selectedPreset?.inputs}
                isLoading={isCalculating}
              />
            </div>
          ) : (
            /* Results View */
            <div className="max-w-7xl mx-auto">
              <CalculationResults
                result={currentResult}
                onExport={handleExport}
                onNewCalculation={handleNewCalculation}
              />

              {/* Add to Comparison - ENHANCED */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">So Sánh Kịch Bản</h3>
                      <p className="text-sm text-muted-foreground">
                        Thêm kết quả này vào danh sách so sánh để đánh giá với
                        các phương án khác
                      </p>
                      {comparisonScenarios.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          Hiện có {comparisonScenarios.length} kịch bản trong
                          danh sách so sánh
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleAddToComparison(currentResult)}
                        disabled={comparisonScenarios.some(
                          (s) => s.calculatedAt === currentResult.calculatedAt
                        )}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {comparisonScenarios.some(
                          (s) => s.calculatedAt === currentResult.calculatedAt
                        )
                          ? "Đã thêm"
                          : "Thêm vào so sánh"}
                      </Button>
                      <Button
                        onClick={handleStartComparison}
                        disabled={!hasEnoughForComparison && !currentResult}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        So sánh ngay
                        {comparisonScenarios.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {comparisonScenarios.length}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        ) : (
          // Comparison View - ENHANCED
          <div className="max-w-7xl mx-auto">
            {hasEnoughForComparison ? (
              <ScenarioComparison
                scenarios={comparisonScenarios}
                onRemoveScenario={handleRemoveFromComparison}
                onAddScenario={handleAddNewScenario}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>So Sánh Kịch Bản</CardTitle>
                  <CardDescription>
                    Cần ít nhất 2 kịch bản để thực hiện so sánh hiệu quả
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      {comparisonScenarios.length === 0
                        ? "Chưa có kịch bản nào trong danh sách so sánh"
                        : `Hiện có ${
                            comparisonScenarios.length
                          } kịch bản. Cần thêm ${
                            2 - comparisonScenarios.length
                          } kịch bản nữa để so sánh.`}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleAddNewScenario}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo kịch bản mới
                      </Button>
                      {calculationHistory.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentView("single")}
                        >
                          <History className="h-4 w-4 mr-2" />
                          Chọn từ lịch sử
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Educational Resources */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <BookOpen className="h-5 w-5" />
              Tài Nguyên Học Tập
            </CardTitle>
            <CardDescription>
              Tìm hiểu thêm về đầu tư bất động sản và cách sử dụng công cụ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2">Hướng Dẫn Sử Dụng</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Cách nhập thông số và hiểu kết quả phân tích
                </p>
                <Button variant="outline" size="sm">
                  Xem hướng dẫn <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2">Kiến Thức BĐS</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Các khái niệm cơ bản về đầu tư bất động sản
                </p>
                <Button variant="outline" size="sm">
                  Tìm hiểu <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2">Công Thức Tính</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Chi tiết các công thức và phương pháp tính toán
                </p>
                <Button variant="outline" size="sm">
                  Xem chi tiết <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            © 2025 Real Estate Calculator. Công cụ hỗ trợ quyết định đầu tư bất
            động sản.
          </p>
          <p className="mt-1">
            Kết quả tính toán chỉ mang tính chất tham khảo. Hãy tư vấn chuyên
            gia trước khi đầu tư.
          </p>
        </div>
      </div>
    </div>
  );
}
