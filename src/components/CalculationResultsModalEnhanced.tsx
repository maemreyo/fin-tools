// Enhanced version with Sale Analysis support

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "recharts";
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
  X,
  FileText,
  Share2,
  Copy,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";

import { CalculationResult } from "@/types/real-estate";
import { CalculationResultWithSale } from "@/types/sale-scenario";
import { formatVND, formatPercent } from "@/lib/financial-utils";
import { toast } from "sonner";

// Import the Sale Analysis component
import SaleScenarioAnalysis from "@/components/SaleScenarioAnalysis";

// Enhanced interface to support both regular and sale analysis results
interface EnhancedCalculationResultsModalProps {
  result: CalculationResult | CalculationResultWithSale | null;
  isOpen: boolean;
  onClose: () => void;
  onNewCalculation?: () => void;
}

// Color scheme cho charts
const CHART_COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#6b7280",
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  warning: "#f59e0b",
};

const PIE_COLORS = [
  "#3b82f6",
  "#22c55e", 
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function EnhancedCalculationResultsModal({
  result,
  isOpen,
  onClose,
  onNewCalculation,
}: EnhancedCalculationResultsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Check if this result has sale analysis
  const hasSaleAnalysis = result && 'saleAnalysis' in result && result.saleAnalysis;

  // Safely get inputs and steps, providing defaults if result is null
  const { inputs, steps, warnings, suggestions } = React.useMemo(() => {
    const inputs = result?.inputs || ({} as any);
    const steps = result?.steps || ({} as any);
    const warnings = result?.warnings || [];
    const suggestions = result?.suggestions || [];
    return { inputs, steps, warnings, suggestions };
  }, [result]);

  // Quick summary metrics
  const summaryMetrics = React.useMemo(() => {
    const isPositiveCashFlow = (steps.dongTienRongBDS || 0) > 0;
    const roiHangNam = result?.roiHangNam || 0;
    const roiLevel =
      roiHangNam > 15
        ? "Xuất sắc"
        : roiHangNam > 10
        ? "Tốt"
        : roiHangNam > 5
        ? "Trung bình"
        : "Thấp";
    const riskLevel =
      (inputs.tyLeVay || 0) > 80 ? "Cao" : (inputs.tyLeVay || 0) > 70 ? "Trung bình" : "Thấp";

    const monthlyImpact = steps.dongTienRongBDS || 0;
    const yearlyReturn = monthlyImpact * 12;
    const paybackMonths =
      (steps.tongVonBanDau || 0) > 0 && monthlyImpact > 0
        ? Math.ceil((steps.tongVonBanDau || 0) / monthlyImpact)
        : -1;

    return {
      isPositiveCashFlow,
      roiLevel,
      riskLevel,
      monthlyImpact,
      yearlyReturn,
      paybackMonths,
    };
  }, [result, steps, inputs]);

  // Investment breakdown data cho charts
  const investmentBreakdown = React.useMemo(() => {
    return [
      { name: "Vốn tự có", value: steps.vonTuCo || 0, color: CHART_COLORS.primary },
      { name: "Chi phí trang bị", value: inputs.chiPhiTrangBi || 0, color: CHART_COLORS.secondary },
      { name: "Chi phí mua", value: (inputs.giaTriBDS || 0) * ((inputs.chiPhiMua || 0) / 100), color: CHART_COLORS.warning },
      { name: "Bảo hiểm vay", value: (steps.soTienVay || 0) * ((inputs.baoHiemKhoanVay || 0) / 100), color: CHART_COLORS.neutral },
    ].filter(item => item.value > 0);
  }, [inputs, steps]);

  // Monthly cash flow projection
  const cashFlowData = React.useMemo(() => {
    const data = [];
    const monthlyFlow = steps.dongTienRongBDS || 0;
    for (let i = 1; i <= 12; i++) {
      data.push({
        month: `T${i}`,
        cashFlow: monthlyFlow,
        cumulative: monthlyFlow * i,
      });
    }
    return data;
  }, [steps]);

  if (!result) return null;

  // Handle export functionality
  const handleExport = (format: 'pdf' | 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(result, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `real-estate-calculation-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất file JSON");
    } else {
      toast.info("Chức năng xuất PDF đang phát triển");
    }
  };

  // Handle copy results
  const handleCopyResults = () => {
    const summary = `
📊 KẾT QUẢ TÍNH TOÁN BẤT ĐỘNG SẢN

💰 Tổng đầu tư: ${formatVND(steps.tongVonBanDau || 0)}
💸 Dòng tiền hàng tháng: ${formatVND(steps.dongTienRongBDS || 0)}
📈 ROI hàng năm: ${(result.roiHangNam || 0).toFixed(1)}%
⏰ Thời gian hoàn vốn: ${summaryMetrics.paybackMonths > 0 ? `${Math.floor(summaryMetrics.paybackMonths / 12)}Y ${summaryMetrics.paybackMonths % 12}M` : 'Không xác định'}

${warnings.length > 0 ? `⚠️ CẢNH BÁO:\n${warnings.join('\n')}` : ''}
${suggestions.length > 0 ? `💡 GỢI Ý:\n${suggestions.slice(0, 3).join('\n')}` : ''}

${hasSaleAnalysis ? '🎯 Bao gồm Sale Analysis chi tiết' : ''}
`;

    navigator.clipboard.writeText(summary);
    toast.success("Đã copy kết quả vào clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full max-h-[98vh] w-[98vw]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Calculator className="h-6 w-6 text-blue-600" />
            Kết Quả Phân Tích Đầu Tư
            {hasSaleAnalysis && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                Sale Analysis
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Phân tích chi tiết khả năng đầu tư bất động sản
            {hasSaleAnalysis && " với kịch bản bán tối ưu"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-200px)]">
          {/* Quick Summary Cards */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-sm text-green-600 mb-1">ROI Hàng Năm</div>
                    <div className="text-2xl font-bold text-green-600">
                      {(result.roiHangNam || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {summaryMetrics.roiLevel}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-sm text-blue-600 mb-1">Dòng tiền/tháng</div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatVND(steps.dongTienRongBDS || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {summaryMetrics.isPositiveCashFlow ? "Dương" : "Âm"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-sm text-purple-600 mb-1">Hoàn vốn</div>
                    <div className="text-lg font-bold text-purple-600">
                      {summaryMetrics.paybackMonths > 0
                        ? `${Math.floor(summaryMetrics.paybackMonths / 12)}Y ${summaryMetrics.paybackMonths % 12}M`
                        : "∞"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {summaryMetrics.paybackMonths > 0 ? "Ước tính" : "Không xác định"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-sm text-orange-600 mb-1">Tổng đầu tư</div>
                    <div className="text-lg font-bold text-orange-600">
                      {formatVND(steps.tongVonBanDau || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vốn ban đầu cần có
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className={`grid w-full ${hasSaleAnalysis ? 'grid-cols-5' : 'grid-cols-4'}`}>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value="breakdown" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Chi tiết
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  Biểu đồ
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Phân tích
                </TabsTrigger>
                {/* NEW SALE ANALYSIS TAB */}
                {hasSaleAnalysis && (
                  <TabsTrigger value="sale-analysis" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Sale Analysis
                    <Badge variant="secondary" className="ml-1 text-xs">New</Badge>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Investment Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Thông Tin Đầu Tư
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Giá trị BĐS:</div>
                          <div className="font-semibold">{formatVND(inputs.giaTriBDS || 0)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Vốn tự có:</div>
                          <div className="font-semibold">{formatVND(steps.vonTuCo || 0)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Số tiền vay:</div>
                          <div className="font-semibold">{formatVND(steps.soTienVay || 0)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Tỷ lệ vay:</div>
                          <div className="font-semibold">{((inputs.tyLeVay || 0)).toFixed(1)}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cash Flow Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Dòng Tiền Tháng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          <span className={
                            (steps.dongTienRongBDS || 0) >= 0 ? "text-green-600" : "text-red-600"
                          }>
                            {formatVND(steps.dongTienRongBDS || 0)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(100, Math.max(0, ((steps.dongTienRongBDS || 0) / 10000000) * 100))} 
                          className="mb-2"
                        />
                        <p className="text-sm text-muted-foreground">
                          {summaryMetrics.isPositiveCashFlow ? "Dòng tiền dương" : "Dòng tiền âm"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Breakdown Tab */}
              <TabsContent value="breakdown" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Chi Tiết Các Bước Tính Toán</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Step 1 */}
                        <div>
                          <h4 className="font-semibold mb-2">Bước 1: Vốn đầu tư ban đầu</h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Vốn tự có:</span>
                              <span>{formatVND(steps.vonTuCo || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Chi phí trang bị:</span>
                              <span>{formatVND(inputs.chiPhiTrangBi || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Chi phí mua ({formatPercent(inputs.chiPhiMua || 0)}):</span>
                              <span>{formatVND((inputs.giaTriBDS || 0) * ((inputs.chiPhiMua || 0) / 100))}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Tổng vốn ban đầu:</span>
                              <span>{formatVND(steps.tongVonBanDau || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div>
                          <h4 className="font-semibold mb-2">Bước 2: Chi phí vận hành hàng tháng</h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Trả nợ NH/tháng:</span>
                              <span>{formatVND(steps.tienTraNHThang || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Phí quản lý:</span>
                              <span>{formatVND(inputs.phiQuanLy || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Chi phí bảo trì:</span>
                              <span>{formatVND(steps.chiPhiBaoTriThang || 0)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Tổng chi phí vận hành:</span>
                              <span>{formatVND(steps.tongChiPhiVanHanh || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div>
                          <h4 className="font-semibold mb-2">Bước 3: Dòng tiền ròng</h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Thu nhập thuê hiệu dụng:</span>
                              <span>{formatVND(steps.thuNhapThueHieuDung || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Thuế cho thuê:</span>
                              <span className="text-red-600">-{formatVND(steps.thueChoThue_Thang || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Chi phí vận hành:</span>
                              <span className="text-red-600">-{formatVND(steps.tongChiPhiVanHanh || 0)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Dòng tiền ròng BĐS:</span>
                              <span className={(steps.dongTienRongBDS || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                                {formatVND(steps.dongTienRongBDS || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Assessment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Đánh Giá Rủi Ro
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className={`text-lg font-bold mb-2 ${
                          summaryMetrics.riskLevel === "Thấp" ? "text-green-600" :
                          summaryMetrics.riskLevel === "Trung bình" ? "text-yellow-600" : "text-red-600"
                        }`}>
                          Rủi Ro {summaryMetrics.riskLevel}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tỷ lệ vay:</span>
                            <span>{(inputs.tyLeVay || 0).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cash flow:</span>
                            <span className={summaryMetrics.isPositiveCashFlow ? "text-green-600" : "text-red-600"}>
                              {summaryMetrics.isPositiveCashFlow ? "Dương" : "Âm"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Charts Tab */}
              <TabsContent value="charts" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Investment Breakdown Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cơ Cấu Đầu Tư</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={investmentBreakdown}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                          >
                            {investmentBreakdown.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={PIE_COLORS[index % PIE_COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatVND(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Cash Flow Projection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dự Báo Dòng Tiền 12 Tháng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={cashFlowData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                          <Tooltip 
                            formatter={(value, name) => [
                              formatVND(value as number), 
                              name === 'cashFlow' ? 'Dòng tiền hàng tháng' : 'Dòng tiền tích lũy'
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cashFlow" 
                            stroke={CHART_COLORS.primary} 
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cumulative" 
                            stroke={CHART_COLORS.secondary} 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                {/* Warnings */}
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
                        {warnings.map((warning, index) => (
                          <p key={index} className="text-red-700 text-sm flex items-start gap-2">
                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {warning}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Gợi Ý Cải Thiện
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {suggestions.slice(0, 5).map((suggestion, index) => (
                          <p key={index} className="text-green-700 text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* NEW SALE ANALYSIS TAB */}
              {hasSaleAnalysis && (
                <TabsContent value="sale-analysis" className="space-y-6">
                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Sparkles className="h-5 w-5" />
                        Sale Scenario Analysis
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          Enhanced
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Phân tích chi tiết kịch bản bán bất động sản với tối ưu hóa thời điểm
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SaleScenarioAnalysis result={result as CalculationResultWithSale} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

            </Tabs>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Tính toán lúc: {result.calculatedAt ? new Date(result.calculatedAt).toLocaleString('vi-VN') : 'N/A'}
            {hasSaleAnalysis && (
              <Badge variant="outline" className="ml-2">
                <Clock className="h-3 w-3 mr-1" />
                Với Sale Analysis
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyResults}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {onNewCalculation && (
              <Button onClick={onNewCalculation}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tính toán mới
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}