// src/components/PropertyInputForm.tsx - FIXED VALIDATION & REAL-TIME CALC
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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  HelpCircle,
  Home,
  ChevronDown,
  ChevronUp,
  Calculator,
  DollarSign,
  CreditCard,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { RealEstateInputs, DEFAULT_VALUES } from "@/types/real-estate";
import { formatVND, parseVND } from "@/lib/financial-utils";

// SIMPLIFIED validation schema - chỉ validate những field thực sự critical
const realEstateSchema = z.object({
  // Core required fields only
  giaTriBDS: z
    .number()
    .min(100000000, "Giá trị BĐS phải ít nhất 100 triệu VNĐ")
    .optional()
    .or(z.literal(0)),
  tienThueThang: z
    .number()
    .min(0, "Tiền thuê tháng không được âm")
    .optional()
    .or(z.literal(0)),
  tyLeVay: z
    .number()
    .min(0)
    .max(100, "Tỷ lệ vay phải từ 0-100%")
    .optional()
    .or(z.literal(0)),
  laiSuatUuDai: z
    .number()
    .min(0)
    .max(50, "Lãi suất ưu đãi phải từ 0-50%")
    .optional()
    .or(z.literal(0)),
  laiSuatThaNoi: z
    .number()
    .min(0)
    .max(50, "Lãi suất thả nổi phải từ 0-50%")
    .optional()
    .or(z.literal(0)),
  thoiGianVay: z
    .number()
    .min(1)
    .max(30, "Thời gian vay phải từ 1-30 năm")
    .optional()
    .or(z.literal(0)),

  // All other fields are optional và có defaults
  chiPhiTrangBi: z.number().optional().default(0),
  chiPhiMua: z.number().optional().default(2),
  baoHiemKhoanVay: z.number().optional().default(1.5),
  thoiGianUuDai: z.number().optional().default(12),
  phiQuanLy: z.number().optional().default(0),
  baoHiemTaiSan: z.number().optional().default(0.1),
  tyLeLapDay: z.number().optional().default(95),
  phiBaoTri: z.number().optional().default(1),
  duPhongCapEx: z.number().optional().default(1),
  thueSuatChoThue: z.number().optional().default(10),
  chiPhiBan: z.number().optional().default(3),
  thuNhapKhac: z.number().optional().default(0),
  chiPhiSinhHoat: z.number().optional().default(0),
});

interface PropertyInputFormProps {
  onCalculate: (inputs: RealEstateInputs) => void;
  initialValues?: Partial<RealEstateInputs>;
  isLoading?: boolean;
}

// Currency Input Component - ENHANCED
const CurrencyInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => {
  const [displayValue, setDisplayValue] = React.useState(
    value ? value.toLocaleString("vi-VN") : ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Parse về số
    const numericValue = parseVND(inputValue);
    onChange(numericValue);
  };

  // Sync với external value changes
  React.useEffect(() => {
    const parsed = parseVND(displayValue);
    if (value !== parsed && !isNaN(value)) {
      setDisplayValue(value ? value.toLocaleString("vi-VN") : "");
    }
  }, [value]);

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        VNĐ
      </span>
    </div>
  );
};

// Percentage Input Component - SIMPLIFIED
const PercentageInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}> = ({ value, onChange, min = 0, max = 100, step = 0.1 }) => {
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
      />
      <span className="text-sm text-muted-foreground">%</span>
    </div>
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
    mode: "onChange", // Enable real-time validation
  });

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [showPersonal, setShowPersonal] = React.useState(false);

  const watchedValues = form.watch();
  const {
    formState: { errors, isDirty },
  } = form;

  // ENHANCED calculated values với ALL dependencies và comprehensive calculations
  const calculatedValues = React.useMemo(() => {
    const giaTriBDS = watchedValues.giaTriBDS || 0;
    const tyLeVay = watchedValues.tyLeVay || 0;
    const laiSuatUuDai = watchedValues.laiSuatUuDai || 0;
    const laiSuatThaNoi = watchedValues.laiSuatThaNoi || 0;
    const thoiGianVay = watchedValues.thoiGianVay || 0;
    const thoiGianUuDai = watchedValues.thoiGianUuDai || 0;
    const tienThueThang = watchedValues.tienThueThang || 0;
    const tyLeLapDay = watchedValues.tyLeLapDay || 95;
    const phiQuanLy = watchedValues.phiQuanLy || 0;
    const phiBaoTri = watchedValues.phiBaoTri || 1;
    const baoHiemTaiSan = watchedValues.baoHiemTaiSan || 0.1;
    const chiPhiTrangBi = watchedValues.chiPhiTrangBi || 0;
    const chiPhiMua = watchedValues.chiPhiMua || 2;

    // Basic calculations
    const soTienVay = giaTriBDS * (tyLeVay / 100);
    const vonTuCo = giaTriBDS - soTienVay + chiPhiTrangBi;
    const chiPhiMuaBDS = giaTriBDS * (chiPhiMua / 100);
    const tongVonBanDau = vonTuCo + chiPhiMuaBDS;

    // Monthly payment calculation (simplified PMT formula)
    const monthlyInterestRate = laiSuatUuDai / 100 / 12;
    const totalPayments = thoiGianVay * 12;

    let monthlyPayment = 0;
    if (soTienVay > 0 && monthlyInterestRate > 0) {
      monthlyPayment =
        (soTienVay *
          (monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, totalPayments))) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
    }

    // Operating expenses
    const thuNhapThueHieuDung = tienThueThang * (tyLeLapDay / 100);
    const chiPhiBaoTriThang = (giaTriBDS * phiBaoTri) / 100 / 12;
    const baoHiemTaiSanThang = (giaTriBDS * baoHiemTaiSan) / 100 / 12;
    const tongChiPhiVanHanh =
      monthlyPayment + phiQuanLy + chiPhiBaoTriThang + baoHiemTaiSanThang;

    // Net cash flow
    const dongTienRongBDS = thuNhapThueHieuDung - tongChiPhiVanHanh;

    // ROI calculation
    const roiHangNam =
      tongVonBanDau > 0 ? ((dongTienRongBDS * 12) / tongVonBanDau) * 100 : 0;

    // Rental yield
    const rentalYield =
      giaTriBDS > 0 ? ((tienThueThang * 12) / giaTriBDS) * 100 : 0;

    return {
      soTienVay,
      vonTuCo,
      tongVonBanDau,
      monthlyPayment,
      thuNhapThueHieuDung,
      dongTienRongBDS,
      roiHangNam,
      rentalYield,
      canCalculate:
        giaTriBDS > 0 &&
        tienThueThang > 0 &&
        laiSuatUuDai > 0 &&
        thoiGianVay > 0,
    };
  }, [
    watchedValues.giaTriBDS,
    watchedValues.tyLeVay,
    watchedValues.laiSuatUuDai,
    watchedValues.laiSuatThaNoi,
    watchedValues.thoiGianVay,
    watchedValues.thoiGianUuDai,
    watchedValues.tienThueThang,
    watchedValues.tyLeLapDay,
    watchedValues.phiQuanLy,
    watchedValues.phiBaoTri,
    watchedValues.baoHiemTaiSan,
    watchedValues.chiPhiTrangBi,
    watchedValues.chiPhiMua,
  ]);

  // Apply initial values when they change (for preset loading)
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
    console.log("Form submitted with data:", data);

    // Fill in any missing values with defaults
    const completeData = {
      ...DEFAULT_VALUES,
      ...data,
    };

    try {
      onCalculate(completeData);
    } catch (error) {
      console.error("Error in onCalculate:", error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit triggered");
    console.log("Can calculate:", calculatedValues.canCalculate);
    console.log("Form errors:", errors);

    form.handleSubmit(onSubmit, (errors) => {
      console.log("Form validation errors:", errors);
    })();
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* ENHANCED Quick Preview Card với monthly payment */}
        <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tổng Quan Đầu Tư
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Giá trị BĐS</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatVND(watchedValues.giaTriBDS || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Vốn tự có</p>
                <p className="text-xl font-bold text-green-600">
                  {formatVND(calculatedValues.vonTuCo)}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Số tiền vay</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatVND(calculatedValues.soTienVay)}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Trả NH/tháng</p>
                <p className="text-xl font-bold text-red-600">
                  {formatVND(calculatedValues.monthlyPayment)}
                </p>
              </div>
            </div>

            {/* ADDED: Quick metrics preview */}
            {calculatedValues.canCalculate && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Dòng tiền/tháng
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      calculatedValues.dongTienRongBDS > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatVND(calculatedValues.dongTienRongBDS)}
                  </p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">ROI năm</p>
                  <p
                    className={`text-lg font-bold ${
                      calculatedValues.roiHangNam > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {calculatedValues.roiHangNam.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Rental Yield</p>
                  <p className="text-lg font-bold text-blue-600">
                    {calculatedValues.rentalYield.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Core Information - ENHANCED SINGLE LAYOUT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Thông Tin Cơ Bản
            </CardTitle>
            <CardDescription>
              Các thông tin cần thiết để tính toán dòng tiền
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property & Rental */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Bất Động Sản</h4>

                <div className="space-y-2">
                  <Label htmlFor="giaTriBDS">Giá trị BĐS</Label>
                  <CurrencyInput
                    value={watchedValues.giaTriBDS || 0}
                    onChange={(value) => form.setValue("giaTriBDS", value)}
                    placeholder="VD: 3,500,000,000"
                  />
                  {errors.giaTriBDS && (
                    <p className="text-sm text-red-600">
                      {errors.giaTriBDS.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tienThueThang">Tiền thuê hàng tháng</Label>
                  <CurrencyInput
                    value={watchedValues.tienThueThang || 0}
                    onChange={(value) => form.setValue("tienThueThang", value)}
                    placeholder="VD: 25,000,000"
                  />
                  {errors.tienThueThang && (
                    <p className="text-sm text-red-600">
                      {errors.tienThueThang.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chiPhiTrangBi">Chi phí trang bị</Label>
                  <CurrencyInput
                    value={watchedValues.chiPhiTrangBi || 0}
                    onChange={(value) => form.setValue("chiPhiTrangBi", value)}
                    placeholder="VD: 50,000,000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Vay Vốn</h4>

                <div className="space-y-2">
                  <Label htmlFor="tyLeVay">Tỷ lệ vay (%)</Label>
                  <div className="space-y-2">
                    <PercentageInput
                      value={watchedValues.tyLeVay || 0}
                      onChange={(value) => form.setValue("tyLeVay", value)}
                      max={100}
                    />
                    <Slider
                      value={[watchedValues.tyLeVay || 0]}
                      onValueChange={(values) =>
                        form.setValue("tyLeVay", values[0])
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laiSuatUuDai">Lãi suất ưu đãi (%/năm)</Label>
                  <PercentageInput
                    value={watchedValues.laiSuatUuDai || 0}
                    onChange={(value) => form.setValue("laiSuatUuDai", value)}
                    max={50}
                    step={0.1}
                  />
                  {errors.laiSuatUuDai && (
                    <p className="text-sm text-red-600">
                      {errors.laiSuatUuDai.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laiSuatThaNoi">
                    Lãi suất thả nổi (%/năm)
                  </Label>
                  <PercentageInput
                    value={watchedValues.laiSuatThaNoi || 0}
                    onChange={(value) => form.setValue("laiSuatThaNoi", value)}
                    max={50}
                    step={0.1}
                  />
                  {errors.laiSuatThaNoi && (
                    <p className="text-sm text-red-600">
                      {errors.laiSuatThaNoi.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thoiGianVay">Thời gian vay (năm)</Label>
                  <Input
                    type="number"
                    value={watchedValues.thoiGianVay || ""}
                    onChange={(e) =>
                      form.setValue(
                        "thoiGianVay",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min={1}
                    max={30}
                    className="w-24"
                    placeholder="20"
                  />
                  {errors.thoiGianVay && (
                    <p className="text-sm text-red-600">
                      {errors.thoiGianVay.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Advanced Options - COLLAPSIBLE */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-0">
                  <Settings className="h-4 w-4" />
                  Tùy chọn nâng cao
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thoiGianUuDai">
                      Thời gian ưu đãi (tháng)
                    </Label>
                    <Input
                      type="number"
                      value={watchedValues.thoiGianUuDai || ""}
                      onChange={(e) =>
                        form.setValue(
                          "thoiGianUuDai",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min={0}
                      max={60}
                      placeholder="12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phiQuanLy">Phí quản lý (VNĐ/tháng)</Label>
                    <CurrencyInput
                      value={watchedValues.phiQuanLy || 0}
                      onChange={(value) => form.setValue("phiQuanLy", value)}
                      placeholder="500,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tyLeLapDay">Tỷ lệ lấp đầy (%)</Label>
                    <PercentageInput
                      value={watchedValues.tyLeLapDay || 95}
                      onChange={(value) => form.setValue("tyLeLapDay", value)}
                      max={100}
                      min={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phiBaoTri">Phí bảo trì (%/năm)</Label>
                    <PercentageInput
                      value={watchedValues.phiBaoTri || 1}
                      onChange={(value) => form.setValue("phiBaoTri", value)}
                      max={5}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thueSuatChoThue">Thuế cho thuê (%)</Label>
                    <PercentageInput
                      value={watchedValues.thueSuatChoThue || 10}
                      onChange={(value) =>
                        form.setValue("thueSuatChoThue", value)
                      }
                      max={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baoHiemTaiSan">
                      Bảo hiểm tài sản (%/năm)
                    </Label>
                    <PercentageInput
                      value={watchedValues.baoHiemTaiSan || 0.1}
                      onChange={(value) =>
                        form.setValue("baoHiemTaiSan", value)
                      }
                      max={2}
                      step={0.01}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Personal Finance - COLLAPSIBLE */}
            <Collapsible open={showPersonal} onOpenChange={setShowPersonal}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-0">
                  <DollarSign className="h-4 w-4" />
                  Tài chính cá nhân (tùy chọn)
                  {showPersonal ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thuNhapKhac">
                      Thu nhập khác (VNĐ/tháng)
                    </Label>
                    <CurrencyInput
                      value={watchedValues.thuNhapKhac || 0}
                      onChange={(value) => form.setValue("thuNhapKhac", value)}
                      placeholder="VD: 30,000,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chiPhiSinhHoat">
                      Chi phí sinh hoạt (VNĐ/tháng)
                    </Label>
                    <CurrencyInput
                      value={watchedValues.chiPhiSinhHoat || 0}
                      onChange={(value) =>
                        form.setValue("chiPhiSinhHoat", value)
                      }
                      placeholder="VD: 20,000,000"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Submit Button - FIXED */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Quick validation feedback */}
              {!calculatedValues.canCalculate && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">
                      Cần nhập thêm thông tin:
                    </h4>
                  </div>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    {(!watchedValues.giaTriBDS ||
                      watchedValues.giaTriBDS === 0) && (
                      <li>• Giá trị bất động sản</li>
                    )}
                    {(!watchedValues.tienThueThang ||
                      watchedValues.tienThueThang === 0) && (
                      <li>• Tiền thuê hàng tháng</li>
                    )}
                    {(!watchedValues.laiSuatUuDai ||
                      watchedValues.laiSuatUuDai === 0) && (
                      <li>• Lãi suất ưu đãi</li>
                    )}
                    {(!watchedValues.thoiGianVay ||
                      watchedValues.thoiGianVay === 0) && (
                      <li>• Thời gian vay</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Validation errors */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Cần sửa lỗi:
                  </h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>• {error?.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isLoading || !calculatedValues.canCalculate}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang tính toán...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Tính Toán Dòng Tiền
                  </div>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Nhấn để phân tích chi tiết khả năng sinh lời của bất động sản
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </TooltipProvider>
  );
}
