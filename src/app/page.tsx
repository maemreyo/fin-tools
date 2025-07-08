// src/app/page.tsx

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Preset scenarios cho người mới
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
      laiSuatThaNoi: 12,
      thoiGianVay: 20,
      tienThueThang: 15000000, // 15 triệu/tháng
      phiQuanLy: 500000, // 500k/tháng
      baoHiemTaiSan: 0.15,
      tyLeLapDay: 95,
      phiBaoTri: 1,
      duPhongCapEx: 1,
      thueSuatChoThue: 10,
      chiPhiBan: 3,
      thuNhapKhac: 30000000, // 30 triệu/tháng
      chiPhiSinhHoat: 20000000, // 20 triệu/tháng
    },
  },
  {
    id: "nha-pho-hanoi",
    name: "Nhà phố 4 tầng Hà Đông, Hà Nội",
    description: "Nhà phố cho thuê theo tầng, thu nhập ổn định",
    category: "nha-pho",
    location: "hanoi",
    inputs: {
      giaTriBDS: 4200000000, // 4.2 tỷ
      chiPhiTrangBi: 80000000, // 80 triệu
      tyLeVay: 75,
      chiPhiMua: 2.5,
      baoHiemKhoanVay: 1.5,
      laiSuatUuDai: 7.5,
      thoiGianUuDai: 18,
      laiSuatThaNoi: 11.5,
      thoiGianVay: 20,
      tienThueThang: 20000000, // 20 triệu/tháng (4 tầng)
      phiQuanLy: 0, // Tự quản lý
      baoHiemTaiSan: 0.15,
      tyLeLapDay: 90, // Thấp hơn do có thể trống 1-2 tầng
      phiBaoTri: 1.5, // Cao hơn do nhà cũ
      duPhongCapEx: 1.5,
      thueSuatChoThue: 10,
      chiPhiBan: 3,
      thuNhapKhac: 35000000,
      chiPhiSinhHoat: 25000000,
    },
  },
  {
    id: "chung-cu-danang-luxury",
    name: "Chung cư cao cấp Hải Châu, Đà Nẵng",
    description: "Căn hộ cao cấp view biển, cho thuê du lịch/dài hạn",
    category: "chung-cu",
    location: "danang",
    inputs: {
      giaTriBDS: 2800000000, // 2.8 tỷ
      chiPhiTrangBi: 120000000, // 120 triệu (cao cấp)
      tyLeVay: 60, // Ít vay hơn do rủi ro
      chiPhiMua: 2,
      baoHiemKhoanVay: 1.5,
      laiSuatUuDai: 8.5,
      thoiGianUuDai: 12,
      laiSuatThaNoi: 13,
      thoiGianVay: 15, // Ngắn hạn
      tienThueThang: 18000000, // 18 triệu/tháng
      phiQuanLy: 800000, // 800k/tháng (cao cấp)
      baoHiemTaiSan: 0.2,
      tyLeLapDay: 85, // Thấp hơn do du lịch
      phiBaoTri: 0.8,
      duPhongCapEx: 1.2,
      thueSuatChoThue: 10,
      chiPhiBan: 3,
      thuNhapKhac: 40000000,
      chiPhiSinhHoat: 22000000,
    },
  },
  {
    id: "shophouse-investor",
    name: "Shophouse mặt tiền Binh Duong",
    description: "Shophouse 1 trệt 2 lầu, kinh doanh + cho thuê",
    category: "nha-pho",
    location: "other",
    inputs: {
      giaTriBDS: 6500000000, // 6.5 tỷ
      chiPhiTrangBi: 200000000, // 200 triệu
      tyLeVay: 65, // Thận trọng với shophouse
      chiPhiMua: 2,
      baoHiemKhoanVay: 1.5,
      laiSuatUuDai: 9,
      thoiGianUuDai: 6, // Ngắn
      laiSuatThaNoi: 14,
      thoiGianVay: 20,
      tienThueThang: 35000000, // 35 triệu/tháng
      phiQuanLy: 1000000, // 1 triệu/tháng
      baoHiemTaiSan: 0.25,
      tyLeLapDay: 88, // Rủi ro kinh doanh
      phiBaoTri: 2,
      duPhongCapEx: 2,
      thueSuatChoThue: 10,
      chiPhiBan: 4, // Cao hơn
      thuNhapKhac: 50000000,
      chiPhiSinhHoat: 30000000,
    },
  },
];

export default function RealEstateCalculatorPage() {
  const [currentResult, setCurrentResult] =
    React.useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [selectedPreset, setSelectedPreset] =
    React.useState<PresetScenario | null>(null);
  const [calculationHistory, setCalculationHistory] = React.useState<
    CalculationResult[]
  >([]);
  const [showPresets, setShowPresets] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<"single" | "comparison">(
    "single"
  );
  const [comparisonScenarios, setComparisonScenarios] = React.useState<
    CalculationResult[]
  >([]);

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

  const handleCalculate = async (inputs: RealEstateInputs) => {
    setIsCalculating(true);

    try {
      // Simulate async calculation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = calculateRealEstateInvestment(inputs);
      result.scenarioName = selectedPreset?.name;

      setCurrentResult(result);
      saveToHistory(result);

      toast.success("Tính toán hoàn tất!", {
        description: `Dòng tiền ròng: ${result.steps.dongTienRongBDS.toLocaleString(
          "vi-VN"
        )} VNĐ/tháng`,
      });
    } catch (error) {
      toast.error("Lỗi tính toán", {
        description:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra trong quá trình tính toán",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePresetSelect = (preset: PresetScenario) => {
    setSelectedPreset(preset);
    setShowPresets(false);
    toast.success(`Đã áp dụng kịch bản: ${preset.name}`);
  };

  const handleExport = () => {
    if (!currentResult) return;

    // Simplified export - in real app would generate PDF/Excel
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

    toast.success("Đã xuất báo cáo thành công!");
  };

  const handleNewCalculation = () => {
    setCurrentResult(null);
    setSelectedPreset(null);
    setCurrentView("single");
  };

  const handleAddToComparison = (result: CalculationResult) => {
    if (comparisonScenarios.length < 5) {
      // Limit to 5 scenarios
      setComparisonScenarios((prev) => [...prev, result]);
      toast.success("Đã thêm vào so sánh!", {
        description: `Hiện có ${
          comparisonScenarios.length + 1
        } kịch bản để so sánh`,
      });
    } else {
      toast.error("Đã đạt giới hạn", {
        description: "Chỉ có thể so sánh tối đa 5 kịch bản",
      });
    }
  };

  const handleRemoveFromComparison = (index: number) => {
    setComparisonScenarios((prev) => prev.filter((_, i) => i !== index));
    toast.success("Đã xóa kịch bản khỏi so sánh");
  };

  const handleStartComparison = () => {
    if (currentResult) {
      handleAddToComparison(currentResult);
    }
    setCurrentView("comparison");
  };

  const handleAddNewScenario = () => {
    setCurrentView("single");
    setCurrentResult(null);
    setSelectedPreset(null);
  };

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

        {/* Navigation Tabs */}
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
              disabled={comparisonScenarios.length < 2}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              So Sánh Kịch Bản
              {comparisonScenarios.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {comparisonScenarios.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {currentView === "single" ? (
          // Single Calculation View
          !currentResult ? (
            <div className="max-w-6xl mx-auto">
              {/* Quick Start Section */}
              <Card className="mb-6 border-2 border-primary/20 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Bắt Đầu Nhanh
                  </CardTitle>
                  <CardDescription>
                    Chọn kịch bản mẫu hoặc nhập thông tin tự tùy chỉnh
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
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                        onClick={() => handlePresetSelect(preset)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(preset.category)}
                            <Badge variant="outline" className="text-xs">
                              {getLocationName(preset.location)}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-sm mb-1">
                            {preset.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {preset.description}
                          </p>
                          <div className="mt-2 text-xs font-medium text-primary">
                            ~
                            {(preset.inputs.giaTriBDS! / 1000000000).toFixed(1)}{" "}
                            tỷ VNĐ
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedPreset && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">
                          Đã chọn: {selectedPreset.name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedPreset.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span>
                          Giá:{" "}
                          {(
                            selectedPreset.inputs.giaTriBDS! / 1000000000
                          ).toFixed(1)}{" "}
                          tỷ
                        </span>
                        <span>
                          Thuê:{" "}
                          {(
                            selectedPreset.inputs.tienThueThang! / 1000000
                          ).toFixed(0)}{" "}
                          tr/tháng
                        </span>
                        <span>Vay: {selectedPreset.inputs.tyLeVay}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* History Section */}
              {calculationHistory.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Lịch Sử Tính Toán
                      {comparisonScenarios.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {comparisonScenarios.length} đang so sánh
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {calculationHistory.slice(0, 3).map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => setCurrentResult(result)}
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {result.scenarioName || `Tính toán ${index + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.calculatedAt.toLocaleString("vi-VN")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold text-sm ${
                                result.steps.dongTienRongBDS >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {result.steps.dongTienRongBDS.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              ₫
                            </p>
                            <p className="text-xs text-muted-foreground">
                              dòng tiền/tháng
                            </p>
                          </div>
                        </div>
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

              {/* Add to Comparison */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">So Sánh Kịch Bản</h3>
                      <p className="text-sm text-muted-foreground">
                        Thêm kết quả này vào danh sách so sánh để đánh giá với
                        các phương án khác
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleAddToComparison(currentResult)}
                        disabled={comparisonScenarios.some(
                          (s) => s.calculatedAt === currentResult.calculatedAt
                        )}
                      >
                        Thêm vào so sánh
                      </Button>
                      <Button onClick={handleStartComparison}>
                        So sánh ngay
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
            <ScenarioComparison
              scenarios={comparisonScenarios}
              onRemoveScenario={handleRemoveFromComparison}
              onAddScenario={handleAddNewScenario}
            />
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
