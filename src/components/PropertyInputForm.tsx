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
// import { Progress } from "@/components/ui/progress"; // COMMENTED OUT
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";

import {
  RealEstateInputs,
  DEFAULT_VALUES,
  PresetScenario,
} from "@/types/real-estate";

import { formatVND, parseVND } from "@/lib/financial-utils";

// ===== ENHANCED VALIDATION SCHEMA =====
const baseRealEstateSchema = z.object({
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
});

// ===== ENHANCED PROPS INTERFACE =====
interface EnhancedPropertyInputFormProps {
  onCalculate: (inputs: RealEstateInputs) => void;
  initialValues?: Partial<RealEstateInputs>;
  isLoading?: boolean;
  selectedPreset?: PresetScenario | null;
}

// ===== SMART CURRENCY INPUT COMPONENT =====
const SmartCurrencyInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  tooltip,
}) => {
  const [displayValue, setDisplayValue] = React.useState(
    value ? formatVND(value) : ""
  );

  React.useEffect(() => {
    if (value) {
      setDisplayValue(formatVND(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    const numericValue = parseVND(inputValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    if (value) {
      setDisplayValue(formatVND(value));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`flex-1 ${className || ""}`}
        disabled={disabled}
      />
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

// ===== PERCENTAGE INPUT COMPONENT =====
const PercentageInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}> = ({
  value,
  onChange,
  tooltip,
  min = 0,
  max = 100,
  step = 0.1,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-20"
        disabled={disabled}
      />
      <span className="text-sm text-muted-foreground">%</span>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

// ===== MAIN ENHANCED COMPONENT =====
export default function EnhancedPropertyInputForm({
  onCalculate,
  initialValues,
  isLoading,
  selectedPreset,
}: EnhancedPropertyInputFormProps) {
  // ===== STATE MANAGEMENT =====
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presetLoaded, setPresetLoaded] = useState<string | null>(null);
  // const [currentStep, setCurrentStep] = useState(1); // COMMENTED OUT

  // ===== FORM SETUP =====
  const form = useForm<RealEstateInputs>({
    // @ts-ignore
    resolver: zodResolver(baseRealEstateSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      ...initialValues,
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();
  const {
    formState: { errors, isValid },
  } = form;

  // ===== PRESET HANDLER =====
  React.useEffect(() => {
    if (selectedPreset?.inputs) {
      Object.entries(selectedPreset.inputs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          try {
            form.setValue(key as keyof RealEstateInputs, value, {
              shouldValidate: true,
            });
          } catch (error) {
            console.warn(`Failed to set form value for ${key}:`, error);
          }
        }
      });

      // Auto-expand advanced sections if preset has advanced values
      const hasAdvancedValues =
        (selectedPreset.inputs.phiQuanLy &&
          selectedPreset.inputs.phiQuanLy > 0) ||
        (selectedPreset.inputs.phiBaoTri &&
          selectedPreset.inputs.phiBaoTri !== 1) ||
        (selectedPreset.inputs.tyLeLapDay &&
          selectedPreset.inputs.tyLeLapDay !== 95);
      if (hasAdvancedValues) {
        setShowAdvanced(true);
      }

      // Show loan details if preset has custom loan values
      const hasCustomLoanValues =
        (selectedPreset.inputs.laiSuatUuDai &&
          selectedPreset.inputs.laiSuatUuDai !== 8) ||
        (selectedPreset.inputs.thoiGianUuDai &&
          selectedPreset.inputs.thoiGianUuDai !== 12) ||
        (selectedPreset.inputs.laiSuatThaNoi &&
          selectedPreset.inputs.laiSuatThaNoi !== 10);
      if (hasCustomLoanValues) {
        setShowLoanDetails(true);
      }

      setPresetLoaded(selectedPreset.name || "Template");
      setTimeout(() => setPresetLoaded(null), 3000);
    }
  }, [selectedPreset, form]);

  // ===== VALIDATION LOGIC =====
  const canCalculate = useMemo(() => {
    const giaTriBDS = watchedValues.giaTriBDS || 0;
    const vonTuCo = watchedValues.vonTuCo || 0;
    return giaTriBDS > 0 && vonTuCo >= 0;
  }, [watchedValues]);

  // ===== CALCULATIONS FOR PREVIEW =====
  const calculations = useMemo(() => {
    const giaTriBDS = watchedValues.giaTriBDS || 0;
    const vonTuCo = watchedValues.vonTuCo || 0;
    const tienThueThang = watchedValues.tienThueThang || 0;
    const laiSuatUuDai = watchedValues.laiSuatUuDai || 8;
    const laiSuatThaNoi = watchedValues.laiSuatThaNoi || 10;
    const thoiGianVay = watchedValues.thoiGianVay || 20;
    const tyLeLapDay = watchedValues.tyLeLapDay || 95;
    const phiQuanLy = watchedValues.phiQuanLy || 0;
    const phiBaoTri = watchedValues.phiBaoTri || 1;
    const baoHiemTaiSan = watchedValues.baoHiemTaiSan || 0.1;
    const chiPhiTrangBi = watchedValues.chiPhiTrangBi || 0;
    const chiPhiMua = watchedValues.chiPhiMua || 2;

    // Basic calculations
    const soTienVay = Math.max(0, giaTriBDS - vonTuCo);
    const tyLeVay = giaTriBDS > 0 ? (soTienVay / giaTriBDS) * 100 : 0;

    // Monthly payments (simplified)
    const laiSuatThangThaNoi = laiSuatThaNoi / 100 / 12;
    const soThangVay = thoiGianVay * 12;
    const traNoHangThangThaNoi =
      soTienVay > 0 && laiSuatThangThaNoi > 0
        ? (soTienVay *
            laiSuatThangThaNoi *
            Math.pow(1 + laiSuatThangThaNoi, soThangVay)) /
          (Math.pow(1 + laiSuatThangThaNoi, soThangVay) - 1)
        : 0;

    // Income and expenses
    const thuNhapThueThucTe = tienThueThang * (tyLeLapDay / 100);
    const chiPhiHangThang =
      phiQuanLy +
      (giaTriBDS * phiBaoTri) / 100 / 12 +
      (giaTriBDS * baoHiemTaiSan) / 100 / 12;

    // Cash flow
    const dongTienRong = thuNhapThueThucTe - traNoHangThangThaNoi - chiPhiHangThang;

    // Initial costs
    const tongChiPhiBanDau = vonTuCo + chiPhiTrangBi + (giaTriBDS * chiPhiMua) / 100;

    // ROI
    const roiHangNam = tongChiPhiBanDau > 0 ? ((dongTienRong * 12) / tongChiPhiBanDau) * 100 : 0;

    return {
      soTienVay,
      vonTuCo,
      tyLeVay,
      traNoHangThangThaNoi,
      thuNhapThueThucTe,
      chiPhiHangThang,
      dongTienRong,
      tongChiPhiBanDau,
      roiHangNam,
    };
  }, [watchedValues]);

  // ===== FORM SUBMISSION =====
  const onSubmit = useCallback(
    (data: RealEstateInputs) => {
      const dataWithCalculatedTyLeVay = {
        ...data,
        tyLeVay: calculations.tyLeVay,
      };
      onCalculate(dataWithCalculatedTyLeVay);
    },
    [onCalculate, calculations.tyLeVay]
  );

  // ===== RENDER =====
  return (
    <TooltipProvider>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ===== SIMPLIFIED HEADER CARD (No Progress Bar) ===== */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-6 w-6 text-blue-600" />
                  Thông Tin Bất Động Sản
                </CardTitle>
                <CardDescription>
                  "Chỉ cần giá nhà và số tiền bạn có - chúng tôi sẽ tính toán tất cả còn lại"
                </CardDescription>
              </div>
              {canCalculate && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Sẵn sàng tính toán
                </Badge>
              )}
            </div>

            {/* COMMENTED OUT: Progress Bar */}
            {/* 
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Tiến độ hoàn thành
                </span>
                <span className="text-sm font-medium">{formProgress}%</span>
              </div>
              <Progress value={formProgress} className="h-2" />
            </div>
            */}
          </CardHeader>
        </Card>

        {/* ===== PRESET LOADED ALERT ===== */}
        {presetLoaded && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              <strong>Đã tải template "{presetLoaded}"!</strong> Các thông tin đã được điền tự động vào form.
            </AlertDescription>
          </Alert>
        )}

        {/* ===== MAIN INPUT SECTION - FOCUSED ON 2 KEY INPUTS ===== */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Thông Tin Cốt Lõi
            </CardTitle>
            <CardDescription>
              Chỉ cần 2 thông tin này để bắt đầu phân tích
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Inputs - Highlighted */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="giaTriBDS" className="text-base font-medium flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-600" />
                  Giá trị bất động sản
                  <span className="text-red-500">*</span>
                </Label>
                <SmartCurrencyInput
                  value={watchedValues.giaTriBDS || 0}
                  onChange={(value) => form.setValue("giaTriBDS", value)}
                  placeholder="Ví dụ: 2,400,000,000"
                  className="text-lg font-medium"
                  tooltip="Giá trị thực tế của bất động sản bạn muốn mua"
                />
                {errors.giaTriBDS && (
                  <p className="text-sm text-red-500">{errors.giaTriBDS.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vonTuCo" className="text-base font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Vốn tự có
                  <span className="text-red-500">*</span>
                </Label>
                <SmartCurrencyInput
                  value={watchedValues.vonTuCo || 0}
                  onChange={(value) => form.setValue("vonTuCo", value)}
                  placeholder="Ví dụ: 750,000,000"
                  className="text-lg font-medium"
                  tooltip="Số tiền bạn có thể bỏ ra mua bất động sản"
                />
                {errors.vonTuCo && (
                  <p className="text-sm text-red-500">{errors.vonTuCo.message}</p>
                )}
              </div>
            </div>

            {/* Quick Preview */}
            {canCalculate && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Xem trước nhanh:</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Số tiền vay</div>
                    <div className="font-semibold text-blue-600">
                      {formatVND(calculations.soTienVay)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {calculations.tyLeVay.toFixed(1)}% giá trị BĐS
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Dòng tiền ước tính</div>
                    <div className={`font-semibold ${
                      calculations.dongTienRong >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatVND(calculations.dongTienRong)}
                    </div>
                    <div className="text-xs text-muted-foreground">mỗi tháng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">ROI ước tính</div>
                    <div className={`font-semibold ${
                      calculations.roiHangNam >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {calculations.roiHangNam.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">hàng năm</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== RENTAL INCOME SECTION ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Thu Nhập Dự Kiến
            </CardTitle>
            <CardDescription>
              Thông tin về thu nhập từ cho thuê (tùy chọn)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tienThueThang" className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Tiền thuê/tháng
                </Label>
                <SmartCurrencyInput
                  value={watchedValues.tienThueThang || 0}
                  onChange={(value) => form.setValue("tienThueThang", value)}
                  placeholder="Ví dụ: 6,000,000"
                  tooltip="Số tiền thuê dự kiến mỗi tháng"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tyLeLapDay" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Tỷ lệ lấp đầy
                </Label>
                <PercentageInput
                  value={watchedValues.tyLeLapDay || 95}
                  onChange={(value) => form.setValue("tyLeLapDay", value)}
                  min={50}
                  max={100}
                  tooltip="Tỷ lệ thời gian có khách thuê trong năm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== LOAN DETAILS (COLLAPSIBLE) ===== */}
        <Collapsible open={showLoanDetails} onOpenChange={setShowLoanDetails}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <CardTitle>Chi Tiết Khoản Vay</CardTitle>
                  </div>
                  {showLoanDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription>
                  Điều chỉnh thông tin lãi suất và thời gian vay
                </CardDescription>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="laiSuatUuDai">Lãi suất ưu đãi (%)</Label>
                    <PercentageInput
                      value={watchedValues.laiSuatUuDai || 8}
                      onChange={(value) => form.setValue("laiSuatUuDai", value)}
                      min={1}
                      max={20}
                      tooltip="Lãi suất trong giai đoạn ưu đãi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thoiGianUuDai">Thời gian ưu đãi (tháng)</Label>
                    <Input
                      type="number"
                      value={watchedValues.thoiGianUuDai || 12}
                      onChange={(e) => form.setValue("thoiGianUuDai", parseInt(e.target.value))}
                      min={1}
                      max={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="laiSuatThaNoi">Lãi suất thả nổi (%)</Label>
                    <PercentageInput
                      value={watchedValues.laiSuatThaNoi || 10}
                      onChange={(value) => form.setValue("laiSuatThaNoi", value)}
                      min={1}
                      max={25}
                      tooltip="Lãi suất sau giai đoạn ưu đãi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thoiGianVay">Thời gian vay (năm)</Label>
                    <Input
                      type="number"
                      value={watchedValues.thoiGianVay || 20}
                      onChange={(e) => form.setValue("thoiGianVay", parseInt(e.target.value))}
                      min={1}
                      max={50}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* ===== ADVANCED OPTIONS (COLLAPSIBLE) ===== */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <CardTitle>Tùy Chọn Nâng Cao</CardTitle>
                  </div>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <CardDescription>
                  Chi phí và thông tin chi tiết khác
                </CardDescription>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="chiPhiTrangBi">Chi phí trang bị</Label>
                    <SmartCurrencyInput
                      value={watchedValues.chiPhiTrangBi || 0}
                      onChange={(value) => form.setValue("chiPhiTrangBi", value)}
                      placeholder="Ví dụ: 100,000,000"
                      tooltip="Chi phí nội thất, trang bị"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phiQuanLy">Phí quản lý/tháng</Label>
                    <SmartCurrencyInput
                      value={watchedValues.phiQuanLy || 0}
                      onChange={(value) => form.setValue("phiQuanLy", value)}
                      placeholder="Ví dụ: 480,000"
                      tooltip="Phí quản lý chung cư hàng tháng"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phiBaoTri">Phí bảo trì (%/năm)</Label>
                    <PercentageInput
                      value={watchedValues.phiBaoTri || 1}
                      onChange={(value) => form.setValue("phiBaoTri", value)}
                      min={0}
                      max={5}
                      tooltip="Phí bảo trì định kỳ (% giá trị BĐS/năm)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baoHiemTaiSan">Bảo hiểm (%/năm)</Label>
                    <PercentageInput
                      value={watchedValues.baoHiemTaiSan || 0.1}
                      onChange={(value) => form.setValue("baoHiemTaiSan", value)}
                      min={0}
                      max={1}
                      step={0.01}
                      tooltip="Bảo hiểm tài sản (% giá trị BĐS/năm)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* ===== CALCULATE BUTTON ===== */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">Sẵn sàng tính toán?</h3>
                <p className="text-sm text-green-600">
                  Chúng tôi sẽ phân tích toàn diện và đưa ra kết quả chi tiết
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!canCalculate || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tính toán...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Tính toán ngay
                    <Rocket className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </TooltipProvider>
  );
}