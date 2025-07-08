// src/app/page.tsx - UPDATED FOR USER-CENTRIC FORM
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
  Brain,
  Zap,
  Lightbulb,
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

// ENHANCED Preset scenarios với user-friendly approach
const PRESET_SCENARIOS: PresetScenario[] = [
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
    name: "💎 Chung cư cao cấp - ROI cao",
    description:
      "Căn hộ view đẹp khu trung tâm, giá thuê cao, phù hợp nhà đầu tư có kinh nghiệm",
    category: "chung-cu",
    location: "hcm",
    inputs: {
      giaTriBDS: 4500000000, // 4.5 tỷ
      vonTuCo: 1500000000, // 1.5 tỷ
      chiPhiTrangBi: 80000000, // 80 triệu
      tienThueThang: 35000000, // 35 triệu
      laiSuatUuDai: 8,
      thoiGianUuDai: 18,
      laiSuatThaNoi: 10,
      thoiGianVay: 20,
      phiQuanLy: 800000,
      tyLeLapDay: 90,
      phiBaoTri: 1.5,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "townhouse-rental",
    name: "🏘️ Nhà phố cho thuê - Dòng tiền khủng",
    description: "Nhà phố 4 tầng cho thuê văn phòng hoặc ở ghép, thu nhập cao",
    category: "nha-pho",
    location: "hanoi",
    inputs: {
      giaTriBDS: 6000000000, // 6 tỷ
      vonTuCo: 2000000000, // 2 tỷ
      chiPhiTrangBi: 100000000, // 100 triệu
      tienThueThang: 45000000, // 45 triệu
      laiSuatUuDai: 7.5,
      thoiGianUuDai: 24,
      laiSuatThaNoi: 9.5,
      thoiGianVay: 25,
      phiQuanLy: 600000,
      tyLeLapDay: 92,
      phiBaoTri: 2,
      thueSuatChoThue: 10,
    },
  },
  {
    id: "budget-smart",
    name: "💡 Ngân sách hạn chế - Thông minh",
    description:
      "Tối ưu cho người có vốn ít, muốn bắt đầu đầu tư BĐS với rủi ro thấp",
    category: "chung-cu",
    location: "other",
    inputs: {
      giaTriBDS: 1800000000, // 1.8 tỷ
      vonTuCo: 600000000, // 600 triệu
      chiPhiTrangBi: 25000000, // 25 triệu
      tienThueThang: 12000000, // 12 triệu
      laiSuatUuDai: 8.5,
      thoiGianUuDai: 12,
      laiSuatThaNoi: 10.5,
      thoiGianVay: 25,
      phiQuanLy: 250000,
      tyLeLapDay: 96,
      phiBaoTri: 1,
      thueSuatChoThue: 5, // Thuế ưu đãi
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

  // ENHANCED: Calculation handler với better data processing
  const handleCalculate = async (inputs: RealEstateInputs) => {
    console.log("handleCalculate called with:", inputs);
    setIsCalculating(true);

    try {
      // Simulate async calculation với realistic timing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Calculate derived tyLeVay từ vonTuCo
      const soTienVay = Math.max(0, inputs.giaTriBDS! - inputs.vonTuCo!);
      const tyLeVay =
        inputs.giaTriBDS! > 0 ? (soTienVay / inputs.giaTriBDS!) * 100 : 0;

      // Merge với calculated values
      const completeInputs = {
        ...inputs,
        tyLeVay,
      };

      // Perform calculation
      const result = calculateRealEstateInvestment(completeInputs);

      // Add metadata
      result.scenarioName =
        selectedPreset?.name || `Kịch bản ${formatVND(inputs.giaTriBDS || 0)}`;
      result.calculatedAt = new Date().toISOString();

      setCurrentResult(result);
      saveToHistory(result);

      // Enhanced success message với insights
      const isProfit = result.steps.dongTienRongBDS > 0;
      const roi = result.roiHangNam;

      let message = "";
      if (isProfit && roi > 10) {
        message = "🎉 Tuyệt vời! Đầu tư có tiềm năng sinh lời cao!";
      } else if (isProfit && roi > 5) {
        message = "✅ Tốt! Đầu tư có dòng tiền dương và ROI hợp lý.";
      } else if (isProfit) {
        message = "⚠️ Có lời nhưng ROI thấp. Cân nhắc tối ưu hóa.";
      } else {
        message =
          "🚨 Cần cân nhắc! Dòng tiền âm - bạn sẽ phải bỏ thêm tiền hàng tháng.";
      }

      toast.success(message, {
        description: `ROI: ${roi.toFixed(
          1
        )}% | Dòng tiền: ${result.steps.dongTienRongBDS.toLocaleString(
          "vi-VN"
        )} ₫/tháng`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("❌ Có lỗi xảy ra khi tính toán", {
        description:
          error instanceof Error
            ? error.message
            : "Vui lòng thử lại hoặc liên hệ hỗ trợ",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // ENHANCED: Preset selection với smart guidance
  const handlePresetSelect = (preset: PresetScenario) => {
    console.log("Selecting preset:", preset);
    setSelectedPreset(preset);
    setPresetDialogOpen(false);

    // Clear current result to show form
    setCurrentResult(null);

    // Enhanced toast với preview info
    const expectedROI =
      preset.inputs.tienThueThang && preset.inputs.giaTriBDS
        ? (
            ((preset.inputs.tienThueThang * 12) / preset.inputs.giaTriBDS!) *
            100
          ).toFixed(1)
        : "N/A";

    toast.success(`🎯 Áp dụng: ${preset.name}`, {
      description: `Dự kiến ROI: ${expectedROI}% | Có thể tùy chỉnh theo nhu cầu`,
      duration: 4000,
    });
  };

  // Export functionality
  const handleExport = () => {
    if (!currentResult) return;

    const exportData = {
      ...currentResult,
      exportedAt: new Date().toISOString(),
      metadata: {
        calculatorVersion: "2.0",
        userAgent: navigator.userAgent,
      },
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

    toast.success("📄 Đã xuất báo cáo thành công!", {
      description: "File JSON chứa đầy đủ thông tin phân tích",
    });
  };

  // Navigation
  const handleNewCalculation = () => {
    setCurrentResult(null);
    setSelectedPreset(null);
    setCurrentView("single");
  };

  // Comparison functionality
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
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
            Chỉ cần giá nhà và số tiền bạn có - chúng tôi sẽ tính toán tất cả
            còn lại.
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
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-xl shadow-lg border border-gray-200">
            <Button
              variant={currentView === "single" ? "default" : "ghost"}
              onClick={() => setCurrentView("single")}
              className="mr-1 rounded-lg"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Tính Toán Thông Minh
            </Button>
            <Button
              variant={currentView === "comparison" ? "default" : "ghost"}
              onClick={() => setCurrentView("comparison")}
              disabled={!canAccessComparison}
              className="relative rounded-lg"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              So Sánh Kịch Bản
              {comparisonScenarios.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {comparisonScenarios.length}
                </Badge>
              )}
              {!canAccessComparison && (
                <span className="absolute -top-1 -right-1">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Smart guidance for comparison */}
        {!canAccessComparison && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Mẹo thông minh</p>
                  <p className="text-sm text-blue-700">
                    Hoàn thành một tính toán để mở khóa tính năng so sánh kịch
                    bản và tìm ra phương án đầu tư tối ưu nhất
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "single" ? (
          // Single Calculation View
          !currentResult ? (
            <div className="max-w-6xl mx-auto">
              {/* ENHANCED Quick Start Section */}
              <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-white to-blue-50/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Bắt Đầu Thông Minh
                  </CardTitle>
                  <CardDescription className="text-base">
                    Chọn kịch bản phù hợp hoặc bắt đầu từ con số bạn đã biết.
                    <span className="font-semibold text-blue-600">
                      {" "}
                      Chúng tôi sẽ lo phần còn lại.
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {PRESET_SCENARIOS.map((preset) => (
                      <Card
                        key={preset.id}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${
                          selectedPreset?.id === preset.id
                            ? "border-primary bg-primary/5 shadow-lg"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                        onClick={() => handlePresetSelect(preset)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              {getCategoryIcon(preset.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg leading-tight mb-2">
                                {preset.name}
                              </h4>
                              <div className="flex items-center gap-2 mb-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline" className="text-xs">
                                  {getLocationName(preset.location)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {preset.description}
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <div className="text-xs text-blue-600 mb-1">
                                Giá trị
                              </div>
                              <div className="font-bold text-blue-800">
                                {(
                                  preset.inputs.giaTriBDS! / 1000000000
                                ).toFixed(1)}{" "}
                                tỷ
                              </div>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                              <div className="text-xs text-green-600 mb-1">
                                Thuê/tháng
                              </div>
                              <div className="font-bold text-green-800">
                                {(
                                  preset.inputs.tienThueThang! / 1000000
                                ).toFixed(0)}{" "}
                                triệu
                              </div>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                              <div className="text-xs text-orange-600 mb-1">
                                Vốn tự có
                              </div>
                              <div className="font-bold text-orange-800">
                                {(preset.inputs.vonTuCo! / 1000000000).toFixed(
                                  1
                                )}{" "}
                                tỷ
                              </div>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                              <div className="text-xs text-purple-600 mb-1">
                                Dự kiến ROI
                              </div>
                              <div className="font-bold text-purple-800">
                                {(
                                  ((preset.inputs.tienThueThang! * 12) /
                                    preset.inputs.giaTriBDS!) *
                                  100
                                ).toFixed(1)}
                                %
                              </div>
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
                        <Button variant="outline" size="lg" className="px-8">
                          <BookOpen className="h-5 w-5 mr-2" />
                          Xem tất cả kịch bản mẫu
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[85vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Chọn Kịch Bản Phù Hợp
                          </DialogTitle>
                          <DialogDescription className="text-base">
                            Mỗi kịch bản được thiết kế cho nhóm nhà đầu tư khác
                            nhau với mức rủi ro và lợi nhuận khác nhau
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {PRESET_SCENARIOS.map((preset) => (
                            <Card
                              key={preset.id}
                              className="cursor-pointer hover:shadow-lg transition-all duration-300"
                              onClick={() => handlePresetSelect(preset)}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    {getCategoryIcon(preset.category)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-lg">
                                      {preset.name}
                                    </h4>
                                    <Badge variant="outline" className="mt-1">
                                      {getLocationName(preset.location)}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {preset.description}
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Giá trị:{" "}
                                    </span>
                                    <span className="font-semibold">
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
                                    <span className="font-semibold">
                                      {(
                                        preset.inputs.tienThueThang! / 1000000
                                      ).toFixed(0)}
                                      M/tháng
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Vốn:{" "}
                                    </span>
                                    <span className="font-semibold">
                                      {(
                                        preset.inputs.vonTuCo! / 1000000000
                                      ).toFixed(1)}
                                      B VNĐ
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      ROI:{" "}
                                    </span>
                                    <span className="font-semibold text-green-600">
                                      {(
                                        ((preset.inputs.tienThueThang! * 12) /
                                          preset.inputs.giaTriBDS!) *
                                        100
                                      ).toFixed(1)}
                                      %
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
                <Card className="mb-6 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Lịch Sử Tính Toán
                    </CardTitle>
                    <CardDescription>
                      Quay lại các phân tích trước đó hoặc so sánh với kịch bản
                      mới
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {calculationHistory.slice(0, 6).map((result, index) => (
                        <Card
                          key={index}
                          className="cursor-pointer hover:shadow-md transition-all border hover:border-primary/50"
                          onClick={() => setCurrentResult(result)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-sm truncate">
                                {result.scenarioName || "Kịch bản tùy chỉnh"}
                              </h4>
                              <Badge
                                variant={
                                  result.steps.dongTienRongBDS > 0
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs shrink-0 ml-2"
                              >
                                {result.steps.dongTienRongBDS > 0
                                  ? "Lời"
                                  : "Lỗ"}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  ROI:
                                </span>
                                <span
                                  className={`font-semibold ${
                                    result.roiHangNam > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {result.roiHangNam.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Dòng tiền:
                                </span>
                                <span
                                  className={`font-semibold ${
                                    result.steps.dongTienRongBDS > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {(
                                    result.steps.dongTienRongBDS / 1000000
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

              {/* ENHANCED Add to Comparison */}
              <Card className="mt-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-blue-800">
                        🔍 So Sánh Kịch Bản
                      </h3>
                      <p className="text-blue-700 mb-2">
                        Thêm kết quả này vào danh sách để so sánh với các phương
                        án khác và tìm ra lựa chọn tối ưu
                      </p>
                      {comparisonScenarios.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {comparisonScenarios.length} kịch bản
                          </Badge>
                          <span className="text-blue-600">
                            đang chờ so sánh
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleAddToComparison(currentResult)}
                        disabled={comparisonScenarios.some(
                          (s) => s.calculatedAt === currentResult.calculatedAt
                        )}
                        className="border-blue-300 hover:bg-blue-50"
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
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        So sánh ngay
                        {comparisonScenarios.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-white text-blue-600"
                          >
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
          // Comparison View
          <div className="max-w-7xl mx-auto">
            {hasEnoughForComparison ? (
              <ScenarioComparison
                scenarios={comparisonScenarios}
                onRemoveScenario={handleRemoveFromComparison}
                onAddScenario={handleAddNewScenario}
              />
            ) : (
              <Card className="shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    So Sánh Kịch Bản Thông Minh
                  </CardTitle>
                  <CardDescription className="text-base">
                    Cần ít nhất 2 kịch bản để thực hiện so sánh và tìm ra phương
                    án đầu tư tối ưu
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="space-y-6">
                    <div className="text-muted-foreground text-lg">
                      {comparisonScenarios.length === 0 ? (
                        "🎯 Hãy tạo kịch bản đầu tiên để bắt đầu so sánh"
                      ) : (
                        <>
                          ✅ Đã có{" "}
                          <span className="font-bold text-primary">
                            {comparisonScenarios.length}
                          </span>{" "}
                          kịch bản. Cần thêm{" "}
                          <span className="font-bold text-orange-600">
                            {2 - comparisonScenarios.length}
                          </span>{" "}
                          kịch bản nữa.
                        </>
                      )}
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={handleAddNewScenario}
                        size="lg"
                        className="px-8"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Tạo kịch bản mới
                      </Button>
                      {calculationHistory.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentView("single")}
                          size="lg"
                          className="px-8"
                        >
                          <History className="h-5 w-5 mr-2" />
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

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-gray-500 space-y-2">
          <p className="font-medium">
            © 2025 Real Estate Smart Calculator. Công cụ AI hỗ trợ quyết định
            đầu tư bất động sản.
          </p>
          <p>
            Kết quả tính toán mang tính chất tham khảo. Hãy tư vấn chuyên gia
            trước khi đầu tư.
          </p>
        </div>
      </div>
    </div>
  );
}
