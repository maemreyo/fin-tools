// UPDATED: 2025-01-10 - Added comprehensive sale scenario visualization

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Star,
  Crown,
  Rocket,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  Clock,
  Building,
  Banknote,
  Percent,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Lightbulb,
  Zap,
  Shield,
  Eye,
} from "lucide-react";

import { CalculationResultWithSale } from "@/types/sale-scenario";
import { formatVND, formatPercent } from "@/lib/financial-utils";

// ===== PROPS INTERFACE =====
interface SaleScenarioAnalysisProps {
  result: CalculationResultWithSale;
  className?: string;
}

// ===== CHART COLORS =====
const CHART_COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  orange: "#f97316",
  neutral: "#6b7280",
  background: "#f8fafc",
};

// ===== MAIN COMPONENT =====
export default function SaleScenarioAnalysis({
  result,
  className = "",
}: SaleScenarioAnalysisProps) {
  
  const [selectedTab, setSelectedTab] = useState("overview");
  
  const saleAnalysis = result.saleAnalysis;
  
  if (!saleAnalysis) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Bật &quot;Phân tích kịch bản bán&quot; trong form để xem phân tích chi tiết.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* ===== SUMMARY CARDS ===== */}
      <SaleAnalysisSummary 
        saleAnalysis={saleAnalysis} 
        baseResult={result}
      />

      {/* ===== DETAILED ANALYSIS TABS ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Phân Tích Chi Tiết Sale Scenario
          </CardTitle>
          <CardDescription>
            Khám phá các khía cạnh khác nhau của kịch bản bán bất động sản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="comparison">So sánh</TabsTrigger>
              <TabsTrigger value="recommendations">Khuyến nghị</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <SaleOverviewTab saleAnalysis={saleAnalysis} />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6 mt-6">
              <SaleTimelineTab saleAnalysis={saleAnalysis} />
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6 mt-6">
              <SaleComparisonTab saleAnalysis={saleAnalysis} baseResult={result} />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6 mt-6">
              <SaleRecommendationsTab saleAnalysis={saleAnalysis} />
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
}

// ===== SUMMARY CARDS COMPONENT =====
function SaleAnalysisSummary({ 
  saleAnalysis, 
  baseResult 
}: { 
  saleAnalysis: any, 
  baseResult: CalculationResultWithSale 
}) {
  
  const holdingYears = (saleAnalysis.holdingPeriodInputs.holdingPeriodMonths / 12).toFixed(1);
  const totalReturnPercent = ((saleAnalysis.totalReturn / (baseResult.steps.tongVonBanDau || 1)) * 100);
  
  const summaryCards = [
    {
      title: "Tổng ROI khi bán",
      value: `${saleAnalysis.totalROIOnSale.toFixed(1)}%`,
      subtitle: `Sau ${holdingYears} năm`,
      icon: <Target className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: saleAnalysis.totalROIOnSale > (baseResult.roiHangNam || 0) ? "up" : "down",
    },
    {
      title: "Lợi nhuận tổng",
      value: formatVND(saleAnalysis.totalReturn),
      subtitle: "Bao gồm dòng tiền + lãi tăng giá",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: saleAnalysis.totalReturn > 0 ? "up" : "down",
    },
    {
      title: "Giá trị tăng thêm",
      value: formatVND(saleAnalysis.projectedPropertyValue - (baseResult.inputs.giaTriBDS || 0)),
      subtitle: `Từ tăng giá ${saleAnalysis.holdingPeriodInputs.propertyAppreciationRate}%/năm`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "up",
    },
    {
      title: "Thời điểm bán tối ưu",
      value: `Năm ${saleAnalysis.optimalSaleTiming.bestYear}`,
      subtitle: `ROI: ${saleAnalysis.optimalSaleTiming.bestROI.toFixed(1)}%`,
      icon: <Clock className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "neutral",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg bg-white/50 ${card.color}`}>
                {card.icon}
              </div>
            </div>
            {card.trend !== "neutral" && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {card.trend === "up" ? (
                  <ArrowUp className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                )}
                <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {card.trend === "up" ? "Tích cực" : "Cần lưu ý"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ===== OVERVIEW TAB =====
function SaleOverviewTab({ saleAnalysis }: { saleAnalysis: any }) {
  
  // Prepare breakdown data
  const breakdownData = [
    {
      category: "Vốn đầu tư ban đầu",
      amount: -Math.abs(saleAnalysis.baseScenario.steps.tongVonBanDau || 0),
      type: "expense",
      color: CHART_COLORS.danger,
    },
    {
      category: "Dòng tiền tích lũy",
      amount: saleAnalysis.totalCashFlowReceived,
      type: "income",
      color: CHART_COLORS.success,
    },
    {
      category: "Lãi từ bán",
      amount: saleAnalysis.netSaleProceeds - (saleAnalysis.baseScenario.inputs.giaTriBDS || 0),
      type: "income",
      color: CHART_COLORS.primary,
    },
    {
      category: "Chi phí bán",
      amount: -saleAnalysis.totalSellingCosts,
      type: "expense",
      color: CHART_COLORS.warning,
    },
  ];

  const netAmount = breakdownData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Financial Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Phân Tích Dòng Tiền
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Bar Chart */}
            <div className="space-y-4">
              <h4 className="font-medium">Các khoản thu chi</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={breakdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    formatter={(value: any) => [formatVND(value), "Số tiền"]}
                    labelStyle={{ fontSize: "12px" }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="color"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h4 className="font-medium">Tóm tắt tài chính</h4>
              <div className="space-y-3">
                {breakdownData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.category}</span>
                    </div>
                    <span className={`font-medium ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatVND(item.amount)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 font-medium">
                  <span>Lợi nhuận ròng</span>
                  <span className={netAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatVND(netAmount)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Percent className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {saleAnalysis.annualizedROI.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">ROI hàng năm</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Building className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatVND(saleAnalysis.projectedPropertyValue)}
            </p>
            <p className="text-sm text-gray-600">Giá trị dự kiến</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Banknote className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatVND(saleAnalysis.remainingLoanBalance)}
            </p>
            <p className="text-sm text-gray-600">Nợ còn lại</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// ===== TIMELINE TAB =====
function SaleTimelineTab({ saleAnalysis }: { saleAnalysis: any }) {
  
  const timelineData = saleAnalysis.breakdownByYear.map((year: any) => ({
    year: year.year,
    propertyValue: year.propertyValue / 1000000, // Convert to millions
    equity: year.accumulatedEquity / 1000000,
    cashFlow: year.cumulativeCashFlow / 1000000,
    roi: year.roiIfSoldNow,
    loanBalance: year.remainingLoanBalance / 1000000,
  }));

  return (
    <div className="space-y-6">
      
      {/* Property Value & Equity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Tăng trưởng giá trị theo thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Năm', position: 'bottom' }} />
              <YAxis 
                label={{ value: 'Triệu VND', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `${value.toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `${value.toFixed(1)}M VND`, 
                  name === 'propertyValue' ? 'Giá trị BĐS' :
                  name === 'equity' ? 'Vốn chủ sở hữu' :
                  name === 'loanBalance' ? 'Nợ còn lại' : name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="propertyValue" 
                fill={CHART_COLORS.primary}
                stroke={CHART_COLORS.primary}
                fillOpacity={0.3}
              />
              <Line 
                type="monotone" 
                dataKey="equity" 
                stroke={CHART_COLORS.success}
                strokeWidth={3}
              />
              <Line 
                type="monotone" 
                dataKey="loanBalance" 
                stroke={CHART_COLORS.danger}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROI Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>ROI nếu bán theo từng năm</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
              <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, "ROI"]} />
              <Line 
                type="monotone" 
                dataKey="roi" 
                stroke={CHART_COLORS.purple}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.purple, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}

// ===== COMPARISON TAB =====
function SaleComparisonTab({ 
  saleAnalysis, 
  baseResult 
}: { 
  saleAnalysis: any, 
  baseResult: CalculationResultWithSale 
}) {
  
  const annualROI = baseResult.roiHangNam || 0;
  const saleROI = saleAnalysis.totalROIOnSale;
  const cashFlowReturn = saleAnalysis.totalCashFlowReceived;
  const appreciationReturn = saleAnalysis.netSaleProceeds - (baseResult.inputs.giaTriBDS || 0);

  const comparisonData = [
    {
      strategy: "Cho thuê dài hạn",
      roi: annualROI,
      pros: ["Dòng tiền ổn định", "Không có chi phí giao dịch", "Linh hoạt thời gian"],
      cons: ["ROI có thể thấp hơn", "Phụ thuộc vào thị trường thuê", "Quản lý vận hành"],
      color: CHART_COLORS.success,
    },
    {
      strategy: `Bán sau ${(saleAnalysis.holdingPeriodInputs.holdingPeriodMonths / 12).toFixed(1)} năm`,
      roi: saleROI,
      pros: ["Có thể có ROI cao hơn", "Thoái vốn hoàn toàn", "Tránh rủi ro dài hạn"],
      cons: ["Chi phí giao dịch", "Rủi ro thị trường", "Mất dòng tiền định kỳ"],
      color: CHART_COLORS.primary,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Strategy Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {comparisonData.map((strategy, index) => (
          <Card key={index} className={`border-2 ${strategy.roi === Math.max(...comparisonData.map(s => s.roi)) ? 'border-green-300 bg-green-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{strategy.strategy}</span>
                {strategy.roi === Math.max(...comparisonData.map(s => s.roi)) && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Crown className="h-3 w-3 mr-1" />
                    Tốt nhất
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                ROI: <span className="font-bold text-2xl" style={{ color: strategy.color }}>
                  {strategy.roi.toFixed(1)}%
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Ưu điểm</h4>
                  <ul className="space-y-1">
                    {strategy.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-orange-600 mb-2">Nhược điểm</h4>
                  <ul className="space-y-1">
                    {strategy.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Return Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Phân tích nguồn lợi nhuận</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            
            {/* Cash Flow vs Appreciation */}
            <div className="space-y-4">
              <h4 className="font-medium">Cơ cấu lợi nhuận khi bán</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Dòng tiền", value: Math.max(0, cashFlowReturn), fill: CHART_COLORS.success },
                      { name: "Tăng giá", value: Math.max(0, appreciationReturn), fill: CHART_COLORS.primary },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip formatter={(value: any) => formatVND(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics Summary */}
            <div className="space-y-4">
              <h4 className="font-medium">So sánh chỉ số</h4>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>Lợi nhuận từ dòng tiền</span>
                  <span className="font-medium">{formatVND(cashFlowReturn)}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>Lợi nhuận từ tăng giá</span>
                  <span className="font-medium">{formatVND(appreciationReturn)}</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-50 rounded font-medium">
                  <span>Tổng lợi nhuận</span>
                  <span>{formatVND(saleAnalysis.totalReturn)}</span>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

    </div>
  );
}

// ===== RECOMMENDATIONS TAB =====
function SaleRecommendationsTab({ saleAnalysis }: { saleAnalysis: any }) {
  
  const recommendations = [
    {
      type: "timing",
      title: "Thời điểm bán tối ưu",
      content: saleAnalysis.optimalSaleTiming.reasoning,
      icon: <Clock className="h-5 w-5" />,
      priority: "high",
    },
    {
      type: "strategy",
      title: "Chiến lược đầu tư",
      content: saleAnalysis.totalROIOnSale > 15 
        ? "ROI cao, chiến lược hiệu quả. Có thể áp dụng cho các BĐS tương tự."
        : "ROI trung bình. Xem xét tối ưu hóa các yếu tố như tăng giá thuê hoặc giảm chi phí.",
      icon: <Target className="h-5 w-5" />,
      priority: "medium",
    },
    {
      type: "risk",
      title: "Quản lý rủi ro",
      content: saleAnalysis.holdingPeriodInputs.holdingPeriodMonths > 120
        ? "Nắm giữ dài hạn: Theo dõi thay đổi thị trường và có kế hoạch exit linh hoạt."
        : "Nắm giữ ngắn hạn: Chú ý biến động thị trường có thể ảnh hưởng đến giá bán.",
      icon: <Shield className="h-5 w-5" />,
      priority: "medium",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Key Recommendations */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <Card key={index} className={`${rec.priority === 'high' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${rec.priority === 'high' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                  {rec.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-600">{rec.content}</p>
                  {rec.priority === 'high' && (
                    <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700">
                      <Star className="h-3 w-3 mr-1" />
                      Khuyến nghị quan trọng
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Các bước tiếp theo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Theo dõi thị trường</p>
                <p className="text-sm text-gray-600">
                  Cập nhật giá BĐS và xu hướng cho thuê trong khu vực định kỳ
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Tối ưu hóa dòng tiền</p>
                <p className="text-sm text-gray-600">
                  Xem xét tăng giá thuê hợp lý và giảm chi phí vận hành
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Chuẩn bị exit strategy</p>
                <p className="text-sm text-gray-600">
                  Lập kế hoạch bán chi tiết và các phương án dự phòng
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}