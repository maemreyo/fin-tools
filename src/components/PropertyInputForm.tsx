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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PiggyBank,
  CreditCard,
  Settings,
  User,
  Calculator,
} from "lucide-react";

import { RealEstateInputs, DEFAULT_VALUES } from "@/types/real-estate";
import { formatVND, parseVND } from "@/lib/financial-utils";

// Validation schema với Zod
const realEstateSchema = z.object({
  // Giao dịch
  giaTriBDS: z
    .number()
    .min(100000000, "Giá trị BĐS phải ít nhất 100 triệu VNĐ"),
  chiPhiTrangBi: z.number().min(0, "Chi phí trang bị không được âm"),

  // Vốn ban đầu
  tyLeVay: z.number().min(0).max(100, "Tỷ lệ vay phải từ 0-100%"),
  chiPhiMua: z.number().min(0).max(10, "Chi phí mua phải từ 0-10%"),
  baoHiemKhoanVay: z.number().min(0).max(5, "Bảo hiểm khoản vay phải từ 0-5%"),

  // Vay vốn
  laiSuatUuDai: z.number().min(0).max(50, "Lãi suất ưu đãi phải từ 0-50%"),
  thoiGianUuDai: z
    .number()
    .min(0)
    .max(60, "Thời gian ưu đãi phải từ 0-60 tháng"),
  laiSuatThaNoi: z.number().min(0).max(50, "Lãi suất thả nổi phải từ 0-50%"),
  thoiGianVay: z.number().min(1).max(30, "Thời gian vay phải từ 1-30 năm"),

  // Vận hành
  tienThueThang: z.number().min(0, "Tiền thuê tháng không được âm"),
  phiQuanLy: z.number().min(0, "Phí quản lý không được âm"),
  baoHiemTaiSan: z.number().min(0).max(2, "Bảo hiểm tài sản phải từ 0-2%"),

  // Dự phòng
  tyLeLapDay: z.number().min(0).max(100, "Tỷ lệ lấp đầy phải từ 0-100%"),
  phiBaoTri: z.number().min(0).max(5, "Phí bảo trì phải từ 0-5%"),
  duPhongCapEx: z.number().min(0).max(5, "Dự phòng CapEx phải từ 0-5%"),

  // Thuế
  thueSuatChoThue: z
    .number()
    .min(0)
    .max(50, "Thuế suất cho thuê phải từ 0-50%"),
  chiPhiBan: z.number().min(0).max(10, "Chi phí bán phải từ 0-10%"),

  // Tài chính cá nhân
  thuNhapKhac: z.number().min(0, "Thu nhập khác không được âm"),
  chiPhiSinhHoat: z.number().min(0, "Chi phí sinh hoạt không được âm"),
});

interface PropertyInputFormProps {
  onCalculate: (inputs: RealEstateInputs) => void;
  initialValues?: Partial<RealEstateInputs>;
  isLoading?: boolean;
}

// Tooltips hướng dẫn cho từng trường
const tooltips = {
  giaTriBDS: {
    title: "Giá trị bất động sản",
    content:
      "Giá mua chính thức ghi trong hợp đồng. VD: Căn hộ 2PN tại Q7 giá 3.5 tỷ VNĐ",
    example: "3,500,000,000 VNĐ",
  },
  chiPhiTrangBi: {
    title: "Chi phí trang bị",
    content:
      "Tiền sửa chữa, mua nội thất để có thể ở hoặc cho thuê. Không bắt buộc nếu nhà đã hoàn thiện",
    example: "50,000,000 VNĐ",
  },
  tyLeVay: {
    title: "Tỷ lệ vay ngân hàng",
    content:
      "Ngân hàng thường cho vay 70-80% giá trị BĐS. Tỷ lệ càng cao, áp lực tài chính càng lớn",
    example: "70% (vay 2.45 tỷ, tự có 1.05 tỷ)",
  },
  laiSuatUuDai: {
    title: "Lãi suất ưu đãi",
    content: "Lãi suất thấp trong giai đoạn đầu. Hiện tại khoảng 6-9%/năm",
    example: "8%/năm",
  },
  thoiGianUuDai: {
    title: "Thời gian ưu đãi",
    content: "Thời gian hưởng lãi suất thấp, thường 6-24 tháng đầu",
    example: "12 tháng",
  },
  laiSuatThaNoi: {
    title: "Lãi suất thả nổi",
    content: "Lãi suất sau ưu đãi, thường cao hơn 3-4% so với ưu đãi",
    example: "12%/năm",
  },
  tienThueThang: {
    title: "Tiền thuê hàng tháng",
    content:
      "Thu nhập cho thuê thực tế. Xem giá thị trường xung quanh để ước tính",
    example: "15,000,000 VNĐ/tháng",
  },
  tyLeLapDay: {
    title: "Tỷ lệ lấp đầy",
    content: "% thời gian có khách thuê trong năm. Thường 90-98% tùy vị trí",
    example: "95% (trống 18 ngày/năm)",
  },
};

const FieldTooltip: React.FC<{
  field: keyof typeof tooltips;
  children: React.ReactNode;
}> = ({ field, children }) => {
  const tooltip = tooltips[field];
  if (!tooltip) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            {children}
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <p className="font-semibold">{tooltip.title}</p>
            <p className="text-sm">{tooltip.content}</p>
            {tooltip.example && (
              <p className="text-xs bg-muted p-2 rounded">
                <strong>Ví dụ:</strong> {tooltip.example}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Component cho input số tiền VNĐ
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

  React.useEffect(() => {
    if (value !== parseVND(displayValue)) {
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

// Component cho percentage input với slider
const PercentageInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
}> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
  showSlider = true,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
      {showSlider && (
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
      )}
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
    } as RealEstateInputs,
  });

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("basic");

  const watchedValues = form.watch();

  // Tính toán một số giá trị phụ để hiển thị
  const calculatedValues = React.useMemo(() => {
    const soTienVay = watchedValues.giaTriBDS * (watchedValues.tyLeVay / 100);
    const vonTuCo = watchedValues.giaTriBDS - soTienVay;
    const monthlyPayment =
      soTienVay > 0 ? soTienVay * (watchedValues.laiSuatUuDai / 100 / 12) : 0;

    return {
      soTienVay,
      vonTuCo,
      monthlyPayment: monthlyPayment * 1.2, // Rough estimate
    };
  }, [watchedValues]);

  const onSubmit = (data: RealEstateInputs) => {
    onCalculate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6">
        {/* Header với thông tin tổng quan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tính Toán Đầu Tư Bất Động Sản
            </CardTitle>
            <CardDescription>
              Nhập thông tin để phân tích khả năng sinh lời của bất động sản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Giá trị BĐS</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatVND(watchedValues.giaTriBDS || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Vốn tự có</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatVND(calculatedValues.vonTuCo || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Số tiền vay</p>
                <p className="text-lg font-semibold text-orange-600">
                  {formatVND(calculatedValues.soTienVay || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Input Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Cơ bản
            </TabsTrigger>
            <TabsTrigger value="loan" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Vay vốn
            </TabsTrigger>
            <TabsTrigger value="rental" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Cho thuê
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Chi phí
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Cá nhân
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Thông tin cơ bản */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Bất Động Sản</CardTitle>
                <CardDescription>
                  Nhập giá mua và chi phí ban đầu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FieldTooltip field="giaTriBDS">
                    <Label htmlFor="giaTriBDS">Giá trị bất động sản *</Label>
                  </FieldTooltip>
                  <CurrencyInput
                    value={watchedValues.giaTriBDS || 0}
                    onChange={(value) => form.setValue("giaTriBDS", value)}
                    placeholder="VD: 3,500,000,000"
                  />
                  {form.formState.errors.giaTriBDS && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.giaTriBDS.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <FieldTooltip field="chiPhiTrangBi">
                    <Label htmlFor="chiPhiTrangBi">
                      Chi phí trang bị ban đầu
                    </Label>
                  </FieldTooltip>
                  <CurrencyInput
                    value={watchedValues.chiPhiTrangBi || 0}
                    onChange={(value) => form.setValue("chiPhiTrangBi", value)}
                    placeholder="VD: 50,000,000"
                  />
                </div>

                <div className="space-y-2">
                  <FieldTooltip field="tyLeVay">
                    <Label htmlFor="tyLeVay">Tỷ lệ vay ngân hàng</Label>
                  </FieldTooltip>
                  <PercentageInput
                    value={watchedValues.tyLeVay || 0}
                    onChange={(value) => form.setValue("tyLeVay", value)}
                    max={90}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Thông tin vay vốn */}
          <TabsContent value="loan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Khoản Vay</CardTitle>
                <CardDescription>Lãi suất và thời gian vay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FieldTooltip field="laiSuatUuDai">
                      <Label htmlFor="laiSuatUuDai">
                        Lãi suất ưu đãi (%/năm)
                      </Label>
                    </FieldTooltip>
                    <PercentageInput
                      value={watchedValues.laiSuatUuDai || 0}
                      onChange={(value) => form.setValue("laiSuatUuDai", value)}
                      max={20}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldTooltip field="thoiGianUuDai">
                      <Label htmlFor="thoiGianUuDai">
                        Thời gian ưu đãi (tháng)
                      </Label>
                    </FieldTooltip>
                    <Input
                      type="number"
                      value={watchedValues.thoiGianUuDai || ""}
                      onChange={(e) =>
                        form.setValue(
                          "thoiGianUuDai",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      max="60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FieldTooltip field="laiSuatThaNoi">
                      <Label htmlFor="laiSuatThaNoi">
                        Lãi suất thả nổi (%/năm)
                      </Label>
                    </FieldTooltip>
                    <PercentageInput
                      value={watchedValues.laiSuatThaNoi || 0}
                      onChange={(value) =>
                        form.setValue("laiSuatThaNoi", value)
                      }
                      max={25}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thoiGianVay">Thời gian vay (năm) *</Label>
                    <Input
                      type="number"
                      {...form.register("thoiGianVay", { valueAsNumber: true })}
                      min="1"
                      max="30"
                    />
                  </div>
                </div>

                {/* Estimate monthly payment */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Ước tính trả ngân hàng hàng tháng
                  </p>
                  <p className="text-xl font-semibold text-blue-600">
                    {formatVND(calculatedValues.monthlyPayment)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Thông tin cho thuê */}
          <TabsContent value="rental" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thu Nhập Cho Thuê</CardTitle>
                <CardDescription>
                  Doanh thu và hiệu suất cho thuê
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FieldTooltip field="tienThueThang">
                    <Label htmlFor="tienThueThang">Tiền thuê hàng tháng</Label>
                  </FieldTooltip>
                  <CurrencyInput
                    value={watchedValues.tienThueThang || 0}
                    onChange={(value) => form.setValue("tienThueThang", value)}
                    placeholder="VD: 15,000,000"
                  />
                </div>

                <div className="space-y-2">
                  <FieldTooltip field="tyLeLapDay">
                    <Label htmlFor="tyLeLapDay">Tỷ lệ lấp đầy (%)</Label>
                  </FieldTooltip>
                  <PercentageInput
                    value={watchedValues.tyLeLapDay || 0}
                    onChange={(value) => form.setValue("tyLeLapDay", value)}
                    min={50}
                    max={100}
                  />
                </div>

                {/* Rental yield calculation */}
                {watchedValues.giaTriBDS && watchedValues.tienThueThang && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Tỷ suất cho thuê
                    </p>
                    <p className="text-xl font-semibold text-green-600">
                      {(
                        ((watchedValues.tienThueThang *
                          12 *
                          (watchedValues.tyLeLapDay / 100)) /
                          watchedValues.giaTriBDS) *
                        100
                      ).toFixed(2)}
                      % / năm
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Chi phí vận hành */}
          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chi Phí Vận Hành</CardTitle>
                <CardDescription>
                  Các khoản chi phí định kỳ và dự phòng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phiQuanLy">Phí quản lý hàng tháng</Label>
                  <CurrencyInput
                    value={watchedValues.phiQuanLy || 0}
                    onChange={(value) => form.setValue("phiQuanLy", value)}
                    placeholder="VD: 500,000"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="showAdvanced">
                    Hiển thị cài đặt nâng cao
                  </Label>
                  <Switch
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                  />
                </div>

                {showAdvanced && (
                  <div className="space-y-4 border-l-2 border-muted pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="phiBaoTri">
                        Phí bảo trì (% giá trị BĐS/năm)
                      </Label>
                      <PercentageInput
                        value={watchedValues.phiBaoTri || 0}
                        onChange={(value) => form.setValue("phiBaoTri", value)}
                        max={5}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duPhongCapEx">
                        Dự phòng CapEx (% giá trị BĐS/năm)
                      </Label>
                      <PercentageInput
                        value={watchedValues.duPhongCapEx || 0}
                        onChange={(value) =>
                          form.setValue("duPhongCapEx", value)
                        }
                        max={5}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="baoHiemTaiSan">
                        Bảo hiểm tài sản (% giá trị BĐS/năm)
                      </Label>
                      <PercentageInput
                        value={watchedValues.baoHiemTaiSan || 0}
                        onChange={(value) =>
                          form.setValue("baoHiemTaiSan", value)
                        }
                        max={2}
                        step={0.01}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thueSuatChoThue">Thuế cho thuê (%)</Label>
                      <PercentageInput
                        value={watchedValues.thueSuatChoThue || 0}
                        onChange={(value) =>
                          form.setValue("thueSuatChoThue", value)
                        }
                        max={50}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Tài chính cá nhân */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tài Chính Cá Nhân</CardTitle>
                <CardDescription>
                  Thu nhập và chi phí sinh hoạt của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thuNhapKhac">
                    Thu nhập hàng tháng (sau thuế) *
                  </Label>
                  <CurrencyInput
                    value={watchedValues.thuNhapKhac || 0}
                    onChange={(value) => form.setValue("thuNhapKhac", value)}
                    placeholder="VD: 30,000,000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chiPhiSinhHoat">
                    Chi phí sinh hoạt hàng tháng *
                  </Label>
                  <CurrencyInput
                    value={watchedValues.chiPhiSinhHoat || 0}
                    onChange={(value) => form.setValue("chiPhiSinhHoat", value)}
                    placeholder="VD: 20,000,000"
                  />
                </div>

                {/* Financial health indicator */}
                {watchedValues.thuNhapKhac && watchedValues.chiPhiSinhHoat && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Thu nhập khả dụng
                    </p>
                    <p className="text-xl font-semibold text-yellow-600">
                      {formatVND(
                        watchedValues.thuNhapKhac - watchedValues.chiPhiSinhHoat
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(
                        ((watchedValues.thuNhapKhac -
                          watchedValues.chiPhiSinhHoat) /
                          watchedValues.thuNhapKhac) *
                        100
                      ).toFixed(1)}
                      % thu nhập
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tính toán...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Tính Toán Dòng Tiền
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
