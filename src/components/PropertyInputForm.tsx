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
import { Progress } from "@/components/ui/progress";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  Calendar as CalendarIcon,
  Rocket,
  Settings,
  Zap,
  Clock,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

import { RealEstateInputs, DEFAULT_VALUES } from "@/types/real-estate";
import { TimelineEnabledInputs } from "@/types/timeline-integration";
import { formatVND, parseVND } from "@/lib/financial-utils";

// ===== ENHANCED VALIDATION SCHEMA =====
// Base schema for classic mode
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

// Enhanced schema for timeline mode
const timelineRealEstateSchema = baseRealEstateSchema.extend({
  // Timeline-specific fields
  enableTimeline: z.boolean().default(false),
  timelineStartDate: z.date().optional(),
  initialCashPayment: z.number().optional(),
  loanDisbursementSchedule: z.array(z.object({
    month: z.number(),
    amount: z.number(),
    description: z.string().optional()
  })).optional(),
  defaultGracePeriod: z.number().optional().default(0),
  includeInflation: z.boolean().default(false),
  inflationRate: z.number().optional().default(3.0),
  includePropertyAppreciation: z.boolean().default(false),
  appreciationRate: z.number().optional().default(5.0),
});

// ===== ENHANCED PROPS INTERFACE =====
interface EnhancedPropertyInputFormProps {
  onCalculate: (inputs: RealEstateInputs) => void;
  onTimelineActivate?: (inputs: TimelineEnabledInputs) => void;
  initialValues?: Partial<RealEstateInputs>;
  isLoading?: boolean;
  mode?: 'CLASSIC' | 'TIMELINE'; // 🆕 Mode indicator
  showTimelineToggle?: boolean; // 🆕 Option to show timeline toggle
}

// ===== SMART CURRENCY INPUT COMPONENT =====
const SmartCurrencyInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  showShorthand?: boolean;
  disabled?: boolean;
}> = ({ value, onChange, placeholder, className, showShorthand = true, disabled = false }) => {
  const [displayValue, setDisplayValue] = React.useState(
    value ? formatVND(value, !showShorthand) : ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseVND(inputValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    if (value) {
      setDisplayValue(formatVND(value, !showShorthand));
    }
  };

  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
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
}> = ({ value, onChange, tooltip, min = 0, max = 100, step = 0.1, disabled = false }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
          {tooltip && <HelpCircle className="h-4 w-4 text-muted-foreground" />}
        </div>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

// ===== MAIN ENHANCED COMPONENT =====
export default function EnhancedPropertyInputForm({
  onCalculate,
  onTimelineActivate,
  initialValues,
  isLoading,
  mode = 'CLASSIC',
  showTimelineToggle = true
}: EnhancedPropertyInputFormProps) {
  // ===== STATE MANAGEMENT =====
  const [timelineMode, setTimelineMode] = useState(mode === 'TIMELINE');
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTimelineSettings, setShowTimelineSettings] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTimelineReady, setIsTimelineReady] = useState(false);

  // ===== FORM SETUP =====
  const form = useForm<TimelineEnabledInputs>({
    resolver: zodResolver(timelineMode ? timelineRealEstateSchema : baseRealEstateSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      ...initialValues,
      enableTimeline: timelineMode,
      timelineStartDate: new Date(),
      includeInflation: false,
      inflationRate: 3.0,
      includePropertyAppreciation: false,
      appreciationRate: 5.0,
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();
  const { formState: { errors, isValid } } = form;

  // ===== TIMELINE MODE HANDLER =====
  const handleTimelineModeToggle = useCallback((enabled: boolean) => {
    setTimelineMode(enabled);
    form.setValue('enableTimeline', enabled);
    
    if (enabled && !watchedValues.timelineStartDate) {
      form.setValue('timelineStartDate', new Date());
    }
  }, [form, watchedValues.timelineStartDate]);

  // ===== ENHANCED CALCULATIONS =====
  const calculations = useMemo(() => {
    const giaTriBDS = watchedValues.giaTriBDS || 0;
    const vonTuCo = watchedValues.vonTuCo || 0;
    const tienThueThang = watchedValues.tienThueThang || 0;
    const laiSuatUuDai = watchedValues.laiSuatUuDai || 8;
    const laiSuatThaNoi = watchedValues.laiSuatThaNoi || 10;
    const thoiGianVay = watchedValues.thoiGianVay || 20;
    const thoiGianUuDai = watchedValues.thoiGianUuDai || 12;
    const tyLeLapDay = watchedValues.tyLeLapDay || 95;
    const phiQuanLy = watchedValues.phiQuanLy || 0;
    const phiBaoTri = watchedValues.phiBaoTri || 1;
    const baoHiemTaiSan = watchedValues.baoHiemTaiSan || 0.1;
    const chiPhiTrangBi = watchedValues.chiPhiTrangBi || 0;
    const chiPhiMua = watchedValues.chiPhiMua || 2;
    
    // Step 1: Loan calculation
    const soTienVay = Math.max(0, giaTriBDS - vonTuCo);
    const tyLeVay = giaTriBDS > 0 ? (soTienVay / giaTriBDS) * 100 : 0;
    
    // Step 2: Monthly payments (simplified calculation)
    const laiSuatThangUuDai = laiSuatUuDai / 100 / 12;
    const laiSuatThangThaNoi = laiSuatThaNoi / 100 / 12;
    const soThangVay = thoiGianVay * 12;
    
    const traNoHangThangUuDai = soTienVay > 0 && laiSuatThangUuDai > 0 ?
      (soTienVay * laiSuatThangUuDai * Math.pow(1 + laiSuatThangUuDai, soThangVay)) /
      (Math.pow(1 + laiSuatThangUuDai, soThangVay) - 1) : 0;
    
    const traNoHangThangThaNoi = soTienVay > 0 && laiSuatThangThaNoi > 0 ?
      (soTienVay * laiSuatThangThaNoi * Math.pow(1 + laiSuatThangThaNoi, soThangVay)) /
      (Math.pow(1 + laiSuatThangThaNoi, soThangVay) - 1) : 0;
    
    // Step 3: Income and expenses
    const thuNhapThueThucTe = tienThueThang * (tyLeLapDay / 100);
    const chiPhiHangThang = phiQuanLy + (giaTriBDS * phiBaoTri / 100 / 12) + (giaTriBDS * baoHiemTaiSan / 100 / 12);
    
    // Step 4: Cash flow
    const dongTienRong = thuNhapThueThucTe - traNoHangThangThaNoi - chiPhiHangThang;
    
    // Step 5: Initial costs
    const tongChiPhiBanDau = vonTuCo + chiPhiTrangBi + (giaTriBDS * chiPhiMua / 100);
    
    // Step 6: ROI calculation (simplified)
    const roiHangNam = tongChiPhiBanDau > 0 ? (dongTienRong * 12 / tongChiPhiBanDau) * 100 : 0;
    
    return {
      soTienVay,
      tyLeVay,
      traNoHangThangUuDai,
      traNoHangThangThaNoi,
      thuNhapThueThucTe,
      chiPhiHangThang,
      dongTienRong,
      tongChiPhiBanDau,
      roiHangNam,
      // Timeline-specific calculations
      isTimelineReady: timelineMode && isValid && !!watchedValues.timelineStartDate,
      timelineComplexity: timelineMode ? (
        (watchedValues.includeInflation ? 1 : 0) +
        (watchedValues.includePropertyAppreciation ? 1 : 0) +
        (watchedValues.defaultGracePeriod ? 1 : 0) +
        (watchedValues.loanDisbursementSchedule?.length || 0 > 1 ? 1 : 0)
      ) : 0
    };
  }, [watchedValues, timelineMode, isValid]);

  // ===== FORM SUBMISSION =====
  const onSubmit = useCallback((data: TimelineEnabledInputs) => {
    if (timelineMode && onTimelineActivate) {
      // Enhanced data for timeline mode
      const timelineData: TimelineEnabledInputs = {
        ...data,
        enableTimeline: true,
        initialCashPayment: data.vonTuCo + (data.chiPhiTrangBi || 0),
        // Add default loan disbursement if not specified
        loanDisbursementSchedule: data.loanDisbursementSchedule || [
          {
            month: 1,
            amount: calculations.soTienVay,
            description: "Giải ngân chính"
          }
        ]
      };
      onTimelineActivate(timelineData);
    } else {
      // Standard calculation for classic mode
      onCalculate(data);
    }
  }, [timelineMode, onTimelineActivate, onCalculate, calculations.soTienVay]);

  // ===== PROGRESS CALCULATION =====
  const formProgress = useMemo(() => {
    let completedFields = 0;
    let totalFields = 2; // giaTriBDS, vonTuCo are required
    
    if (watchedValues.giaTriBDS && watchedValues.giaTriBDS > 0) completedFields++;
    if (watchedValues.vonTuCo && watchedValues.vonTuCo >= 0) completedFields++;
    
    // Add timeline fields to progress
    if (timelineMode) {
      totalFields += 2; // timelineStartDate, basic timeline setup
      if (watchedValues.timelineStartDate) completedFields++;
      if (watchedValues.enableTimeline) completedFields++;
    }
    
    return Math.round((completedFields / totalFields) * 100);
  }, [watchedValues, timelineMode]);

  // ===== RENDER =====
  return (
    <TooltipProvider>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ===== HEADER CARD ===== */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                  Thông Tin Bất Động Sản
                  {timelineMode && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Timeline Mode
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {timelineMode ? 
                    "Nhập thông tin để tạo timeline 240 tháng với events tự động" :
                    "Nhập thông tin cơ bản để tính toán đầu tư bất động sản"
                  }
                </CardDescription>
              </div>
              
              {/* Timeline Toggle */}
              {showTimelineToggle && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">Timeline Mode</div>
                    <div className="text-xs text-muted-foreground">
                      Phân tích 240 tháng
                    </div>
                  </div>
                  <Switch
                    checked={timelineMode}
                    onCheckedChange={handleTimelineModeToggle}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Tiến độ hoàn thành
                </span>
                <span className="text-sm font-medium">
                  {formProgress}%
                </span>
              </div>
              <Progress value={formProgress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* ===== TIMELINE MODE ALERT ===== */}
        {timelineMode && (
          <Alert className="border-blue-200 bg-blue-50">
            <Rocket className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <strong>Timeline Mode đã được kích hoạt!</strong> Bạn sẽ có thể tạo timeline 240 tháng với events tự động và tối ưu hóa AI sau khi hoàn thành form này.
            </AlertDescription>
          </Alert>
        )}

        {/* ===== CORE PROPERTY INFORMATION ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Thông Tin Cơ Bản
            </CardTitle>
            <CardDescription>
              Những thông tin quan trọng nhất về BĐS của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Value */}
              <div className="space-y-2">
                <Label htmlFor="giaTriBDS" className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Giá trị BĐS *
                </Label>
                <SmartCurrencyInput
                  value={watchedValues.giaTriBDS || 0}
                  onChange={(value) => form.setValue('giaTriBDS', value)}
                  placeholder="VD: 3.2 tỷ hoặc 3200000000"
                  className={errors.giaTriBDS ? "border-red-500" : ""}
                />
                {errors.giaTriBDS && (
                  <p className="text-sm text-red-600">{errors.giaTriBDS.message}</p>
                )}
              </div>

              {/* Own Capital */}
              <div className="space-y-2">
                <Label htmlFor="vonTuCo" className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  Vốn tự có *
                </Label>
                <SmartCurrencyInput
                  value={watchedValues.vonTuCo || 0}
                  onChange={(value) => form.setValue('vonTuCo', value)}
                  placeholder="VD: 1 tỷ hoặc 1000000000"
                  className={errors.vonTuCo ? "border-red-500" : ""}
                />
                {errors.vonTuCo && (
                  <p className="text-sm text-red-600">{errors.vonTuCo.message}</p>
                )}
              </div>

              {/* Monthly Rent */}
              <div className="space-y-2">
                <Label htmlFor="tienThueThang" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tiền thuê dự kiến/tháng
                </Label>
                <SmartCurrencyInput
                  value={watchedValues.tienThueThang || 0}
                  onChange={(value) => form.setValue('tienThueThang', value)}
                  placeholder="VD: 25 triệu"
                />
              </div>

              {/* Setup Cost */}
              <div className="space-y-2">
                <Label htmlFor="chiPhiTrangBi" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Chi phí trang bị
                </Label>
                <SmartCurrencyInput
                  value={watchedValues.chiPhiTrangBi || 0}
                  onChange={(value) => form.setValue('chiPhiTrangBi', value)}
                  placeholder="VD: 100 triệu"
                />
              </div>
            </div>

            {/* Quick Calculation Preview */}
            {calculations.soTienVay > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4" />
                  <span className="font-medium">Tính toán nhanh</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Số tiền vay</div>
                    <div className="font-semibold">{formatVND(calculations.soTienVay)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tỷ lệ vay</div>
                    <div className="font-semibold">{calculations.tyLeVay.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Dòng tiền ước tính</div>
                    <div className={`font-semibold ${calculations.dongTienRong >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatVND(calculations.dongTienRong)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ROI ước tính</div>
                    <div className={`font-semibold ${calculations.roiHangNam >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculations.roiHangNam.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== TIMELINE SETTINGS ===== */}
        {timelineMode && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Cài Đặt Timeline
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  Nâng cao
                </Badge>
              </CardTitle>
              <CardDescription>
                Cấu hình chi tiết cho timeline 240 tháng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline Start Date */}
                <div className="space-y-2">
                  <Label>Ngày bắt đầu timeline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watchedValues.timelineStartDate ? 
                          format(watchedValues.timelineStartDate, "dd/MM/yyyy") : 
                          "Chọn ngày"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watchedValues.timelineStartDate}
                        onSelect={(date) => date && form.setValue('timelineStartDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Grace Period */}
                <div className="space-y-2">
                  <Label>Thời gian grace period (tháng)</Label>
                  <Input
                    type="number"
                    value={watchedValues.defaultGracePeriod || 0}
                    onChange={(e) => form.setValue('defaultGracePeriod', parseInt(e.target.value) || 0)}
                    min="0"
                    max="60"
                  />
                </div>
              </div>

              {/* Advanced Timeline Options */}
              <Collapsible open={showTimelineSettings} onOpenChange={setShowTimelineSettings}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Tùy chọn nâng cao
                    </span>
                    {showTimelineSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  {/* Inflation */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Tính lạm phát</Label>
                      <p className="text-sm text-muted-foreground">
                        Tự động điều chỉnh chi phí theo lạm phát
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={watchedValues.includeInflation || false}
                        onCheckedChange={(checked) => form.setValue('includeInflation', checked)}
                      />
                      {watchedValues.includeInflation && (
                        <PercentageInput
                          value={watchedValues.inflationRate || 3.0}
                          onChange={(value) => form.setValue('inflationRate', value)}
                          max={15}
                          step={0.1}
                        />
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Property Appreciation */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Tăng giá BĐS</Label>
                      <p className="text-sm text-muted-foreground">
                        Mô phỏng tăng giá bất động sản theo thời gian
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={watchedValues.includePropertyAppreciation || false}
                        onCheckedChange={(checked) => form.setValue('includePropertyAppreciation', checked)}
                      />
                      {watchedValues.includePropertyAppreciation && (
                        <PercentageInput
                          value={watchedValues.appreciationRate || 5.0}
                          onChange={(value) => form.setValue('appreciationRate', value)}
                          max={20}
                          step={0.1}
                        />
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )}

        {/* ===== LOAN DETAILS (Collapsible) ===== */}
        <Collapsible open={showLoanDetails} onOpenChange={setShowLoanDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Chi tiết khoản vay
              </span>
              {showLoanDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Lãi suất ưu đãi (%/năm)</Label>
                    <PercentageInput
                      value={watchedValues.laiSuatUuDai || 8}
                      onChange={(value) => form.setValue('laiSuatUuDai', value)}
                      tooltip="Lãi suất trong thời gian ưu đãi"
                      max={20}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Thời gian ưu đãi (tháng)</Label>
                    <Input
                      type="number"
                      value={watchedValues.thoiGianUuDai || 12}
                      onChange={(e) => form.setValue('thoiGianUuDai', parseInt(e.target.value) || 12)}
                      min="0"
                      max="60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Lãi suất thả nổi (%/năm)</Label>
                    <PercentageInput
                      value={watchedValues.laiSuatThaNoi || 10}
                      onChange={(value) => form.setValue('laiSuatThaNoi', value)}
                      tooltip="Lãi suất sau thời gian ưu đãi"
                      max={25}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Thời gian vay (năm)</Label>
                    <Input
                      type="number"
                      value={watchedValues.thoiGianVay || 20}
                      onChange={(e) => form.setValue('thoiGianVay', parseInt(e.target.value) || 20)}
                      min="1"
                      max="30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* ===== ADVANCED SETTINGS (Collapsible) ===== */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Cài đặt nâng cao
              </span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tỷ lệ lấp đầy (%)</Label>
                    <PercentageInput
                      value={watchedValues.tyLeLapDay || 95}
                      onChange={(value) => form.setValue('tyLeLapDay', value)}
                      tooltip="Tỷ lệ thời gian có người thuê"
                      min={50}
                      max={100}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Phí quản lý/tháng</Label>
                    <SmartCurrencyInput
                      value={watchedValues.phiQuanLy || 0}
                      onChange={(value) => form.setValue('phiQuanLy', value)}
                      placeholder="VD: 500,000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Phí bảo trì (%/năm)</Label>
                    <PercentageInput
                      value={watchedValues.phiBaoTri || 1}
                      onChange={(value) => form.setValue('phiBaoTri', value)}
                      tooltip="% giá trị BĐS dành cho bảo trì hàng năm"
                      max={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Thuế suất cho thuê (%)</Label>
                    <PercentageInput
                      value={watchedValues.thueSuatChoThue || 10}
                      onChange={(value) => form.setValue('thueSuatChoThue', value)}
                      tooltip="Thuế phải nộp trên thu nhập cho thuê"
                      max={50}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* ===== SUBMIT SECTION ===== */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Timeline Ready Indicator */}
              {timelineMode && (
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${calculations.isTimelineReady ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    {calculations.isTimelineReady ? 
                      <CheckCircle2 className="h-5 w-5 text-green-600" /> :
                      <Clock className="h-5 w-5 text-yellow-600" />
                    }
                  </div>
                  <div>
                    <div className="font-medium">
                      {calculations.isTimelineReady ? 
                        "Sẵn sàng tạo Timeline!" : 
                        "Cần thêm thông tin để tạo Timeline"
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Độ phức tạp: {calculations.timelineComplexity}/4 
                      {calculations.timelineComplexity === 0 && " (Cơ bản)"}
                      {calculations.timelineComplexity === 1 && " (Đơn giản)"}
                      {calculations.timelineComplexity >= 2 && " (Nâng cao)"}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : timelineMode ? (
                  <Rocket className="h-4 w-4 mr-2" />
                ) : (
                  <Calculator className="h-4 w-4 mr-2" />
                )}
                {timelineMode ? "Tạo Timeline 240 tháng" : "Tính toán đầu tư"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {/* Help Text */}
              <p className="text-sm text-muted-foreground text-center">
                {timelineMode ? 
                  "Timeline sẽ mô phỏng 240 tháng với events tự động và tối ưu hóa AI" :
                  "Tính toán nhanh dựa trên thông tin bạn đã nhập"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </TooltipProvider>
  );
}