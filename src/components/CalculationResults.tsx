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
  Brain,
  Target,
  Shield,
  Zap,
  Eye,
  RefreshCw,
} from 'lucide-react';

import { CalculationResult } from '@/types/real-estate';
import { formatVND, formatPercent } from '@/lib/financial-utils';
import AIAdvisorySystem from './AIAdvisorySystem';

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
  const [activeTab, setActiveTab] = React.useState("overview");

  // Quick summary metrics
  const summaryMetrics = React.useMemo(() => {
    const isPositiveCashFlow = steps.dongTienRongBDS > 0;
    const roiLevel = result.roiHangNam > 15 ? "Xuất sắc" : 
                   result.roiHangNam > 10 ? "Tốt" :
                   result.roiHangNam > 5 ? "Trung bình" : "Thấp";
    const riskLevel = inputs.tyLeVay > 80 ? "Cao" : 
                     inputs.tyLeVay > 70 ? "Trung bình" : "Thấp";
    
    return {
      isPositiveCashFlow,
      roiLevel,
      riskLevel,
      monthlyImpact: steps.dongTienRongBDS,
      yearlyReturn: steps.dongTienRongBDS * 12,
      paybackMonths: steps.tongVonBanDau > 0 && steps.dongTienRongBDS > 0 ? 
        Math.ceil(steps.tongVonBanDau / steps.dongTienRongBDS) : -1
    };
  }, [steps, inputs, result]);

  // Tính toán dữ liệu cho charts
  const cashFlowOverTime = React.useMemo(() => {
    const months = 60; // 5 năm
    const data = [];
    
    for (let month = 1; month <= months; month++) {
      const year = Math.ceil(month / 12);
      const isPreferentialPeriod = month <= inputs.thoiGianUuDai;
      
      // Simplified projection - trong thực tế sẽ phức tạp hơn
      let currentCashFlow = steps.dongTienRongBDS;
      
      // Adjust for interest rate change after preferential period
      if (!isPreferentialPeriod) {
        const rateDiff = (inputs.laiSuatThaNoi - inputs.laiSuatUuDai) / 100 / 12;
        const additionalPayment = (inputs.giaTriBDS * inputs.tyLeVay / 100) * rateDiff;
        currentCashFlow -= additionalPayment;
      }
      
      data.push({
        month,
        year,
        cashFlow: currentCashFlow,
        cumulativeCashFlow: currentCashFlow * month - steps.tongVonBanDau,
        period: isPreferentialPeriod ? "Ưu đãi" : "Thả nổi",
        netWorth: (currentCashFlow * month - steps.tongVonBanDau) + inputs.giaTriBDS,
      });
    }
    
    return data;
  }, [inputs, steps]);

  // Breakdown chart data
  const expenseBreakdown = React.useMemo(() => {
    const tienTraNH = steps.tienTraNHThang || 0;
    const phiQuanLy = inputs.phiQuanLy || 0;
    const phiBaoTri = steps.chiPhiBaoTriThang || 0;
    const baoHiem = steps.baoHiemTaiSanThang || 0;
    const thue = steps.thueChoThue_Thang || 0;
    
    return [
      { name: 'Trả ngân hàng', value: tienTraNH, color: CHART_COLORS.negative },
      { name: 'Phí quản lý', value: phiQuanLy, color: CHART_COLORS.warning },
      { name: 'Bảo trì', value: phiBaoTri, color: CHART_COLORS.secondary },
      { name: 'Bảo hiểm', value: baoHiem, color: CHART_COLORS.neutral },
      { name: 'Thuế', value: thue, color: CHART_COLORS.primary },
    ].filter(item => item.value > 0);
  }, [inputs, steps]);

  return (
    <div className="space-y-6">
      {/* ENHANCED Header với quick insights */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calculator className="h-6 w-6 text-primary" />
                Kết Quả Phân Tích
              </CardTitle>
              <CardDescription className="text-base">
                {result.scenarioName || "Phân tích đầu tư bất động sản"}
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
                <Button variant="outline" onClick={onNewCalculation}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tính toán mới
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-2">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Dòng tiền/tháng</div>
                  <div className={`text-2xl font-bold ${
                    summaryMetrics.isPositiveCashFlow ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatVND(summaryMetrics.monthlyImpact)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {summaryMetrics.isPositiveCashFlow ? 'Thu thêm' : 'Chi thêm'} hàng tháng
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-2">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">ROI năm</div>
                  <div className={`text-2xl font-bold ${
                    result.roiHangNam > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.roiHangNam.toFixed(1)}%
                  </div>
                  <Badge variant={
                    result.roiHangNam > 10 ? "default" : 
                    result.roiHangNam > 5 ? "secondary" : "destructive"
                  } className="text-xs">
                    {summaryMetrics.roiLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-2">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Hoàn vốn</div>
                  <div className="text-xl font-bold text-blue-600">
                    {summaryMetrics.paybackMonths > 0 ? 
                      `${Math.floor(summaryMetrics.paybackMonths / 12)}Y ${summaryMetrics.paybackMonths % 12}M` : 
                      "∞"
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {summaryMetrics.paybackMonths > 0 ? 'Thời gian hoàn vốn' : 'Không hoàn vốn'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-2">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Mức rủi ro</div>
                  <div className="text-xl font-bold text-orange-600">
                    {summaryMetrics.riskLevel}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Vay {inputs.tyLeVay.toFixed(0)}% giá trị
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Status Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={summaryMetrics.isPositiveCashFlow ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {summaryMetrics.isPositiveCashFlow ? 
                <CheckCircle className="h-3 w-3" /> : 
                <XCircle className="h-3 w-3" />
              }
              {summaryMetrics.isPositiveCashFlow ? 'Dòng tiền dương' : 'Dòng tiền âm'}
            </Badge>
            
            <Badge variant={result.rentalYield > 5 ? "default" : "secondary"}>
              Yield: {result.rentalYield?.toFixed(2)}%
            </Badge>
            
            <Badge variant={inputs.tyLeVay <= 70 ? "default" : "destructive"}>
              LTV: {inputs.tyLeVay.toFixed(0)}%
            </Badge>

            {warnings.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {warnings.length} cảnh báo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ENHANCED Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Phân tích
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dòng tiền
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Chi tiết
          </TabsTrigger>
          <TabsTrigger value="projections" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dự báo
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Investment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng Quan Đầu Tư</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Giá trị bất động sản:</span>
                    <span className="font-semibold">{formatVND(inputs.giaTriBDS)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vốn tự có:</span>
                    <span className="font-semibold text-green-600">{formatVND(steps.vonTuCo || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số tiền vay:</span>
                    <span className="font-semibold text-orange-600">{formatVND(steps.soTienVay || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng vốn ban đầu:</span>
                    <span className="font-semibold text-blue-600">{formatVND(steps.tongVonBanDau)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Thu nhập thuê/tháng:</span>
                    <span className="font-semibold text-green-600">{formatVND(steps.thuNhapThueHieuDung)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chi phí vận hành/tháng:</span>
                    <span className="font-semibold text-red-600">{formatVND(steps.tongChiPhiVanHanh)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Dòng tiền ròng/tháng:</span>
                    <span className={summaryMetrics.isPositiveCashFlow ? 'text-green-600' : 'text-red-600'}>
                      {formatVND(steps.dongTienRongBDS)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Chỉ Số Hiệu Quả</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>ROI hàng năm:</span>
                      <span className="font-semibold">{formatPercent(result.roiHangNam)}</span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, result.roiHangNam * 5))} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Rental Yield:</span>
                      <span className="font-semibold">{formatPercent(result.rentalYield || 0)}</span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, (result.rentalYield || 0) * 10))} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Tỷ lệ vay:</span>
                      <span className="font-semibold">{formatPercent(inputs.tyLeVay)}</span>
                    </div>
                    <Progress 
                      value={inputs.tyLeVay} 
                      className="h-2" 
                    />
                  </div>

                  <Separator />

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Lợi nhuận dự kiến/năm</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {formatVND(summaryMetrics.yearlyReturn)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warnings & Suggestions */}
          {(warnings.length > 0 || suggestions.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {warnings.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Cảnh Báo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {warnings.slice(0, 3).map((warning, index) => (
                        <p key={index} className="text-sm text-red-700 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          {warning}
                        </p>
                      ))}
                      {warnings.length > 3 && (
                        <p className="text-xs text-red-600">+{warnings.length - 3} cảnh báo khác...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {suggestions.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Gợi Ý Tối Ưu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {suggestions.slice(0, 3).map((suggestion, index) => (
                        <p key={index} className="text-sm text-blue-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          {suggestion}
                        </p>
                      ))}
                      {suggestions.length > 3 && (
                        <p className="text-xs text-blue-600">+{suggestions.length - 3} gợi ý khác...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* AI Analysis Tab - NEW FEATURE */}
        <TabsContent value="ai-analysis" className="space-y-6">
          <AIAdvisorySystem 
            result={result}
            onScenarioGenerated={(scenarios) => {
              console.log("Generated scenarios:", scenarios);
              // Handle scenario generation callback if needed
            }}
          />
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dòng Tiền Theo Thời Gian</CardTitle>
              <CardDescription>
                Dự báo dòng tiền và tích lũy trong 5 năm tới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowOverTime.filter((_, index) => index % 3 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatVND(Number(value)), 
                        name === 'cashFlow' ? 'Dòng tiền/tháng' : 'Tích lũy'
                      ]}
                      labelFormatter={(year) => `Năm ${year}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cashFlow" 
                      stroke={CHART_COLORS.primary} 
                      strokeWidth={2}
                      name="Dòng tiền"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeCashFlow" 
                      stroke={CHART_COLORS.secondary} 
                      strokeWidth={2}
                      name="Tích lũy"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Phân Bổ Chi Phí Hàng Tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatVND(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chi Tiết Chi Phí</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{formatVND(item.value)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-bold">
                    <span>Tổng chi phí:</span>
                    <span className="text-red-600">{formatVND(steps.tongChiPhiVanHanh)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dự Báo Tài Sản Ròng</CardTitle>
              <CardDescription>
                Giá trị tài sản ròng theo thời gian (bao gồm tăng giá BĐS)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowOverTime.filter((_, index) => index % 6 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${(value/1000000000).toFixed(1)}B`} />
                    <Tooltip 
                      formatter={(value) => [formatVND(Number(value)), 'Tài sản ròng']}
                      labelFormatter={(year) => `Năm ${year}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netWorth" 
                      stroke={CHART_COLORS.positive} 
                      strokeWidth={3}
                      name="Tài sản ròng"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                * Dự báo giả định giá BĐS không đổi. Trong thực tế có thể tăng/giảm theo thị trường.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}