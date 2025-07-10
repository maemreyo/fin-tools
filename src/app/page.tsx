"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  Sparkles,
  Building,
  Clock,
  Target,
  Rocket,
  TrendingUp,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  Lightbulb,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Existing imports
import HeroSection from "@/components/HeroSection";
import { CalculationConfirmationDialog } from "@/components/CalculationConfirmationDialog";
import { PageHeader } from "@/components/PageHeader";
import { PresetScenarios } from "@/components/PresetScenarios";
import { CalculationHistory } from "@/components/CalculationHistory";
import PropertyInputForm from "@/components/PropertyInputForm";
import EnhancedCalculationResultsModal from "@/components/CalculationResultsModalEnhanced";
import EnhancedPropertyInputForm from "@/components/PropertyInputFormEnhanced";
import SaleScenarioAnalysis from "@/components/SaleScenarioAnalysis";

// Enhanced imports for future feature
import EnhancedVisualComparison from "@/components/comparison/EnhancedVisualComparison";
import EconomicScenarioGeneratorUI from "@/components/comparison/EconomicScenarioGenerator";

import { useCalculatorState } from "@/hooks/useCalculatorState";
import { PRESET_SCENARIOS } from "@/constants/presetScenarios";
import {
  RealEstateInputs,
  CalculationResult,
  PresetScenario,
  FutureScenario,
  BuyNowVsFutureComparison,
} from "@/types/real-estate";
import {
  RealEstateInputsWithSaleAnalysis,
  CalculationResultWithSale,
} from "@/types/sale-scenario";
import { calculateRealEstateInvestmentWithSale } from "@/lib/real-estate-calculator-enhanced";
import {
  EnhancedGeneratedScenario,
  MarketContext,
} from "@/lib/enhanced-economic-scenarios";

export default function EnhancedRealEstateCalculatorPage() {
  const { appState, handleCalculate, handlePresetSelect } =
    useCalculatorState();

  // === EXISTING UI STATE ===
  const [showPresets, setShowPresets] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showCalculationConfirm, setShowCalculationConfirm] = useState(false);
  const [showEconomicGenerator, setShowEconomicGenerator] = useState(false);
  const [pendingCalculation, setPendingCalculation] =
    useState<RealEstateInputs | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] =
    useState<CalculationResult | null>(null);
  const [currentInputs, setCurrentInputs] = useState<RealEstateInputs | null>(
    null
  );

  // === 🆕 BUY NOW VS FUTURE STATE ===
  const [buyNowResult, setBuyNowResult] =
    useState<CalculationResultWithSale | null>(null);
  const [futureScenarios, setFutureScenarios] = useState<FutureScenario[]>([]);
  const [isCalculatingBuyNow, setIsCalculatingBuyNow] = useState(false);
  const [showFutureComparison, setShowFutureComparison] = useState(false);
  const [activeFeatureMode, setActiveFeatureMode] = useState<
    "standard" | "buy_now_vs_future"
  >("standard");

  // Enhanced comparison results (combines all scenarios for comparison)
  const [enhancedComparisonResults, setEnhancedComparisonResults] = useState<
    CalculationResult[]
  >([]);

  // === 🆕 BUY NOW VS FUTURE HANDLERS ===

  /**
   * Calculate "Buy Now" scenario with current inputs
   */
  const handleCalculateBuyNow = async () => {
    if (!currentInputs) {
      toast.error("Vui lòng nhập thông tin bất động sản trước");
      return;
    }

    setIsCalculatingBuyNow(true);
    try {
      // Add small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Enhanced inputs with sale analysis enabled
      const enhancedInputs: RealEstateInputsWithSaleAnalysis = {
        ...currentInputs,
        purchaseDate: new Date(), // Mark as "buy now"
        saleAnalysis: {
          enableSaleAnalysis: true,
          holdingPeriodMonths: 60, // Default 5 years
          propertyAppreciationRate: 5, // Default 5% annual
          sellingCostPercentage: 3,
        },
      };

      const result = calculateRealEstateInvestmentWithSale(enhancedInputs);

      // Enhance result with scenario metadata
      const enhancedResult: CalculationResultWithSale = {
        ...result,
        scenarioType: "buy_now",
        scenarioName: "Mua Ngay",
        purchaseTimingInfo: {
          purchaseDate: new Date(),
          monthsFromNow: 0,
          projectionYears: 0,
        },
      };

      setBuyNowResult(enhancedResult);

      toast.success("Đã tính toán kịch bản Mua Ngay thành công!");

      // Auto-switch to buy now vs future mode
      setActiveFeatureMode("buy_now_vs_future");
      handleViewResult(enhancedResult);
    } catch (error) {
      console.error("Error calculating buy now scenario:", error);
      toast.error("Lỗi khi tính toán. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsCalculatingBuyNow(false);
    }
  };

  /**
   * Handle future scenarios created from EconomicScenarioGenerator
   */
  const handleFutureScenariosCreated = (
    newFutureScenarios: FutureScenario[]
  ) => {
    setFutureScenarios((prev) => [...prev, ...newFutureScenarios]);

    toast.success(`Đã tạo ${newFutureScenarios.length} kịch bản tương lai!`);

    // Auto-switch to comparison mode
    setActiveFeatureMode("buy_now_vs_future");
    setShowFutureComparison(true);
    setShowEconomicGenerator(false);
  };

  /**
   * Remove a future scenario
   */
  const handleRemoveFutureScenario = (scenarioId: string) => {
    setFutureScenarios((prev) =>
      prev.filter((scenario) => scenario.id !== scenarioId)
    );
    toast.success("Đã xóa kịch bản tương lai");
  };

  /**
   * Clear all scenarios and reset
   */
  const handleClearAllScenarios = () => {
    setBuyNowResult(null);
    setFutureScenarios([]);
    setEnhancedComparisonResults([]);
    setActiveFeatureMode("standard");
    setShowFutureComparison(false);
    toast.success("Đã xóa tất cả kịch bản");
  };

  /**
   * Prepare data for enhanced comparison
   */
  const prepareComparisonData = (): CalculationResult[] => {
    const comparisonResults: CalculationResult[] = [];

    // Add buy now result
    if (buyNowResult) {
      comparisonResults.push(buyNowResult);
    }

    // Add future scenarios results
    futureScenarios.forEach((futureScenario) => {
      comparisonResults.push({
        ...futureScenario.result,
        scenarioType: "buy_future",
        scenarioName: futureScenario.scenarioName,
        economicScenarioApplied: {
          id: futureScenario.economicScenario.id,
          name: futureScenario.economicScenario.name,
          description: futureScenario.economicScenario.description,
        },
        purchaseTimingInfo: {
          purchaseDate: futureScenario.futureDate,
          monthsFromNow: futureScenario.monthsFromNow,
          projectionYears: futureScenario.monthsFromNow / 12,
        },
      });
    });

    return comparisonResults;
  };

  /**
   * Show comparison
   */
  const handleShowComparison = () => {
    const comparisonData = prepareComparisonData();
    setEnhancedComparisonResults(comparisonData);
    setShowFutureComparison(true);
  };

  // === EXISTING HANDLERS (enhanced) ===
  const handleEnhancedCalculate = async (
    formData: RealEstateInputsWithSaleAnalysis
  ) => {
    setCurrentInputs(formData); // Store current inputs for future use

    if (appState.showConfirmDialog) {
      setPendingCalculation(formData);
      setShowCalculationConfirm(true);
    } else {
      const result = await handleCalculate(formData);
      if (result) {
        handleViewResult(result);
      }
    }
  };

  const handleConfirmCalculation = () => {
    if (pendingCalculation) {
      handleCalculate(pendingCalculation);
      setPendingCalculation(null);
    }
    setShowCalculationConfirm(false);
  };

  const handleViewResult = (result: CalculationResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const handleScenariosGenerated = (scenarios: EnhancedGeneratedScenario[]) => {
    // Convert to comparison format
    const results = scenarios.map((gs) => ({
      ...gs.result,
      scenarioName: `${gs.scenario.name} (${
        gs.marketContext.investorType === "existing_investor"
          ? "Đã có BĐS"
          : "Mới vào"
      })`,
      economicScenarioApplied: {
        id: gs.scenario.id,
        name: gs.scenario.name,
        description: gs.scenario.description,
      },
    }));

    setEnhancedComparisonResults(results);
    setShowComparison(true);
    setShowEconomicGenerator(false);
  };

  const handleAddToComparison = (results: CalculationResult[]) => {
    setEnhancedComparisonResults((prev) => [...prev, ...results]);
    setShowComparison(true);
  };

  // === COMPUTED VALUES ===
  const hasBuyNowResult = !!buyNowResult;
  const hasFutureScenarios = futureScenarios.length > 0;
  const canCompare = hasBuyNowResult || hasFutureScenarios;
  const readyForComparison = hasBuyNowResult && hasFutureScenarios;

  // === RENDER ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <HeroSection />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <PageHeader
          calculationCount={appState.calculationHistory.length}
          hasCurrentResult={!!appState.currentResult}
        />

        {/* 🆕 Feature Mode Selector */}
        <Card>
          <CardContent className="p-6">
            <Tabs
              value={activeFeatureMode}
              onValueChange={(value: any) => setActiveFeatureMode(value)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="standard"
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Tính Toán Chuẩn
                </TabsTrigger>
                <TabsTrigger
                  value="buy_now_vs_future"
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Mua Ngay vs Mua Tương Lai
                  {(hasBuyNowResult || hasFutureScenarios) && (
                    <Badge variant="secondary" className="ml-1">
                      {(hasBuyNowResult ? 1 : 0) + futureScenarios.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Standard Mode */}
              <TabsContent value="standard" className="space-y-6">
                {/* Preset Scenarios */}
                <Collapsible open={showPresets} onOpenChange={setShowPresets}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Building className="h-4 w-4" />
                      Kịch bản mẫu cho người mới
                      {showPresets ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">
                    <PresetScenarios
                      scenarios={PRESET_SCENARIOS}
                      selectedPreset={appState.selectedPreset}
                      onPresetSelect={handlePresetSelect}
                      onHide={() => setShowPresets(false)}
                    />
                  </CollapsibleContent>
                </Collapsible>

                {/* Input Form */}
                <EnhancedPropertyInputForm
                  onCalculate={handleEnhancedCalculate}
                  initialValues={appState.selectedPreset?.inputs}
                  isLoading={appState.isCalculating}
                  selectedPreset={appState.selectedPreset}
                />

                {/* Economic Scenarios */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setShowEconomicGenerator(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Tạo Kịch Bản Kinh Tế
                  </Button>

                  {enhancedComparisonResults.length > 0 && (
                    <Button
                      onClick={() => setShowComparison(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      So Sánh Kịch Bản ({enhancedComparisonResults.length})
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* 🆕 Buy Now vs Future Mode */}
              <TabsContent value="buy_now_vs_future" className="space-y-6">
                {/* Instructions */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>
                      So sánh &quot;Mua Ngay&quot; vs &quot;Mua Tương Lai&quot;:
                    </strong>{" "}
                    Nhập thông tin BĐS, tính kịch bản &quot;Mua Ngay&quot;, sau
                    đó tạo các kịch bản &quot;Mua Tương Lai&quot; dựa trên dự
                    phóng kinh tế để ra quyết định tối ưu.
                  </AlertDescription>
                </Alert>

                {/* Input Form (if no current inputs) */}
                {!currentInputs && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Bước 1: Nhập Thông Tin Bất Động Sản
                    </h3>
                    <EnhancedPropertyInputForm
                      onCalculate={handleEnhancedCalculate}
                      initialValues={appState.selectedPreset?.inputs}
                      isLoading={appState.isCalculating}
                      selectedPreset={appState.selectedPreset}
                    />
                  </div>
                )}

                {/* Buy Now Section */}
                {currentInputs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-green-600" />
                          Bước 2: Tính Kịch Bản &quot;Mua Ngay&quot;
                        </div>
                        {hasBuyNowResult && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Đã hoàn thành
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!hasBuyNowResult ? (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Tính toán kết quả đầu tư nếu mua bất động sản ngay
                            bây giờ với các thông số hiện tại.
                          </p>
                          <Button
                            onClick={handleCalculateBuyNow}
                            disabled={isCalculatingBuyNow}
                            className="flex items-center gap-2"
                          >
                            {isCalculatingBuyNow ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Rocket className="h-4 w-4" />
                            )}
                            {isCalculatingBuyNow
                              ? "Đang tính toán..."
                              : "Tính Mua Ngay"}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">
                              ✅ Kết quả &quot;Mua Ngay&quot;
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">
                                  ROI hàng năm
                                </div>
                                <div className="font-medium text-green-700">
                                  {(buyNowResult.roiHangNam || 0).toFixed(1)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Dòng tiền/tháng
                                </div>
                                <div className="font-medium text-green-700">
                                  {(
                                    (buyNowResult.steps.dongTienRongBDS || 0) /
                                    1000000
                                  ).toFixed(1)}
                                  M VND
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Vốn ban đầu
                                </div>
                                <div className="font-medium text-green-700">
                                  {(
                                    (buyNowResult.steps.tongVonBanDau || 0) /
                                    1000000000
                                  ).toFixed(1)}
                                  B VND
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Thời gian hoàn vốn
                                </div>
                                <div className="font-medium text-green-700">
                                  {(buyNowResult.paybackPeriod || 0).toFixed(1)}{" "}
                                  năm
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewResult(buyNowResult)}
                            >
                              Xem Chi Tiết
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBuyNowResult(null)}
                            >
                              Tính Lại
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Future Scenarios Section */}
                {currentInputs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          Bước 3: Tạo Kịch Bản &quot;Mua Tương Lai&quot;
                        </div>
                        {hasFutureScenarios && (
                          <Badge className="bg-blue-100 text-blue-800">
                            {futureScenarios.length} kịch bản
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Tạo các kịch bản mua bất động sản tại thời điểm tương
                          lai dựa trên dự phóng kinh tế.
                        </p>

                        {/* Future Scenarios List */}
                        {hasFutureScenarios && (
                          <div className="space-y-3">
                            <h5 className="font-medium">Kịch bản đã tạo:</h5>
                            <div className="space-y-2">
                              {futureScenarios.map((scenario) => (
                                <div
                                  key={scenario.id}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {scenario.scenarioName}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(
                                          scenario.futureDate,
                                          "dd/MM/yyyy",
                                          { locale: vi }
                                        )}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {scenario.economicScenario.name}
                                      </span>
                                      <span className="text-blue-600">
                                        ROI:{" "}
                                        {(
                                          scenario.result.roiHangNam || 0
                                        ).toFixed(1)}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleViewResult(scenario.result)
                                      }
                                    >
                                      Chi tiết
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveFutureScenario(scenario.id)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowEconomicGenerator(true)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Tạo Kịch Bản Tương Lai
                          </Button>

                          {hasFutureScenarios && (
                            <Button
                              variant="outline"
                              onClick={handleClearAllScenarios}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa Tất Cả
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Comparison Section */}
                {canCompare && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          Bước 4: So Sánh & Quyết Định
                        </div>
                        {readyForComparison && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sẵn sàng so sánh
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {!readyForComparison ? (
                          <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertDescription>
                              {!hasBuyNowResult &&
                                "Cần tính kịch bản 'Mua Ngay' trước. "}
                              {!hasFutureScenarios &&
                                "Cần tạo ít nhất 1 kịch bản 'Mua Tương Lai'. "}
                              Sau đó bạn có thể so sánh để ra quyết định tối ưu.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              So sánh chi tiết giữa {hasBuyNowResult ? 1 : 0}{" "}
                              kịch bản &quot;Mua Ngay&quot; và {futureScenarios.length}{" "}
                              kịch bản &quot;Mua Tương Lai&quot;.
                            </p>

                            <Button
                              onClick={handleShowComparison}
                              className="flex items-center gap-2"
                            >
                              <ArrowLeftRight className="h-4 w-4" />
                              So Sánh Chi Tiết
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Calculation History */}
        <CalculationHistory
          history={appState.calculationHistory}
          onResultSelect={handleViewResult}
          onToggleComparison={() => {}}
        />
      </div>

      {/* Modals & Dialogs */}
      <CalculationConfirmationDialog
        isOpen={showCalculationConfirm}
        onOpenChange={setShowCalculationConfirm}
        onConfirm={handleConfirmCalculation}
        onCancel={() => setShowCalculationConfirm(false)}
        isCalculating={appState.isLoading}
        pendingCalculation={pendingCalculation}
      />

      <EnhancedCalculationResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={selectedResult}
      />

      <EconomicScenarioGeneratorUI
        inputs={currentInputs as RealEstateInputs}
        onScenariosGenerated={handleScenariosGenerated}
        onAddToComparison={handleAddToComparison}
        onFutureScenariosCreated={handleFutureScenariosCreated}
        isOpen={showEconomicGenerator}
        onClose={() => setShowEconomicGenerator(false)}
        mode={
          activeFeatureMode === "buy_now_vs_future"
            ? "future_comparison"
            : "scenarios"
        }
      />

      {/* Enhanced Comparison Modal */}
      {(showComparison || showFutureComparison) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[95vw] h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {activeFeatureMode === "buy_now_vs_future"
                    ? "So Sánh Mua Ngay vs Mua Tương Lai"
                    : "So Sánh Kịch Bản"}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowComparison(false);
                    setShowFutureComparison(false);
                  }}
                >
                  Đóng
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <EnhancedVisualComparison
                scenarios={
                  activeFeatureMode === "buy_now_vs_future"
                    ? prepareComparisonData()
                    : enhancedComparisonResults
                }
                onSelectScenario={(scenario) => {
                  console.log("Selected scenario:", scenario);
                  toast.success(`Đã chọn kịch bản: ${scenario.scenarioName}`);
                }}
                onRemoveScenario={(index) => {
                  if (activeFeatureMode === "buy_now_vs_future") {
                    const comparisonData = prepareComparisonData();
                    const scenarioToRemove = comparisonData[index];
                    if (scenarioToRemove?.scenarioType === "buy_future") {
                      // Find and remove the future scenario
                      const futureScenario = futureScenarios.find(
                        (fs) =>
                          fs.scenarioName === scenarioToRemove.scenarioName
                      );
                      if (futureScenario) {
                        handleRemoveFutureScenario(futureScenario.id);
                      }
                    } else if (scenarioToRemove?.scenarioType === "buy_now") {
                      setBuyNowResult(null);
                      toast.success("Đã xóa kịch bản Mua Ngay");
                    }
                  } else {
                    setEnhancedComparisonResults((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                    toast.success("Đã xóa kịch bản");
                  }
                }}
                comparisonMode={
                  activeFeatureMode === "buy_now_vs_future"
                    ? "buy_now_vs_future"
                    : "standard"
                }
                showRecommendation={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
