// Enhanced Property Input Form with Sale Analysis

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  Calculator,
  TrendingUp,
  Banknote,
  PiggyBank,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  Loader2,
  Rocket,
  Settings,
  Zap,
  Clock,
  BarChart3,
  Home,
  DollarSign,
  Percent,
  Calendar,
  TrendingDownIcon,
  Building,
  Users,
  Sparkles,
  Crown,
  Star,
} from "lucide-react";

import {
  RealEstateInputs,
  DEFAULT_VALUES,
  PresetScenario,
} from "@/types/real-estate";
import {
  HoldingPeriodInputs,
  RealEstateInputsWithSaleAnalysis,
  SALE_ANALYSIS_DEFAULTS,
} from "@/types/sale-scenario";

import { formatVND, parseVND } from "@/lib/financial-utils";

// ===== ENHANCED VALIDATION SCHEMA =====
const enhancedRealEstateSchema = z.object({
  // Core user inputs - những gì user BIẾT
  giaTriBDS: z.number().min(1000000, "Vui lòng nhập giá trị bất động sản"),
  vonTuCo: z.number().min(0, "Vốn tự có không được âm"),

  // Everything else is optional với smart defaults
  tienThueThang: z.number().optional().default(0),
  laiSuatUuDai: z.number().optional().default(8),
  laiSuatThaNoi: z.number().optional().default(10),
  thoiGianVay: z.number().optional().default(20),
  thoiGianUuDai: z.number().optional().default(12),
  tyLeLapDay: z.number().optional().default(95),
  phiQuanLy: z.number().optional().default(0),
  phiBaoTri: z.number().optional().default(1),
  baoHiemTaiSan: z.number().optional().default(0.1),
  thueSuatChoThue: z.number().optional().default(10),
  chiPhiTrangBi: z.number().optional().default(0),
  chiPhiMua: z.number().optional().default(2),
  baoHiemKhoanVay: z.number().optional().default(1.5),
  duPhongCapEx: z.number().optional().default(1),
  chiPhiBan: z.number().optional().default(3),
  thuNhapKhac: z.number().optional().default(0),
  chiPhiSinhHoat: z.number().optional().default(0),

  // Sale Analysis Fields
  enableSaleAnalysis: z.boolean().optional().default(false),
  holdingPeriodMonths: z.number().optional().default(60),
  propertyAppreciationRate: z.number().optional().default(5),
  sellingCostPercentage: z.number().optional().default(3),
  saleDate: z.date().optional(),
});

// ===== ENHANCED PROPS INTERFACE =====
interface EnhancedPropertyInputFormProps {
  onCalculate: (inputs: RealEstateInputsWithSaleAnalysis) => void;
  initialValues?: Partial<RealEstateInputsWithSaleAnalysis>;
  isLoading?: boolean;
  selectedPreset?: PresetScenario | null;
  className?: string;
}

export default function EnhancedPropertyInputForm({
  onCalculate,
  initialValues,
  isLoading = false,
  selectedPreset,
  className = "",
}: EnhancedPropertyInputFormProps) {
  // ===== FORM STATE =====
  const form = useForm<RealEstateInputsWithSaleAnalysis>({
    resolver: zodResolver(enhancedRealEstateSchema) as any,
    defaultValues: {
      ...DEFAULT_VALUES,
      ...SALE_ANALYSIS_DEFAULTS,
      ...initialValues,
    },
  });

  const watchedValues = form.watch();

  // ===== UI STATE =====
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSaleAnalysis, setShowSaleAnalysis] = useState(
    initialValues?.saleAnalysis?.enableSaleAnalysis || false
  );
  const [presetLoaded, setPresetLoaded] = useState<string | null>(null);

  // ===== EFFECTS =====
  React.useEffect(() => {
    if (selectedPreset) {
      const presetValues = { ...selectedPreset.inputs };
      Object.entries(presetValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof RealEstateInputsWithSaleAnalysis, value);
        }
      });
      setPresetLoaded(selectedPreset.name || "Template");
      setTimeout(() => setPresetLoaded(null), 3000);
    }
  }, [selectedPreset, form]);

  // Sync sale analysis switch with form state
  React.useEffect(() => {
    setShowSaleAnalysis(
      watchedValues.saleAnalysis?.enableSaleAnalysis || false
    );
  }, [watchedValues.saleAnalysis?.enableSaleAnalysis]);

  // ===== VALIDATION LOGIC =====
  const canCalculate = useMemo(() => {
    const giaTriBDS = watchedValues.giaTriBDS || 0;
    const vonTuCo = watchedValues.vonTuCo || 0;
    return giaTriBDS > 0 && vonTuCo >= 0;
  }, [watchedValues]);

  // ===== FORM HANDLERS =====
  const onSubmit = useCallback(
    (data: RealEstateInputsWithSaleAnalysis) => {
      // Prepare sale analysis configuration
      const saleAnalysis: HoldingPeriodInputs | undefined = data.saleAnalysis
        ?.enableSaleAnalysis
        ? {
            holdingPeriodMonths: data.saleAnalysis?.holdingPeriodMonths || 60,
            propertyAppreciationRate:
              data.saleAnalysis?.propertyAppreciationRate || 5,
            sellingCostPercentage:
              data.saleAnalysis?.sellingCostPercentage || 3,
            saleDate: data.saleAnalysis?.saleDate,
            enableSaleAnalysis: true,
          }
        : undefined;

      // Remove form-specific fields and add sale analysis
      const { ...cleanedData } = data;

      const finalData: RealEstateInputsWithSaleAnalysis = {
        ...cleanedData,
        saleAnalysis,
      };

      onCalculate(finalData);
    },
    [onCalculate]
  );

  // ===== QUICK CALCULATIONS FOR PREVIEW =====
  const quickCalc = useMemo(() => {
    const giaTriBDS = watchedValues.giaTriBDS || 0;
    const vonTuCo = watchedValues.vonTuCo || 0;
    const tienThueThang = watchedValues.tienThueThang || 0;
    const holdingMonths = watchedValues.saleAnalysis?.holdingPeriodMonths || 60;
    const appreciationRate =
      watchedValues.saleAnalysis?.propertyAppreciationRate || 5;

    const soTienVay = Math.max(0, giaTriBDS - vonTuCo);
    const tyLeVay = giaTriBDS > 0 ? (soTienVay / giaTriBDS) * 100 : 0;

    // Quick future value projection
    const holdingYears = holdingMonths / 12;
    const projectedValue =
      giaTriBDS * Math.pow(1 + appreciationRate / 100, holdingYears);
    const projectedGain = projectedValue - giaTriBDS;

    return {
      tyLeVay: tyLeVay.toFixed(1),
      projectedValue,
      projectedGain,
      holdingYears,
    };
  }, [watchedValues]);

  return (
    <TooltipProvider>
      {/* @ts-ignore */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-6 ${className}`}
      >
        {/* Preset Loaded Notification */}
        {presetLoaded && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Đã tải template &quot;{presetLoaded}&quot; thành công!
            </AlertDescription>
          </Alert>
        )}

        {/* ===== CORE INPUTS SECTION ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              Thông Tin Bất Động Sản
            </CardTitle>
            <CardDescription>
              Nhập thông tin cơ bản về bất động sản và vốn đầu tư
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Giá trị BĐS */}
              <div className="space-y-2">
                <Label htmlFor="giaTriBDS" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Giá trị BĐS (VND) *
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Giá mua bán chính thức của bất động sản</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  {...form.register("giaTriBDS", { valueAsNumber: true })}
                  placeholder="VD: 3000000000"
                  className={
                    form.formState.errors.giaTriBDS ? "border-red-500" : ""
                  }
                />
                {form.formState.errors.giaTriBDS && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.giaTriBDS.message}
                  </p>
                )}
              </div>

              {/* Vốn tự có */}
              <div className="space-y-2">
                <Label htmlFor="vonTuCo" className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  Vốn tự có (VND) *
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Số tiền bạn có sẵn để đầu tư (không vay)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  {...form.register("vonTuCo", { valueAsNumber: true })}
                  placeholder="VD: 900000000"
                  className={
                    form.formState.errors.vonTuCo ? "border-red-500" : ""
                  }
                />
                {form.formState.errors.vonTuCo && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.vonTuCo.message}
                  </p>
                )}
                {quickCalc.tyLeVay && (
                  <p className="text-sm text-muted-foreground">
                    Tỷ lệ vay: {quickCalc.tyLeVay}%
                  </p>
                )}
              </div>
            </div>

            {/* Tiền thuê */}
            <div className="space-y-2">
              <Label
                htmlFor="tienThueThang"
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Tiền thuê hàng tháng (VND)
              </Label>
              <Input
                {...form.register("tienThueThang", { valueAsNumber: true })}
                placeholder="VD: 15000000"
              />
            </div>
          </CardContent>
        </Card>

        {/* ===== SALE ANALYSIS SECTION ===== */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Phân Tích Kịch Bản Bán
              <Badge variant="secondary" className="ml-2">
                Mới
              </Badge>
            </CardTitle>
            <CardDescription>
              Mô phỏng kết quả đầu tư nếu bán bất động sản tại một thời điểm cụ
              thể
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable Sale Analysis Toggle */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Bật phân tích bán
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tính toán ROI và lợi nhuận tổng thể khi bán tại thời điểm mong
                  muốn
                </p>
              </div>
              <Switch
                checked={showSaleAnalysis}
                onCheckedChange={(checked) => {
                  form.setValue("saleAnalysis.enableSaleAnalysis", checked);
                  setShowSaleAnalysis(checked);
                }}
              />
            </div>

            {/* Sale Analysis Configuration */}
            <Collapsible open={showSaleAnalysis}>
              <CollapsibleContent className="space-y-4">
                {showSaleAnalysis && (
                  <>
                    {/* Holding Period */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Thời gian nắm giữ
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Thời gian dự định nắm giữ BĐS trước khi bán</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Select
                          value={String(
                            watchedValues.saleAnalysis?.holdingPeriodMonths ||
                              60
                          )}
                          onValueChange={(value) =>
                            form.setValue(
                              "saleAnalysis.holdingPeriodMonths",
                              parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">2 năm (24 tháng)</SelectItem>
                            <SelectItem value="36">3 năm (36 tháng)</SelectItem>
                            <SelectItem value="48">4 năm (48 tháng)</SelectItem>
                            <SelectItem value="60">
                              5 năm (60 tháng) - Khuyến nghị
                            </SelectItem>
                            <SelectItem value="84">7 năm (84 tháng)</SelectItem>
                            <SelectItem value="120">
                              10 năm (120 tháng)
                            </SelectItem>
                            <SelectItem value="180">
                              15 năm (180 tháng)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Property Appreciation Rate */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Tỷ lệ tăng giá (%/năm)
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Dự kiến tỷ lệ tăng giá BĐS hàng năm</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <div className="space-y-2">
                          <Slider
                            value={[
                              watchedValues.saleAnalysis
                                ?.propertyAppreciationRate || 5,
                            ]}
                            onValueChange={(value) =>
                              form.setValue(
                                "saleAnalysis.propertyAppreciationRate",
                                value[0]
                              )
                            }
                            min={-5}
                            max={15}
                            step={0.5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>-5%</span>
                            <span className="font-medium">
                              {(
                                watchedValues.saleAnalysis
                                  ?.propertyAppreciationRate || 5
                              ).toFixed(1)}
                              %/năm
                            </span>
                            <span>15%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sale Projection Preview */}
                    {quickCalc.projectedValue > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          Dự phóng khi bán
                        </h4>
                        <div className="grid gap-2 md:grid-cols-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Thời gian nắm giữ:
                            </span>
                            <p className="font-medium">
                              {quickCalc.holdingYears.toFixed(1)} năm
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Giá trị dự kiến:
                            </span>
                            <p className="font-medium text-blue-600">
                              {formatVND(quickCalc.projectedValue)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Lãi từ tăng giá:
                            </span>
                            <p className="font-medium text-green-600">
                              +{formatVND(quickCalc.projectedGain)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Advanced Sale Options */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Tùy chọn nâng cao
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 mt-4">
                        {/* Selling Cost Percentage */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Chi phí bán (% giá bán)
                          </Label>
                          <div className="space-y-2">
                            <Slider
                              value={[
                                watchedValues.saleAnalysis
                                  ?.sellingCostPercentage || 3,
                              ]}
                              onValueChange={(value) =>
                                form.setValue(
                                  "saleAnalysis.sellingCostPercentage",
                                  value[0]
                                )
                              }
                              min={1}
                              max={10}
                              step={0.5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>1%</span>
                              <span className="font-medium">
                                {(
                                  watchedValues.saleAnalysis
                                    ?.sellingCostPercentage || 3
                                ).toFixed(1)}
                                %
                              </span>
                              <span>10%</span>
                            </div>
                          </div>
                        </div>

                        {/* Sale Date (Optional) */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Ngày dự kiến bán (tùy chọn)
                          </Label>
                          <Input
                            type="date"
                            {...form.register("saleAnalysis.saleDate", {
                              valueAsDate: true,
                            })}
                            min={new Date().toISOString().split("T")[0]}
                          />
                          <p className="text-xs text-muted-foreground">
                            Để trống nếu chỉ quan tâm đến thời gian nắm giữ
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* ===== ADVANCED OPTIONS SECTION ===== */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Tùy chọn nâng cao
              </span>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Chi tiết vay vốn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Lãi suất ưu đãi (%/năm)</Label>
                    <Input
                      {...form.register("laiSuatUuDai", {
                        valueAsNumber: true,
                      })}
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Thời gian ưu đãi (tháng)</Label>
                    <Input
                      {...form.register("thoiGianUuDai", {
                        valueAsNumber: true,
                      })}
                      placeholder="12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lãi suất thả nổi (%/năm)</Label>
                    <Input
                      {...form.register("laiSuatThaNoi", {
                        valueAsNumber: true,
                      })}
                      placeholder="12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Thời gian vay (năm)</Label>
                    <Input
                      {...form.register("thoiGianVay", { valueAsNumber: true })}
                      placeholder="20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Chi phí vận hành
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phí quản lý (VND/tháng)</Label>
                    <Input
                      {...form.register("phiQuanLy", { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tỷ lệ lấp đầy (%)</Label>
                    <Input
                      {...form.register("tyLeLapDay", { valueAsNumber: true })}
                      placeholder="95"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phí bảo trì (%/năm)</Label>
                    <Input
                      {...form.register("phiBaoTri", { valueAsNumber: true })}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bảo hiểm tài sản (%/năm)</Label>
                    <Input
                      {...form.register("baoHiemTaiSan", {
                        valueAsNumber: true,
                      })}
                      placeholder="0.15"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* ===== SUBMIT BUTTON ===== */}
        <Button
          type="submit"
          disabled={!canCalculate || isLoading}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tính toán...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-5 w-5" />
              {showSaleAnalysis
                ? "Tính toán với Sale Analysis"
                : "Tính toán đầu tư"}
              {showSaleAnalysis && (
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Enhanced
                </Badge>
              )}
            </>
          )}
        </Button>

        {/* Quick Help */}
        {!canCalculate && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vui lòng nhập ít nhất Giá trị BĐS và Vốn tự có để bắt đầu tính
              toán.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </TooltipProvider>
  );
}
