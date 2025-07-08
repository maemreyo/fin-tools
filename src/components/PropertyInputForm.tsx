// src/components/PropertyInputForm.tsx - USER-CENTRIC DESIGN
"use client";

import React from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

import { RealEstateInputs, DEFAULT_VALUES } from "@/types/real-estate";
import { formatVND, parseVND } from "@/lib/financial-utils";

// MINIMAL validation - chỉ validate những gì thực sự cần thiết
const realEstateSchema = z.object({
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

interface PropertyInputFormProps {
  onCalculate: (inputs: RealEstateInputs) => void;
  initialValues?: Partial<RealEstateInputs>;
  isLoading?: boolean;
}

// ENHANCED Currency Input với better formatting
const SmartCurrencyInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  showShorthand?: boolean;
}> = ({ value, onChange, placeholder, className, showShorthand = false }) => {
  const [displayValue, setDisplayValue] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  // Format with separators: 3,500,000,000
  const formatWithSeparators = (num: number) => {
    if (num === 0) return "";
    return num.toLocaleString("vi-VN");
  };

  // Show shorthand when not focused: 3.5 tỷ
  const formatShorthand = (num: number) => {
    if (num === 0) return "";
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)} tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)} triệu`;
    return formatWithSeparators(num);
  };

  React.useEffect(() => {
    if (!focused && showShorthand) {
      setDisplayValue(formatShorthand(value));
    } else {
      setDisplayValue(formatWithSeparators(value));
    }
  }, [value, focused, showShorthand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseVND(inputValue);
    onChange(numericValue);
  };

  const handleFocus = () => {
    setFocused(true);
    setDisplayValue(formatWithSeparators(value));
  };

  const handleBlur = () => {
    setFocused(false);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`pr-12 ${className}`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        VNĐ
      </span>
    </div>
  );
};

// Percentage input với tooltip
const SmartPercentageInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
  min?: number;
  max?: number;
  step?: number;
}> = ({ value, onChange, tooltip, min = 0, max = 100, step = 0.1 }) => {
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
          />
          <span className="text-sm text-muted-foreground">%</span>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default function PropertyInputForm({
  onCalculate,
  initialValues,
  isLoading,
}: PropertyInputFormProps) {
  const form = useForm<RealEstateInputs>({
    resolver: zodResolver(realEstateSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      ...initialValues,
    },
    mode: "onChange",
  });

  const [showLoanDetails, setShowLoanDetails] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);

  const watchedValues = form.watch();
  const { formState: { errors } } = form;

  // COMPREHENSIVE calculations với ALL dependencies
  const calculations = React.useMemo(() => {
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
    const chiPhiMuaBDS = giaTriBDS * (chiPhiMua / 100);
    const tongVonBanDau = vonTuCo + chiPhiTrangBi + chiPhiMuaBDS;
    
    // Step 2: Monthly payment calculation
    const monthlyInterestRate = laiSuatUuDai / 100 / 12;
    const totalPayments = thoiGianVay * 12;
    
    let monthlyPayment = 0;
    if (soTienVay > 0 && monthlyInterestRate > 0) {
      monthlyPayment = soTienVay * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
    }
    
    // Step 3: Operating expenses
    const thuNhapThueHieuDung = tienThueThang * (tyLeLapDay / 100);
    const chiPhiBaoTriThang = (giaTriBDS * phiBaoTri / 100) / 12;
    const baoHiemTaiSanThang = (giaTriBDS * baoHiemTaiSan / 100) / 12;
    const tongChiPhiVanHanh = monthlyPayment + phiQuanLy + chiPhiBaoTriThang + baoHiemTaiSanThang;
    
    // Step 4: Cash flow
    const dongTienRongBDS = thuNhapThueHieuDung - tongChiPhiVanHanh;
    
    // Step 5: Returns
    const roiHangNam = tongVonBanDau > 0 ? (dongTienRongBDS * 12 / tongVonBanDau) * 100 : 0;
    const rentalYield = giaTriBDS > 0 ? (tienThueThang * 12 / giaTriBDS) * 100 : 0;
    
    // Validation checks
    const hasBasicInfo = giaTriBDS > 0 && vonTuCo >= 0;
    const hasRentalInfo = tienThueThang > 0;
    const canCalculate = hasBasicInfo && hasRentalInfo;
    
    // Risk assessment
    const isHighLoanRatio = tyLeVay > 80;
    const isNegativeCashFlow = dongTienRongBDS < 0;
    const isLowYield = rentalYield < 4;
    
    return {
      // Basic calculations
      soTienVay,
      tyLeVay,
      tongVonBanDau,
      monthlyPayment,
      thuNhapThueHieuDung,
      dongTienRongBDS,
      roiHangNam,
      rentalYield,
      
      // Validation
      hasBasicInfo,
      hasRentalInfo,
      canCalculate,
      
      // Risk indicators
      isHighLoanRatio,
      isNegativeCashFlow,
      isLowYield,
      
      // Progress
      completionPercent: Math.min(100, 
        (hasBasicInfo ? 40 : 0) + 
        (hasRentalInfo ? 40 : 0) + 
        (canCalculate ? 20 : 0)
      ),
    };
  }, [
    watchedValues.giaTriBDS,
    watchedValues.vonTuCo,
    watchedValues.tienThueThang,
    watchedValues.laiSuatUuDai,
    watchedValues.laiSuatThaNoi,
    watchedValues.thoiGianVay,
    watchedValues.thoiGianUuDai,
    watchedValues.tyLeLapDay,
    watchedValues.phiQuanLy,
    watchedValues.phiBaoTri,
    watchedValues.baoHiemTaiSan,
    watchedValues.chiPhiTrangBi,
    watchedValues.chiPhiMua,
  ]);

  // Auto-show loan details khi user nhập cả 2 trường cơ bản
  React.useEffect(() => {
    if (calculations.hasBasicInfo && calculations.soTienVay > 0) {
      setShowLoanDetails(true);
      setCurrentStep(2);
    }
  }, [calculations.hasBasicInfo, calculations.soTienVay]);

  // Apply initial values
  React.useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof RealEstateInputs, value);
        }
      });
    }
  }, [initialValues, form]);

  const onSubmit = (data: RealEstateInputs) => {
    // Calculate derived values
    const soTienVay = Math.max(0, data.giaTriBDS! - data.vonTuCo!);
    const tyLeVay = data.giaTriBDS! > 0 ? (soTienVay / data.giaTriBDS!) * 100 : 0;
    
    const completeData = {
      ...DEFAULT_VALUES,
      ...data,
      tyLeVay, // Override với calculated value
    };
    
    onCalculate(completeData);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Progress Bar */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Tiến độ hoàn thành</h3>
                <span className="text-sm text-muted-foreground">
                  {calculations.completionPercent}%
                </span>
              </div>
              <Progress value={calculations.completionPercent} className="h-2" />
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-2 ${calculations.hasBasicInfo ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {calculations.hasBasicInfo ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2" />}
                  Thông tin cơ bản
                </div>
                <div className={`flex items-center gap-2 ${calculations.hasRentalInfo ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {calculations.hasRentalInfo ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2" />}
                  Thu nhập cho thuê
                </div>
                <div className={`flex items-center gap-2 ${calculations.canCalculate ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {calculations.canCalculate ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2" />}
                  Sẵn sàng tính toán
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STEP 1: Những gì user BIẾT - Cái họ có trong đầu */}
        <Card className={`transition-all ${currentStep === 1 ? 'border-2 border-primary shadow-lg' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </div>
              Bắt đầu với những gì bạn biết
            </CardTitle>
            <CardDescription>
              Bạn đã có con số giá bất động sản và số tiền hiện có? Đó là tất cả những gì cần để bắt đầu!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Giá BĐS */}
              <div className="space-y-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Banknote className="h-4 w-4 text-blue-600" />
                      Giá trị bất động sản *
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-semibold mb-1">Giá mua chính thức</p>
                      <p className="text-sm">Đây là giá ghi trong hợp đồng mua bán, chưa bao gồm chi phí phát sinh khác như thuế, phí môi giới, etc.</p>
                      <p className="text-xs text-muted-foreground mt-2">Ví dụ: 3,500,000,000 VNĐ</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <SmartCurrencyInput
                  value={watchedValues.giaTriBDS || 0}
                  onChange={(value) => {
                    form.setValue("giaTriBDS", value);
                    setCurrentStep(value > 0 ? 1 : 1);
                  }}
                  placeholder="VD: 3,500,000,000"
                  showShorthand={true}
                />
                {errors.giaTriBDS && (
                  <p className="text-sm text-red-600">{errors.giaTriBDS.message}</p>
                )}
              </div>

              {/* Vốn tự có */}
              <div className="space-y-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <PiggyBank className="h-4 w-4 text-green-600" />
                      Vốn tự có *
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-semibold mb-1">Số tiền bạn có sẵn</p>
                      <p className="text-sm">Bao gồm tiền mặt, tiết kiệm, hoặc tài sản có thể thanh lý ngay để mua bất động sản.</p>
                      <p className="text-xs text-muted-foreground mt-2">Ví dụ: 1,000,000,000 VNĐ</p>
                      <p className="text-xs text-blue-600 mt-1">💡 Tip: Nên giữ lại 10-15% cho chi phí phát sinh</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <SmartCurrencyInput
                  value={watchedValues.vonTuCo || 0}
                  onChange={(value) => {
                    form.setValue("vonTuCo", value);
                  }}
                  placeholder="VD: 1,000,000,000"
                  showShorthand={true}
                />
                {errors.vonTuCo && (
                  <p className="text-sm text-red-600">{errors.vonTuCo.message}</p>
                )}
              </div>
            </div>

            {/* Auto-calculated loan info */}
            {calculations.hasBasicInfo && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Tự động tính toán cho bạn</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Số tiền cần vay:</span>
                    <span className="font-semibold text-blue-700">
                      {formatVND(calculations.soTienVay)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tỷ lệ vay:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-700">
                        {calculations.tyLeVay.toFixed(1)}%
                      </span>
                      {calculations.isHighLoanRatio && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tỷ lệ vay cao (`{'>'}`80%). Hãy cân nhắc tăng vốn tự có để giảm rủi ro.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                {calculations.soTienVay > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                    <Lightbulb className="h-4 w-4" />
                    <span>Tiếp theo: Hãy cho chúng tôi biết về điều kiện vay và thu nhập cho thuê</span>
                    <ArrowDown className="h-4 w-4" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* STEP 2: Loan Details - Show khi đã có basic info */}
        {calculations.hasBasicInfo && calculations.soTienVay > 0 && (
          <Collapsible open={showLoanDetails} onOpenChange={setShowLoanDetails}>
            <CollapsibleTrigger asChild>
              <Card className={`cursor-pointer transition-all hover:shadow-md ${currentStep === 2 ? 'border-2 border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      Điều kiện vay vốn
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Tùy chỉnh được</Badge>
                      {showLoanDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Chúng tôi đã điền sẵn lãi suất thị trường hiện tại. Bạn có thể điều chỉnh theo điều kiện cụ thể.
                  </CardDescription>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <SmartPercentageInput
                        value={watchedValues.laiSuatUuDai || 8}
                        onChange={(value) => form.setValue("laiSuatUuDai", value)}
                        tooltip="Lãi suất ưu đãi thường áp dụng trong 12-24 tháng đầu. Hiện tại dao động 7-9%/năm tùy ngân hàng."
                      />
                      <Label className="text-sm">Lãi suất ưu đãi (%/năm)</Label>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={watchedValues.thoiGianUuDai || 12}
                          onChange={(e) => form.setValue("thoiGianUuDai", parseFloat(e.target.value) || 12)}
                          min={0}
                          max={60}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">tháng</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Thời gian áp dụng lãi suất ưu đãi, thường 6-24 tháng</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Label className="text-sm">Thời gian ưu đãi</Label>
                    </div>

                    <div className="space-y-2">
                      <SmartPercentageInput
                        value={watchedValues.laiSuatThaNoi || 10}
                        onChange={(value) => form.setValue("laiSuatThaNoi", value)}
                        tooltip="Lãi suất sau khi hết ưu đãi. Thường cao hơn 1-3% so với lãi suất ưu đãi."
                      />
                      <Label className="text-sm">Lãi suất thả nổi (%/năm)</Label>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={watchedValues.thoiGianVay || 20}
                          onChange={(e) => form.setValue("thoiGianVay", parseFloat(e.target.value) || 20)}
                          min={1}
                          max={30}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">năm</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Thời gian vay tối đa 25-30 năm. Thời gian càng dài, trả hàng tháng càng ít nhưng tổng lãi phải trả nhiều hơn.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Label className="text-sm">Thời gian vay</Label>
                    </div>
                  </div>

                  {/* Payment preview */}
                  {calculations.monthlyPayment > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-700">Dự kiến trả ngân hàng hàng tháng:</span>
                        <span className="font-bold text-orange-800 text-lg">
                          {formatVND(calculations.monthlyPayment)}
                        </span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        Tính theo lãi suất ưu đãi {watchedValues.laiSuatUuDai}%/năm
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* STEP 3: Rental Income - Key for calculation */}
        {calculations.hasBasicInfo && (
          <Card className={`transition-all ${currentStep === 3 ? 'border-2 border-primary shadow-lg' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                Thu nhập cho thuê
              </CardTitle>
              <CardDescription>
                Đây là yếu tố quyết định khả năng sinh lời của bất động sản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Tiền thuê hàng tháng *
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-semibold mb-1">Mức thuê thị trường</p>
                        <p className="text-sm">Tham khảo giá cho thuê của các căn tương tự trong khu vực. Nên thận trọng, không ước tính quá cao.</p>
                        <p className="text-xs text-blue-600 mt-2">💡 Tip: Kiểm tra trên Batdongsan.com.vn, Chotot.com</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <SmartCurrencyInput
                    value={watchedValues.tienThueThang || 0}
                    onChange={(value) => {
                      form.setValue("tienThueThang", value);
                      setCurrentStep(3);
                    }}
                    placeholder="VD: 25,000,000"
                    showShorthand={true}
                  />
                </div>

                <div className="space-y-3">
                  <SmartPercentageInput
                    value={watchedValues.tyLeLapDay || 95}
                    onChange={(value) => form.setValue("tyLeLapDay", value)}
                    tooltip="Tỷ lệ thời gian có khách thuê trong năm. 95% = 11.4 tháng có khách thuê, 0.6 tháng trống."
                    min={50}
                    max={100}
                  />
                  <Label className="text-sm">Tỷ lệ lấp đầy (%)</Label>
                </div>
              </div>

              {/* Rental yield indicator */}
              {calculations.hasRentalInfo && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-700">Tỷ suất cho thuê (Rental Yield):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-800">
                        {calculations.rentalYield.toFixed(2)}%/năm
                      </span>
                      {calculations.isLowYield && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tỷ suất cho thuê thấp (`{'<'}`4%). Hãy cân nhắc tăng giá thuê hoặc giảm giá mua.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-green-600">
                    {calculations.rentalYield >= 6 ? "Tuyệt vời! Tỷ suất cho thuê cao." :
                     calculations.rentalYield >= 4 ? "Tốt. Tỷ suất cho thuê hợp lý." :
                     "Thấp. Cân nhắc điều chỉnh giá thuê hoặc giá mua."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* LIVE PREVIEW Results */}
        {calculations.canCalculate && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Target className="h-5 w-5" />
                Kết quả dự kiến
              </CardTitle>
              <CardDescription>
                Tính toán sơ bộ dựa trên thông tin bạn đã cung cấp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Dòng tiền hàng tháng</div>
                  <div className={`text-2xl font-bold ${
                    calculations.dongTienRongBDS > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatVND(calculations.dongTienRongBDS)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {calculations.dongTienRongBDS > 0 ? 'Dương - Sinh lời' : 'Âm - Lỗ hàng tháng'}
                  </div>
                </div>

                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">ROI hàng năm</div>
                  <div className={`text-2xl font-bold ${
                    calculations.roiHangNam > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculations.roiHangNam.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Trên vốn đầu tư ban đầu
                  </div>
                </div>

                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Tổng vốn cần</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatVND(calculations.tongVonBanDau)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Bao gồm chi phí phát sinh
                  </div>
                </div>
              </div>

              {/* Risk warnings */}
              {(calculations.isNegativeCashFlow || calculations.isHighLoanRatio || calculations.isLowYield) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-yellow-800">Cần lưu ý:</p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {calculations.isNegativeCashFlow && <li>• Dòng tiền âm - bạn cần bỏ thêm tiền hàng tháng</li>}
                        {calculations.isHighLoanRatio && <li>• Tỷ lệ vay cao (`{'>'}`{calculations.tyLeVay.toFixed(0)}%) - rủi ro tài chính cao</li>}
                        {calculations.isLowYield && <li>• Tỷ suất cho thuê thấp (`{'<'}`4%) - hiệu quả đầu tư không cao</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Tùy chọn nâng cao
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Tùy chỉnh chi tiết</Badge>
                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CardTitle>
                <CardDescription>
                  Điều chỉnh các chi phí vận hành, thuế, và thông số khác để tính toán chính xác hơn
                </CardDescription>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <SmartCurrencyInput
                      value={watchedValues.phiQuanLy || 0}
                      onChange={(value) => form.setValue("phiQuanLy", value)}
                      placeholder="500,000"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="text-sm flex items-center gap-1 cursor-pointer">
                          Phí quản lý/tháng
                          <HelpCircle className="h-3 w-3" />
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Phí dịch vụ quản lý chung cư hoặc phí thuê công ty quản lý cho thuê</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="space-y-2">
                    <SmartPercentageInput
                      value={watchedValues.phiBaoTri || 1}
                      onChange={(value) => form.setValue("phiBaoTri", value)}
                      tooltip="Chi phí bảo trì, sửa chữa hàng năm, thường 1-2% giá trị BĐS"
                      max={5}
                      step={0.1}
                    />
                    <Label className="text-sm">Phí bảo trì (%/năm)</Label>
                  </div>

                  <div className="space-y-2">
                    <SmartPercentageInput
                      value={watchedValues.thueSuatChoThue || 10}
                      onChange={(value) => form.setValue("thueSuatChoThue", value)}
                      tooltip="Thuế thu nhập từ cho thuê, hiện tại 10% hoặc 5% tùy loại hình"
                      max={50}
                    />
                    <Label className="text-sm">Thuế cho thuê (%)</Label>
                  </div>

                  <div className="space-y-2">
                    <SmartPercentageInput
                      value={watchedValues.baoHiemTaiSan || 0.1}
                      onChange={(value) => form.setValue("baoHiemTaiSan", value)}
                      tooltip="Bảo hiểm cháy nổ, thiên tai cho tài sản, thường 0.1-0.2%/năm"
                      max={2}
                      step={0.01}
                    />
                    <Label className="text-sm">Bảo hiểm tài sản (%/năm)</Label>
                  </div>

                  <div className="space-y-2">
                    <SmartCurrencyInput
                      value={watchedValues.chiPhiTrangBi || 0}
                      onChange={(value) => form.setValue("chiPhiTrangBi", value)}
                      placeholder="50,000,000"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="text-sm flex items-center gap-1 cursor-pointer">
                          Chi phí trang bị
                          <HelpCircle className="h-3 w-3" />
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nội thất, trang thiết bị cần thiết để cho thuê</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="space-y-2">
                    <SmartPercentageInput
                      value={watchedValues.chiPhiMua || 2}
                      onChange={(value) => form.setValue("chiPhiMua", value)}
                      tooltip="Thuế, phí, môi giới khi mua BĐS, thường 2-3% giá trị"
                      max={10}
                      step={0.1}
                    />
                    <Label className="text-sm">Chi phí mua (%)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full h-14 text-lg"
                disabled={isLoading || !calculations.canCalculate}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Đang phân tích chi tiết...
                  </div>
                ) : calculations.canCalculate ? (
                  <div className="flex items-center gap-2">
                    <Calculator className="h-6 w-6" />
                    Phân Tích Chi Tiết Dòng Tiền
                    <ArrowRight className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Vui lòng hoàn thành thông tin cơ bản
                  </div>
                )}
              </Button>

              {calculations.canCalculate && (
                <p className="text-center text-sm text-muted-foreground">
                  Nhấn để xem phân tích đầy đủ với biểu đồ, cảnh báo rủi ro và gợi ý tối ưu hóa
                </p>
              )}

              {!calculations.canCalculate && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Cần có: {!calculations.hasBasicInfo ? "Giá BĐS + Vốn tự có" : ""} 
                    {calculations.hasBasicInfo && !calculations.hasRentalInfo ? "Tiền thuê hàng tháng" : ""}
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="text-xs">
                      Hoàn thành: {calculations.completionPercent}%
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </TooltipProvider>
  );
}