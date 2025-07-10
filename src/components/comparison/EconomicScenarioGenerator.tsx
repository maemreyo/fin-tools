"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  Zap,
  Rocket,
  Home,
  DollarSign,
  Plus,
  Settings,
} from "lucide-react";
import { format, addMonths, isAfter, isBefore } from "date-fns";
import { vi } from "date-fns/locale";

import {
  EnhancedEconomicScenarioGenerator,
  ENHANCED_ECONOMIC_SCENARIOS,
  EnhancedGeneratedScenario,
  EnhancedEconomicFactors,
  EnhancedEconomicScenario,
  MarketContext,
  projectFutureRealEstateInputs,
  FutureProjectionConfig,
  FutureProjectionResult,
} from "@/lib/enhanced-economic-scenarios";
import {
  RealEstateInputs,
  CalculationResult,
  FutureScenario,
  CreateFutureScenarioRequest,
  FUTURE_SCENARIO_VALIDATION,
} from "@/types/real-estate";
import { calculateRealEstateInvestmentWithSale } from "@/lib/real-estate-calculator-enhanced";
import {
  RealEstateInputsWithSaleAnalysis,
  CalculationResultWithSale,
} from "@/types/sale-scenario";

// ===== ENHANCED INTERFACES =====
interface EnhancedEconomicScenarioGeneratorProps {
  inputs: RealEstateInputs | null;
  onScenariosGenerated: (scenarios: EnhancedGeneratedScenario[]) => void;
  onAddToComparison: (results: CalculationResult[]) => void;
  onFutureScenariosCreated?: (futureScenarios: FutureScenario[]) => void; // 🆕 New callback
  isOpen: boolean;
  onClose: () => void;
  mode?: "scenarios" | "future_comparison"; // 🆕 New mode selector
}

// ===== ICON MAPPING =====
const IconMap = {
  Rocket: Rocket,
  AlertTriangle: AlertTriangle,
  Home: Home,
  TrendingUp: TrendingUp,
  BarChart3: BarChart3,
  DollarSign: DollarSign,
};

// ===== MAIN COMPONENT =====
export default function EconomicScenarioGeneratorUI({
  inputs,
  onScenariosGenerated,
  onAddToComparison,
  onFutureScenariosCreated,
  isOpen,
  onClose,
  mode = "scenarios",
}: EnhancedEconomicScenarioGeneratorProps) {
  // ===== EXISTING STATE =====
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([
    "property_boom",
    "market_correction",
    "rental_boom",
  ]);
  const [generatedScenarios, setGeneratedScenarios] = useState<
    EnhancedGeneratedScenario[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomScenario, setShowCustomScenario] = useState(false);
  const [currentMode, setCurrentMode] = useState<
    "scenarios" | "future_comparison"
  >(mode);

  // ===== MARKET CONTEXT STATE =====
  const [marketContext, setMarketContext] = useState<MarketContext>({
    marketType: "secondary",
    investorType: "new_investor",
    purchaseDate: new Date(),
    currentMarketValue: inputs?.giaTriBDS || 0,
  });

  // ===== 🆕 FUTURE PURCHASE STATE =====
  const [futureScenarioConfig, setFutureScenarioConfig] = useState({
    scenarioName: "",
    futureTimeMonths: 24, // Default 2 years
    targetDate: addMonths(new Date(), 24),
    maintainEquityRatio: false,
    notes: "",
  });

  const [futureScenariosResults, setFutureScenariosResults] = useState<
    FutureScenario[]
  >([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // ===== CUSTOM SCENARIO STATE =====
  const [customScenario, setCustomScenario] = useState<{
    name: string;
    description: string;
    factors: Partial<EnhancedEconomicFactors>;
  }>({
    name: "",
    description: "",
    factors: {},
  });

  // ===== VALIDATION & SUGGESTIONS =====
  const futureScenarioValidation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate scenario name
    if (currentMode === "future_comparison") {
      if (!futureScenarioConfig.scenarioName.trim()) {
        errors.push("Vui lòng nhập tên kịch bản");
      } else if (futureScenarioConfig.scenarioName.length < 3) {
        warnings.push("Tên kịch bản nên dài hơn 3 ký tự");
      }

      // Validate future time
      if (
        futureScenarioConfig.futureTimeMonths <
        FUTURE_SCENARIO_VALIDATION.futureTimeMonths.min
      ) {
        errors.push(
          `Thời gian tối thiểu ${FUTURE_SCENARIO_VALIDATION.futureTimeMonths.min} tháng`
        );
      } else if (
        futureScenarioConfig.futureTimeMonths >
        FUTURE_SCENARIO_VALIDATION.futureTimeMonths.max
      ) {
        warnings.push(
          `Dự phóng xa hơn ${FUTURE_SCENARIO_VALIDATION.futureTimeMonths.max} tháng có thể không chính xác`
        );
      }

      // Date validation
      if (isBefore(futureScenarioConfig.targetDate, new Date())) {
        errors.push("Ngày mua dự kiến phải trong tương lai");
      }

      // Selected scenarios validation
      if (selectedScenarios.length === 0) {
        errors.push("Vui lòng chọn ít nhất một kịch bản kinh tế");
      }
    }

    return { errors, warnings, isValid: errors.length === 0 };
  }, [currentMode, futureScenarioConfig, selectedScenarios]);

  // ===== MARKET CONTEXT DETECTION =====
  const suggestedContext = useMemo(() => {
    const propertyValue = inputs?.giaTriBDS || 0;
    const suggestions = [];

    suggestions.push("new_investor");

    if (propertyValue > 5000000000) {
      suggestions.push("secondary");
    } else {
      suggestions.push("primary");
    }

    return suggestions;
  }, [inputs]);

  // ===== HANDLERS =====
  const handleGenerateScenarios = async () => {
    if (selectedScenarios.length === 0 || !inputs) return;

    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const scenarios =
        EnhancedEconomicScenarioGenerator.generateEnhancedScenarios(
          inputs,
          marketContext,
          selectedScenarios
        );

      setGeneratedScenarios(scenarios);
      onScenariosGenerated(scenarios);
    } catch (error) {
      console.error("Error generating enhanced scenarios:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 🆕 FUTURE SCENARIOS GENERATION
  const handleGenerateFutureScenarios = async () => {
    if (!futureScenarioValidation.isValid || selectedScenarios.length === 0 || !inputs)
      return;

    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const futureScenarios: FutureScenario[] = [];

      for (const scenarioId of selectedScenarios) {
        const economicScenario = ENHANCED_ECONOMIC_SCENARIOS.find(
          (s) => s.id === scenarioId
        );
        if (!economicScenario) continue;

        // Create projection config
        const projectionConfig: FutureProjectionConfig = {
          futureTimeMonths: futureScenarioConfig.futureTimeMonths,
          targetPurchaseDate: futureScenarioConfig.targetDate,
          economicScenario,
          maintainEquityRatio: futureScenarioConfig.maintainEquityRatio,
        };

        // Project inputs to future
        const projectionResult = projectFutureRealEstateInputs(
          inputs,
          projectionConfig
        );

        // Calculate investment result with projected inputs
        const enhancedInputs: RealEstateInputsWithSaleAnalysis = {
          ...projectionResult.projectedInputs,
          saleAnalysis: {
            enableSaleAnalysis: true,
            holdingPeriodMonths: 60,
            propertyAppreciationRate: 5,
            sellingCostPercentage: 3,
          },
        };

        const calculationResult =
          calculateRealEstateInvestmentWithSale(enhancedInputs);

        // Create future scenario
        const futureScenario: FutureScenario = {
          id: `future_${scenarioId}_${Date.now()}`,
          scenarioName:
            futureScenarioConfig.scenarioName ||
            `${economicScenario.name} - ${futureScenarioConfig.futureTimeMonths} tháng`,
          futureDate: futureScenarioConfig.targetDate,
          monthsFromNow: futureScenarioConfig.futureTimeMonths,
          economicScenario: {
            id: economicScenario.id,
            name: economicScenario.name,
            description: economicScenario.description,
            probability: economicScenario.probability,
          },
          originalInputs: inputs,
          projectedInputs: projectionResult.projectedInputs,
          result: calculationResult,
          projectionSummary: {
            propertyValueChange:
              projectionResult.projectionSummary.propertyValueChange,
            rentalIncomeChange:
              projectionResult.projectionSummary.rentalIncomeChange,
            interestRateChange:
              projectionResult.projectionSummary.preferentialRateChange,
            projectionWarnings: projectionResult.warnings,
          },
          createdAt: new Date(),
          notes: futureScenarioConfig.notes,
        };

        futureScenarios.push(futureScenario);
      }

      setFutureScenariosResults(futureScenarios);

      if (onFutureScenariosCreated) {
        onFutureScenariosCreated(futureScenarios);
      }
    } catch (error) {
      console.error("Error generating future scenarios:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScenarioToggle = (scenarioId: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const handleAddToComparison = () => {
    if (currentMode === "scenarios") {
      const results = generatedScenarios.map((gs) => ({
        ...gs.result,
        scenarioName: `${gs.scenario.name} (${
          marketContext.investorType === "existing_investor"
            ? "Đã có BĐS"
            : "Mới vào"
        })`,
        economicScenarioApplied: {
          id: gs.scenario.id,
          name: gs.scenario.name,
          description: gs.scenario.description,
        },
      }));
      onAddToComparison(results);
    } else {
      // Future scenarios to comparison
      const results = futureScenariosResults.map((fs) => ({
        ...fs.result,
        scenarioName: fs.scenarioName,
        scenarioType: "buy_future" as const,
        economicScenarioApplied: {
          id: fs.economicScenario.id,
          name: fs.economicScenario.name,
          description: fs.economicScenario.description,
        },
        purchaseTimingInfo: {
          purchaseDate: fs.futureDate,
          monthsFromNow: fs.monthsFromNow,
          projectionYears: fs.monthsFromNow / 12,
        },
      }));
      onAddToComparison(results);
    }
  };

  // 🆕 Handle future time input changes
  const handleFutureTimeChange = (months: number) => {
    const newDate = addMonths(new Date(), months);
    setFutureScenarioConfig((prev) => ({
      ...prev,
      futureTimeMonths: months,
      targetDate: newDate,
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const monthsFromNow = Math.max(
        1,
        Math.round(
          (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
        )
      );
      setFutureScenarioConfig((prev) => ({
        ...prev,
        targetDate: date,
        futureTimeMonths: monthsFromNow,
      }));
      setShowDatePicker(false);
    }
  };

  // ===== RENDER =====
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Kịch Bản Kinh Tế & So Sánh Tương Lai
          </DialogTitle>
          <DialogDescription>
            Tạo kịch bản kinh tế để phân tích đầu tư hoặc so sánh &quot;Mua
            Ngay&quot; vs &quot;Mua Tương Lai&quot;
          </DialogDescription>
        </DialogHeader>

        {/* Mode Selector */}
        <Tabs
          value={currentMode}
          onValueChange={(value) =>
            setCurrentMode(value as "scenarios" | "future_comparison")
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Kịch Bản Kinh Tế
            </TabsTrigger>
            <TabsTrigger
              value="future_comparison"
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Mua Ngay vs Mua Tương Lai
            </TabsTrigger>
          </TabsList>

          {/* Economic Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4">
            {/* Market Context */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bối Cảnh Thị Trường</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loại Thị Trường</Label>
                    <Select
                      value={marketContext.marketType}
                      onValueChange={(value: "primary" | "secondary") =>
                        setMarketContext((prev) => ({
                          ...prev,
                          marketType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">
                          Thị trường sơ cấp (CĐT)
                        </SelectItem>
                        <SelectItem value="secondary">
                          Thị trường thứ cấp
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Loại Nhà Đầu Tư</Label>
                    <Select
                      value={marketContext.investorType}
                      onValueChange={(
                        value: "new_investor" | "existing_investor"
                      ) =>
                        setMarketContext((prev) => ({
                          ...prev,
                          investorType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_investor">
                          Nhà đầu tư mới
                        </SelectItem>
                        <SelectItem value="existing_investor">
                          Đã có BĐS
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Chọn Kịch Bản Kinh Tế</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {ENHANCED_ECONOMIC_SCENARIOS.map((scenario) => {
                    const Icon =
                      IconMap[scenario.icon as keyof typeof IconMap] ||
                      TrendingUp;
                    const isSelected = selectedScenarios.includes(scenario.id);

                    return (
                      <div
                        key={scenario.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleScenarioToggle(scenario.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isSelected} onChange={() => {}} />
                          <Icon
                            className={`h-5 w-5 mt-0.5 ${scenario.color}`}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{scenario.name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {scenario.probability}%
                                </Badge>
                                <Badge variant="secondary">
                                  {scenario.timeframe}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {scenario.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-between">
              <Button
                onClick={handleGenerateScenarios}
                disabled={selectedScenarios.length === 0 || isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang tính toán...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Tạo Kịch Bản ({selectedScenarios.length})
                  </>
                )}
              </Button>

              {generatedScenarios.length > 0 && (
                <Button variant="outline" onClick={handleAddToComparison}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm vào So Sánh
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Future Comparison Tab */}
          <TabsContent value="future_comparison" className="space-y-4">
            {/* Future Purchase Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Cấu Hình Mua Tương Lai
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scenario Name */}
                <div className="space-y-2">
                  <Label htmlFor="scenarioName">Tên Kịch Bản</Label>
                  <Input
                    id="scenarioName"
                    placeholder="VD: Mua sau 2 năm khi thị trường điều chỉnh"
                    value={futureScenarioConfig.scenarioName}
                    onChange={(e) =>
                      setFutureScenarioConfig((prev) => ({
                        ...prev,
                        scenarioName: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thời Gian Mua (Tháng)</Label>
                    <Select
                      value={futureScenarioConfig.futureTimeMonths.toString()}
                      onValueChange={(value) =>
                        handleFutureTimeChange(parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 tháng</SelectItem>
                        <SelectItem value="12">1 năm</SelectItem>
                        <SelectItem value="18">1.5 năm</SelectItem>
                        <SelectItem value="24">2 năm</SelectItem>
                        <SelectItem value="36">3 năm</SelectItem>
                        <SelectItem value="48">4 năm</SelectItem>
                        <SelectItem value="60">5 năm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày Cụ Thể</Label>
                    <Popover
                      open={showDatePicker}
                      onOpenChange={setShowDatePicker}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(
                            futureScenarioConfig.targetDate,
                            "dd/MM/yyyy",
                            { locale: vi }
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={futureScenarioConfig.targetDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => isBefore(date, new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Advanced Settings */}
                <Collapsible
                  open={showAdvancedSettings}
                  onOpenChange={setShowAdvancedSettings}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 p-0"
                    >
                      <Settings className="h-4 w-4" />
                      Cài Đặt Nâng Cao
                      {showAdvancedSettings ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Duy Trì Tỷ Lệ Vốn Tự Có</Label>
                        <p className="text-sm text-muted-foreground">
                          Giữ % vốn tự có theo giá trị BĐS hay giữ nguyên số
                          tiền
                        </p>
                      </div>
                      <Switch
                        checked={futureScenarioConfig.maintainEquityRatio}
                        onCheckedChange={(checked) =>
                          setFutureScenarioConfig((prev) => ({
                            ...prev,
                            maintainEquityRatio: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Ghi Chú</Label>
                      <Input
                        id="notes"
                        placeholder="Ghi chú thêm về kịch bản này..."
                        value={futureScenarioConfig.notes}
                        onChange={(e) =>
                          setFutureScenarioConfig((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Economic Scenarios for Projection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Kịch Bản Kinh Tế Dự Phóng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {ENHANCED_ECONOMIC_SCENARIOS.map((scenario) => {
                    const Icon =
                      IconMap[scenario.icon as keyof typeof IconMap] ||
                      TrendingUp;
                    const isSelected = selectedScenarios.includes(scenario.id);

                    return (
                      <div
                        key={scenario.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleScenarioToggle(scenario.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isSelected} onChange={() => {}} />
                          <Icon
                            className={`h-5 w-5 mt-0.5 ${scenario.color}`}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{scenario.name}</h4>
                              <Badge variant="outline">
                                {scenario.probability}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {scenario.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Validation & Warnings */}
            {futureScenarioValidation.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {futureScenarioValidation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {futureScenarioValidation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {futureScenarioValidation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Generate Future Scenarios Button */}
            <div className="flex justify-between">
              <Button
                onClick={handleGenerateFutureScenarios}
                disabled={
                  !futureScenarioValidation.isValid ||
                  selectedScenarios.length === 0 ||
                  isGenerating
                }
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang dự phóng...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Tạo Kịch Bản Tương Lai ({selectedScenarios.length})
                  </>
                )}
              </Button>

              {futureScenariosResults.length > 0 && (
                <Button variant="outline" onClick={handleAddToComparison}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm vào So Sánh
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
