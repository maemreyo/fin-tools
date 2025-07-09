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
  Clock
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
import { TimelineScenario } from "@/types/timeline";
import { calculateRealEstateInvestment } from "@/lib/real-estate-calculator";

// ===== LAZY LOAD TIMELINE COMPONENTS =====
// Optimize bundle size by loading Timeline components only when needed
const TimelineDashboard = dynamic(
  () => import("@/components/timeline/TimelineDashboard").then(mod => ({ default: mod.TimelineDashboard })),
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
    ssr: false
  }
);

// ===== PRESET SCENARIOS (Enhanced for Timeline) =====
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
    name: "💎 Căn hộ cao cấp - Nhà đầu tư",
    description: "Căn hộ 3PN cao cấp, ROI cao, thích hợp investor có kinh nghiệm",
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
    description: "Nhà phố 4x15m, vừa ở vừa cho thuê, phù hợp gia đình có con nhỏ",
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
type CalculatorMode = 'CLASSIC' | 'TIMELINE';
type ViewState = 'INPUT' | 'RESULTS' | 'TIMELINE';

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
    mode: 'CLASSIC',
    viewState: 'INPUT',
    currentInputs: null,
    currentResult: null,
    selectedPreset: null,
    calculationHistory: [],
    timelineScenarios: [],
    isCalculating: false,
    hasTimelineAccess: true, // Enable Timeline by default
  });

  // UI State
  const [showPresets, setShowPresets] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  // ===== LOAD SAVED DATA =====
  useEffect(() => {
    const savedHistory = localStorage.getItem('calculation-history');
    const savedScenarios = localStorage.getItem('timeline-scenarios');
    
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setAppState(prev => ({ ...prev, calculationHistory: history }));
      } catch (error) {
        console.error('Failed to load calculation history:', error);
      }
    }

    if (savedScenarios) {
      try {
        const scenarios = JSON.parse(savedScenarios);
        setAppState(prev => ({ ...prev, timelineScenarios: scenarios }));
      } catch (error) {
        console.error('Failed to load timeline scenarios:', error);
      }
    }
  }, []);

  // ===== CALCULATION HANDLERS =====
  const handleCalculate = useCallback(async (inputs: RealEstateInputs) => {
    setAppState(prev => ({ ...prev, isCalculating: true }));

    try {
      const result = calculateRealEstateInvestment(inputs);
      
      // Enhanced result with metadata
      const enhancedResult = {
        ...result,
        calculatedAt: new Date().toISOString(),
        calculationId: `calc_${Date.now()}`,
        inputs: inputs
      };

      setAppState(prev => ({
        ...prev,
        currentInputs: inputs,
        currentResult: enhancedResult,
        viewState: 'RESULTS',
        isCalculating: false,
        calculationHistory: [enhancedResult, ...prev.calculationHistory.slice(0, 9)] // Keep last 10
      }));

      // Save to localStorage
      const newHistory = [enhancedResult, ...appState.calculationHistory.slice(0, 9)];
      localStorage.setItem('calculation-history', JSON.stringify(newHistory));

      toast.success("Tính toán thành công!", {
        description: `ROI: ${result.roiHangNam.toFixed(1)}% - Dòng tiền: ${(result.steps.dongTienRongBDS / 1000000).toFixed(1)}M ₫`,
      });

    } catch (error) {
      console.error('Calculation error:', error);
      setAppState(prev => ({ ...prev, isCalculating: false }));
      
      toast.error("Lỗi tính toán", {
        description: "Vui lòng kiểm tra lại thông tin đầu vào",
      });
    }
  }, [appState.calculationHistory]);

  // ===== MODE SWITCHING HANDLERS =====
  const handleModeSwitch = useCallback((newMode: CalculatorMode) => {
    if (newMode === 'TIMELINE' && !appState.hasTimelineAccess) {
      toast.error("Timeline Mode chưa khả dụng", {
        description: "Vui lòng nâng cấp tài khoản để sử dụng Timeline Mode",
      });
      return;
    }

    if (newMode === 'TIMELINE' && appState.currentInputs) {
      setAppState(prev => ({
        ...prev,
        mode: newMode,
        viewState: 'TIMELINE'
      }));
    } else {
      setAppState(prev => ({
        ...prev,
        mode: newMode,
        viewState: newMode === 'TIMELINE' ? 'TIMELINE' : 'INPUT'
      }));
    }

    toast.success(`Đã chuyển sang ${newMode === 'CLASSIC' ? 'Classic' : 'Timeline'} Mode`);
  }, [appState.hasTimelineAccess, appState.currentInputs]);

  // ===== TIMELINE HANDLERS =====
  const handleTimelineScenarioSave = useCallback((scenario: TimelineScenario) => {
    const newScenarios = [...appState.timelineScenarios, scenario];
    setAppState(prev => ({ ...prev, timelineScenarios: newScenarios }));
    localStorage.setItem('timeline-scenarios', JSON.stringify(newScenarios));
    
    toast.success("Đã lưu timeline scenario", {
      description: scenario.scenarioName,
    });
  }, [appState.timelineScenarios]);

  const handleTimelineScenarioLoad = useCallback((scenarioId: string) => {
    const scenario = appState.timelineScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      toast.success("Đã tải timeline scenario", {
        description: scenario.scenarioName,
      });
    }
  }, [appState.timelineScenarios]);

  // ===== PRESET HANDLERS =====
  const handlePresetSelect = useCallback((preset: PresetScenario) => {
    setAppState(prev => ({ ...prev, selectedPreset: preset }));
    setShowPresets(false);
    
    toast.success("Đã chọn mẫu", {
      description: preset.name,
    });
  }, []);

  // ===== UPGRADE TO TIMELINE =====
  const renderTimelineUpgradeCard = useMemo(() => {
    if (appState.mode === 'TIMELINE' || !appState.currentResult) return null;

    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Rocket className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-900">🚀 Nâng cấp Timeline Mode</CardTitle>
                <CardDescription className="text-blue-700">
                  Mô phỏng 240 tháng chi tiết với events và tối ưu hóa
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Mới
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Tính năng Timeline
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ Mô phỏng 240 tháng chi tiết</li>
                <li>✅ Quản lý events quan trọng</li>
                <li>✅ So sánh kịch bản đầu tư</li>
                <li>✅ Tối ưu hóa tự động</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Lợi ích chính
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>🎯 Dự báo chính xác hơn</li>
                <li>📊 Phân tích sâu hơn</li>
                <li>⚡ Tối ưu lợi nhuận</li>
                <li>🛡️ Quản lý rủi ro</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Dựa trên kết quả tính toán hiện tại
            </div>
            <Button 
              onClick={() => handleModeSwitch('TIMELINE')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Khám phá Timeline Mode
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }, [appState.mode, appState.currentResult, handleModeSwitch]);

  // ===== RENDER MAIN PAGE =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* ===== PAGE HEADER ===== */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <Home className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Máy Tính Bất Động Sản
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Phân tích đầu tư thông minh với AI và Timeline
                </CardDescription>
              </div>
            </div>

            {/* ===== MODE SELECTOR ===== */}
            <div className="flex justify-center">
              <Tabs value={appState.mode} onValueChange={(mode: any) => handleModeSwitch(mode)}>
                <TabsList className="grid w-full grid-cols-2 max-w-md h-12">
                  <TabsTrigger value="CLASSIC" className="flex items-center gap-2 px-6">
                    <Calculator className="h-4 w-4" />
                    Classic Mode
                  </TabsTrigger>
                  <TabsTrigger value="TIMELINE" className="flex items-center gap-2 px-6">
                    <Calendar className="h-4 w-4" />
                    Timeline Mode
                    <Badge variant="secondary" className="text-xs">Pro</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
        </Card>

        {/* ===== CLASSIC MODE ===== */}
        {appState.mode === 'CLASSIC' && (
          <div className="space-y-8">
            {/* Preset Scenarios */}
            {showPresets && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      <CardTitle className="text-amber-900">Mẫu Có Sẵn</CardTitle>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRESET_SCENARIOS.map((preset) => (
                      <Card
                        key={preset.id}
                        className="cursor-pointer hover:shadow-md transition-all border-amber-200 hover:border-amber-300 bg-white"
                        onClick={() => handlePresetSelect(preset)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-sm">{preset.name}</h3>
                              <p className="text-xs text-muted-foreground">{preset.description}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {preset.category}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                    {appState.calculationHistory.slice(0, 6).map((result, index) => (
                      <Card
                        key={result.calculationId || index}
                        className="cursor-pointer hover:shadow-sm transition-all border-gray-200"
                        onClick={() => setAppState(prev => ({ ...prev, currentResult: result, viewState: 'RESULTS' }))}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">
                              Tính toán #{index + 1}
                            </div>
                            <Badge
                              variant={result.steps.dongTienRongBDS > 0 ? "default" : "destructive"}
                              className="text-xs shrink-0"
                            >
                              {result.steps.dongTienRongBDS > 0 ? "Lời" : "Lỗ"}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ROI:</span>
                              <span className={`font-semibold ${result.roiHangNam > 0 ? "text-green-600" : "text-red-600"}`}>
                                {result.roiHangNam.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dòng tiền:</span>
                              <span className={`font-semibold ${result.steps.dongTienRongBDS > 0 ? "text-green-600" : "text-red-600"}`}>
                                {(result.steps.dongTienRongBDS / 1000000).toFixed(1)}M ₫
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground pt-1 border-t">
                              {new Date(result.calculatedAt || "").toLocaleDateString("vi-VN")}
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
            <PropertyInputForm
              onCalculate={handleCalculate}
              initialValues={appState.selectedPreset?.inputs}
              isLoading={appState.isCalculating}
            />

            {/* Results Section */}
            {appState.currentResult && appState.viewState === 'RESULTS' && (
              <div className="space-y-6">
                <CalculationResults result={appState.currentResult} />
                <AIAdvisorySystem 
                  result={appState.currentResult}
                  onTimelineUpgrade={() => handleModeSwitch('TIMELINE')}
                />
                {renderTimelineUpgradeCard}
              </div>
            )}

            {/* Scenario Comparison */}
            {showComparison && appState.calculationHistory.length > 1 && (
              <ScenarioComparison results={appState.calculationHistory.slice(0, 4)} />
            )}
          </div>
        )}

        {/* ===== TIMELINE MODE ===== */}
        {appState.mode === 'TIMELINE' && (
          <div className="space-y-6">
            {/* Timeline Mode Header */}
            <Alert className="border-blue-200 bg-blue-50">
              <Calendar className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                <strong>Timeline Mode:</strong> Phân tích 240 tháng với events và tối ưu hóa tự động.
                {!appState.currentInputs && " Vui lòng nhập thông tin bất động sản để bắt đầu."}
              </AlertDescription>
            </Alert>

            {/* Timeline Dashboard */}
            {appState.currentInputs ? (
              <TimelineDashboard
                initialInputs={appState.currentInputs}
                initialResult={appState.currentResult || undefined}
                onScenarioSave={handleTimelineScenarioSave}
                onScenarioLoad={handleTimelineScenarioLoad}
                mode="INTEGRATED"
              />
            ) : (
              <Card className="border-dashed border-2 border-blue-200">
                <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Calendar className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Bắt đầu với Timeline</h3>
                    <p className="text-muted-foreground">
                      Chuyển về Classic Mode để nhập thông tin bất động sản trước
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleModeSwitch('CLASSIC')}
                    variant="outline"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Chuyển về Classic Mode
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}