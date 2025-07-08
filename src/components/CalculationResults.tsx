"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Calculator,
  Home,
} from 'lucide-react';

import { CalculationResult } from '@/types/real-estate';
import { formatVND, formatPercent } from '@/lib/financial-utils';

interface CalculationResultsProps {
  result: CalculationResult;
  onExport?: () => void;
  onNewCalculation?: () => void;
}

// Color scheme cho charts
const CHART_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  warning: '#f59e0b'
};

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function CalculationResults({ result, onExport, onNewCalculation }: CalculationResultsProps) {
  const { inputs, steps, warnings, suggestions } = result;

  // Tính toán dữ liệu cho charts
  const cashFlowOverTime = React.useMemo(() => {
    const months = 60; // 5 năm
    const data = [];
    
    for (let month = 1; month <= months; month++) {
      // Simplified projection - trong thực tế sẽ phức tạp hơn
      const isPreferentialPeriod = month <= inputs.thoiGianUuDai;
      const currentCashFlow = steps.dongTienRongBDS;
      
      data.push({
        month,
        year: Math.ceil(month / 12),
        cashFlow: currentCashFlow,
        cumulativeCashFlow: currentCashFlow * month - steps.tongVonBanDau,
        period: isPreferentialPeriod ? 'Ưu đãi' : 'Thả nổi'
      });
    }
    
    return data;
  }, [inputs, steps]);

  // Breakdown chi phí hàng tháng
  const monthlyExpenseBreakdown = [
    { name: 'Trả ngân hàng', value: steps.tienTraNHThang, color: PIE_COLORS[0] },
    { name: 'Phí quản lý', value: inputs.phiQuanLy, color: PIE_COLORS[1] },
    { name: 'Bảo trì', value: steps.chiPhiBaoTriThang, color: PIE_COLORS[2] },
    { name: 'Dự phòng CapEx', value: steps.duPhongCapExThang, color: PIE_COLORS[3] },
    { name: 'Bảo hiểm', value: steps.baoHiemTaiSanThang, color: PIE_COLORS[4] }
  ].filter(item => item.value > 0);

  // Initial investment breakdown
  const initialInvestmentBreakdown = [
    { name: 'Vốn tự có', value: steps.vonTuCo, color: PIE_COLORS[0] },
    { name: 'Chi phí trang bị', value: inputs.chiPhiTrangBi, color: PIE_COLORS[1] },
    { name: 'Chi phí mua', value: inputs.giaTriBDS * (inputs.chiPhiMua / 100), color: PIE_COLORS[2] },
    { name: 'Bảo hiểm khoản vay', value: steps.soTienVay * (inputs.baoHiemKhoanVay / 100), color: PIE_COLORS[3] }
  ].filter(item => item.value > 0);

  // Key metrics
  const keyMetrics = [
    {
      label: 'Dòng tiền ròng BĐS',
      value: steps.dongTienRongBDS,
      format: 'currency',
      trend: steps.dongTienRongBDS > 0 ? 'up' : 'down',
      description: 'Thu nhập - chi phí từ BĐS mỗi tháng'
    },
    {
      label: 'Dòng tiền cá nhân',
      value: steps.dongTienCuoiCung,
      format: 'currency',
      trend: steps.dongTienCuoiCung > 0 ? 'up' : 'down',
      description: 'Tổng dòng tiền sau khi trừ sinh hoạt'
    },
    {
      label: 'ROI hàng năm',
      value: result.roiHangNam,
      format: 'percent',
      trend: result.roiHangNam > 8 ? 'up' : result.roiHangNam > 5 ? 'neutral' : 'down',
      description: 'Tỷ suất lợi nhuận trên vốn đầu tư'
    },
    {
      label: 'Thời gian hoàn vốn',
      value: result.paybackPeriod,
      format: 'years',
      trend: result.paybackPeriod < 10 ? 'up' : result.paybackPeriod < 15 ? 'neutral' : 'down',
      description: 'Số năm để thu hồi vốn đầu tư'
    }
  ];

  const MetricCard: React.FC<{ metric: typeof keyMetrics[0] }> = ({ metric }) => {
    const getTrendIcon = (trend: string) => {
      switch (trend) {
        case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
        case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
        default: return <DollarSign className="h-4 w-4 text-yellow-500" />;
      }
    };

    const formatValue = (value: number, format: string) => {
      switch (format) {
        case 'currency': return formatVND(value);
        case 'percent': return formatPercent(value);
        case 'years': return value > 0 ? `${value.toFixed(1)} năm` : 'Không hoàn vốn';
        default: return value.toString();
      }
    };

    const getTrendColor = (trend: string) => {
      switch (trend) {
        case 'up': return 'text-green-600 bg-green-50';
        case 'down': return 'text-red-600 bg-red-50';
        default: return 'text-yellow-600 bg-yellow-50';
      }
    };

    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-bold">{formatValue(metric.value, metric.format)}</p>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
            <div className={`p-2 rounded-full ${getTrendColor(metric.trend)}`}>
              {getTrendIcon(metric.trend)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header với tổng quan nhanh */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Kết Quả Phân Tích Đầu Tư
              </CardTitle>
              <CardDescription>
                Tính toán hoàn tất lúc {result.calculatedAt.toLocaleString('vi-VN')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {onExport && (
                <Button variant="outline" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất báo cáo
                </Button>
              )}
              {onNewCalculation && (
                <Button onClick={onNewCalculation}>
                  Tính toán mới
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cảnh báo và gợi ý nhanh */}
          {warnings.length > 0 && (
            <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-semibold text-red-700">Cảnh báo quan trọng</span>
              </div>
              <div className="space-y-1">
                {warnings.slice(0, 2).map((warning, index) => (
                  <p key={index} className="text-sm text-red-600">{warning}</p>
                ))}
                {warnings.length > 2 && (
                  <p className="text-xs text-red-500">+{warnings.length - 2} cảnh báo khác...</p>
                )}
              </div>
            </div>
          )}

          {/* Status tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Home className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-700">Tổng đầu tư</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatVND(steps.tongVonBanDau)}
              </p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">Dòng tiền/tháng</span>
              </div>
              <p className={`text-2xl font-bold ${steps.dongTienRongBDS >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatVND(steps.dongTienRongBDS)}
              </p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-700">ROI/năm</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {formatPercent(result.roiHangNam)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Chỉ số chính</TabsTrigger>
          <TabsTrigger value="breakdown">Chi tiết tính toán</TabsTrigger>
          <TabsTrigger value="charts">Biểu đồ</TabsTrigger>
          <TabsTrigger value="analysis">Phân tích & Gợi ý</TabsTrigger>
        </TabsList>

        {/* Tab 1: Key Metrics */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyMetrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>

          {/* Detailed breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thu Nhập Hàng Tháng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Tiền thuê danh nghĩa</span>
                  <span className="font-semibold">{formatVND(inputs.tienThueThang)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>× Tỷ lệ lấp đầy ({inputs.tyLeLapDay}%)</span>
                  <span>{formatVND(steps.thuNhapThueHieuDung)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>- Thuế cho thuê</span>
                  <span>-{formatVND(steps.thueChoThue_Thang)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Thu nhập ròng</span>
                  <span>{formatVND(steps.thuNhapThueHieuDung - steps.thueChoThue_Thang)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chi Phí Hàng Tháng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Trả ngân hàng</span>
                  <span className="font-semibold text-red-600">{formatVND(steps.tienTraNHThang)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Phí quản lý</span>
                  <span>{formatVND(inputs.phiQuanLy)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Bảo trì + dự phòng</span>
                  <span>{formatVND(steps.chiPhiBaoTriThang + steps.duPhongCapExThang)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Bảo hiểm</span>
                  <span>{formatVND(steps.baoHiemTaiSanThang)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-red-600">
                  <span>Tổng chi phí</span>
                  <span>{formatVND(steps.tongChiPhiVanHanh)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Detailed Breakdown */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bước tính toán */}
            <Card>
              <CardHeader>
                <CardTitle>4 Bước Tính Toán Chính</CardTitle>
                <CardDescription>Theo công thức trong tài liệu phân tích</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">1</Badge>
                    <span className="font-semibold">Vốn đầu tư ban đầu</span>
                  </div>
                  <div className="ml-8 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Vốn tự có</span>
                      <span>{formatVND(steps.vonTuCo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chi phí trang bị</span>
                      <span>{formatVND(inputs.chiPhiTrangBi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chi phí giao dịch</span>
                      <span>{formatVND(inputs.giaTriBDS * inputs.chiPhiMua / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bảo hiểm khoản vay</span>
                      <span>{formatVND(steps.soTienVay * inputs.baoHiemKhoanVay / 100)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Tổng vốn ban đầu</span>
                      <span>{formatVND(steps.tongVonBanDau)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">2</Badge>
                    <span className="font-semibold">Chi phí vận hành tháng</span>
                  </div>
                  <div className="ml-8 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Trả ngân hàng (giai đoạn ưu đãi)</span>
                      <span>{formatVND(steps.tienTraNHThang)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Các chi phí khác</span>
                      <span>{formatVND(steps.tongChiPhiVanHanh - steps.tienTraNHThang)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Tổng chi phí</span>
                      <span>{formatVND(steps.tongChiPhiVanHanh)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">3</Badge>
                    <span className="font-semibold">Dòng tiền ròng BĐS</span>
                  </div>
                  <div className="ml-8 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Thu nhập hiệu dung</span>
                      <span>{formatVND(steps.thuNhapThueHieuDung)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>- Tổng chi phí</span>
                      <span>-{formatVND(steps.tongChiPhiVanHanh)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>- Thuế</span>
                      <span>-{formatVND(steps.thueChoThue_Thang)}</span>
                    </div>
                    <Separator />
                    <div className={`flex justify-between font-semibold ${steps.dongTienRongBDS >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>Dòng tiền ròng</span>
                      <span>{formatVND(steps.dongTienRongBDS)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">4</Badge>
                    <span className="font-semibold">Dòng tiền cá nhân</span>
                  </div>
                  <div className="ml-8 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Thu nhập cá nhân</span>
                      <span>{formatVND(inputs.thuNhapKhac)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>- Chi phí sinh hoạt</span>
                      <span>-{formatVND(inputs.chiPhiSinhHoat)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+ Dòng tiền BĐS</span>
                      <span className={steps.dongTienRongBDS >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {steps.dongTienRongBDS >= 0 ? '+' : ''}{formatVND(steps.dongTienRongBDS)}
                      </span>
                    </div>
                    <Separator />
                    <div className={`flex justify-between font-semibold ${steps.dongTienCuoiCung >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>Dòng tiền cuối cùng</span>
                      <span>{formatVND(steps.dongTienCuoiCung)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thông tin khoản vay */}
            <Card>
              <CardHeader>
                <CardTitle>Chi Tiết Khoản Vay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Số tiền vay</p>
                    <p className="font-semibold text-blue-600">{formatVND(steps.soTienVay)}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Vốn tự có</p>
                    <p className="font-semibold text-green-600">{formatVND(steps.vonTuCo)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Giai đoạn ưu đãi</span>
                      <span className="text-sm font-semibold">{inputs.thoiGianUuDai} tháng</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Lãi suất {formatPercent(inputs.laiSuatUuDai)}</span>
                      <span>Trả {formatVND(steps.tienTraNHThang)}/tháng</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Giai đoạn thả nổi</span>
                      <span className="text-sm font-semibold">{(inputs.thoiGianVay * 12) - inputs.thoiGianUuDai} tháng</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Lãi suất {formatPercent(inputs.laiSuatThaNoi)}</span>
                      <span>Trả ~{formatVND(steps.tienTraNHThang * 1.5)}/tháng</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Lưu ý:</strong> Khoản thanh toán sẽ tăng đáng kể sau giai đoạn ưu đãi. 
                    Hãy chuẩn bị tài chính cho giai đoạn này.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Charts */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dòng tiền theo thời gian */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dòng Tiền Theo Thời Gian
                </CardTitle>
                <CardDescription>Dự báo dòng tiền 5 năm đầu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashFlowOverTime.slice(0, 60)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        tickFormatter={(value) => `Năm ${value}`}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatVND(value).replace('₫', '')}
                      />
                      <Tooltip 
                        formatter={(value, name) => [formatVND(value as number), name]}
                        labelFormatter={(value) => `Năm ${value}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cashFlow" 
                        stroke={CHART_COLORS.primary} 
                        strokeWidth={2}
                        name="Dòng tiền hàng tháng"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeCashFlow" 
                        stroke={CHART_COLORS.secondary} 
                        strokeWidth={2}
                        name="Dòng tiền tích lũy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Phân bổ chi phí */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Phân Bổ Chi Phí Hàng Tháng
                </CardTitle>
                <CardDescription>Tỷ lệ các khoản chi phí</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthlyExpenseBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {monthlyExpenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatVND(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Cơ cấu vốn đầu tư */}
            <Card>
              <CardHeader>
                <CardTitle>Cơ Cấu Vốn Đầu Tư Ban Đầu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={initialInvestmentBreakdown} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number"
                        tickFormatter={(value) => formatVND(value).replace('₫', '')}
                      />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => formatVND(value as number)} />
                      <Bar dataKey="value" fill={CHART_COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Benchmarking */}
            <Card>
              <CardHeader>
                <CardTitle>So Sánh Với Thị Trường</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tỷ suất cho thuê của bạn</span>
                    <span className="font-semibold">{formatPercent((inputs.tienThueThang * 12 * inputs.tyLeLapDay / 100) / inputs.giaTriBDS * 100)}</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (inputs.tienThueThang * 12 * inputs.tyLeLapDay / 100) / inputs.giaTriBDS * 100 * 10)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Thấp (&lt;4%)</span>
                    <span>Tốt (6-8%)</span>
                    <span>Cao (&gt;10%)</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ROI của bạn</span>
                    <span className="font-semibold">{formatPercent(result.roiHangNam)}</span>
                  </div>
                  <Progress 
                    value={Math.min(100, Math.max(0, result.roiHangNam * 5))} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Thấp (&lt;5%)</span>
                    <span>Khá (8-12%)</span>
                    <span>Tốt (&gt;15%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 4: Analysis & Suggestions */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cảnh báo */}
            {warnings.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Các Cảnh Báo Quan Trọng
                  </CardTitle>
                  <CardDescription>
                    Những vấn đề cần lưu ý trong kịch bản đầu tư này
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{warning}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Gợi ý */}
            {suggestions.length > 0 && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Lightbulb className="h-5 w-5" />
                    Gợi Ý Cải Thiện
                  </CardTitle>
                  <CardDescription>
                    Những điều chỉnh có thể làm cho đầu tư hiệu quả hơn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">{suggestion}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Kết luận tổng thể */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Đánh Giá Tổng Thể</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.dongTienRongBDS > 0 ? (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Kịch bản khả quan</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Bất động sản này tạo ra dòng tiền dương {formatVND(steps.dongTienRongBDS)}/tháng, 
                        với ROI {formatPercent(result.roiHangNam)} và thời gian hoàn vốn khoảng {result.paybackPeriod.toFixed(1)} năm.
                        Đây là một khoản đầu tư có tiềm năng tốt.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-red-800">Kịch bản có rủi ro</span>
                      </div>
                      <p className="text-sm text-red-700">
                        Bất động sản này tạo ra dòng tiền âm {formatVND(Math.abs(steps.dongTienRongBDS))}/tháng. 
                        Bạn cần hỗ trợ thêm tiền hàng tháng để duy trì khoản đầu tư này. 
                        Cân nhắc kỹ các gợi ý cải thiện trước khi quyết định.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Mức độ rủi ro</p>
                      <p className={`font-semibold ${
                        inputs.tyLeVay < 70 && steps.dongTienCuoiCung > 0 ? 'text-green-600' : 
                        inputs.tyLeVay < 80 && steps.dongTienCuoiCung >= 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {inputs.tyLeVay < 70 && steps.dongTienCuoiCung > 0 ? 'Thấp' : 
                         inputs.tyLeVay < 80 && steps.dongTienCuoiCung >= 0 ? 'Trung bình' : 'Cao'}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Khuyến nghị</p>
                      <p className={`font-semibold ${
                        result.roiHangNam > 10 ? 'text-green-600' : 
                        result.roiHangNam > 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {result.roiHangNam > 10 ? 'Nên đầu tư' : 
                         result.roiHangNam > 5 ? 'Cân nhắc' : 'Không nên'}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Mức ưu tiên</p>
                      <p className={`font-semibold ${
                        steps.dongTienRongBDS > 2000000 ? 'text-green-600' : 
                        steps.dongTienRongBDS > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {steps.dongTienRongBDS > 2000000 ? 'Cao' : 
                         steps.dongTienRongBDS > 0 ? 'Trung bình' : 'Thấp'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}