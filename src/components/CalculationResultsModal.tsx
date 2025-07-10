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
} from "lucide-react";

import { CalculationResult } from "@/types/real-estate";
import { formatVND, formatPercent } from "@/lib/financial-utils";
import { toast } from "sonner";

interface CalculationResultsModalProps {
  result: CalculationResult | null;
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

export default function CalculationResultsModal({
  result,
  isOpen,
  onClose,
  onNewCalculation,
}: CalculationResultsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");


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
    const roiHangNam = result?.roiHangNam || 0; // Use optional chaining here
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
  }, [result, steps, inputs]); // Dependencies remain the same, but now inputs/steps are safely derived

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

Tạo bởi Công cụ tính toán bất động sản - ${new Date().toLocaleDateString('vi-VN')}
    `.trim();

    navigator.clipboard.writeText(summary);
    toast.success("Đã copy kết quả vào clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                📊 Kết Quả Tính Toán Bất Động Sản
              </DialogTitle>
              <DialogDescription>
                Phân tích chi tiết đầu tư BĐS - {formatVND(inputs.giaTriBDS || 0)}
              </DialogDescription>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyResults}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Dòng tiền hàng tháng</div>
                  <div className={`text-2xl font-bold ${
                    summaryMetrics.isPositiveCashFlow ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatVND(summaryMetrics.monthlyImpact)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {summaryMetrics.isPositiveCashFlow ? "Thu thêm" : "Chi thêm"} hàng tháng
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-sm text-green-600 mb-1">ROI năm</div>
                  <div className={`text-2xl font-bold ${
                    (result.roiHangNam || 0) > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {(result.roiHangNam || 0).toFixed(1)}%
                  </div>
                  <Badge variant={
                    (result.roiHangNam || 0) > 10 ? "default" : 
                    (result.roiHangNam || 0) > 5 ? "secondary" : "destructive"
                  } className="text-xs">
                    {summaryMetrics.roiLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-sm text-purple-600 mb-1">Hoàn vốn</div>
                  <div className="text-xl font-bold text-purple-600">
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

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
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
                        <div className="font-semibold">{formatPercent(inputs.tyLeVay || 0)}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Tỷ lệ vay:</span>
                        <span className="font-semibold">{formatPercent(inputs.tyLeVay || 0)}</span>
                      </div>
                      <Progress value={inputs.tyLeVay || 0} className="h-2" />
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">Lợi nhuận dự kiến/năm</div>
                      <div className="text-2xl font-bold text-blue-800">
                        {formatVND(summaryMetrics.yearlyReturn)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Cash Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Dòng Tiền Hàng Tháng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span>Thu nhập cho thuê:</span>
                        <span className="font-semibold text-green-600">
                          +{formatVND(steps.thuNhapThueHieuDung || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiền trả NH:</span>
                        <span className="font-semibold text-red-600">
                          -{formatVND(steps.tienTraNHThang || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chi phí vận hành:</span>
                        <span className="font-semibold text-red-600">
                          -{formatVND(((steps.tongChiPhiVanHanh || 0) - (steps.tienTraNHThang || 0)))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thuế cho thuê:</span>
                        <span className="font-semibold text-red-600">
                          -{formatVND(steps.thueChoThue_Thang || 0)}
                        </span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold text-lg">
                        <span>Dòng tiền ròng:</span>
                        <span className={summaryMetrics.isPositiveCashFlow ? "text-green-600" : "text-red-600"}>
                          {formatVND(steps.dongTienRongBDS || 0)}
                        </span>
                      </div>
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
                          <div className="flex justify-between font-semibold border-t pt-2">
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
                            <span>Trả nợ ngân hàng:</span>
                            <span>{formatVND(steps.tienTraNHThang || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phí quản lý:</span>
                            <span>{formatVND(inputs.phiQuanLy || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bảo trì hàng tháng:</span>
                            <span>{formatVND(steps.chiPhiBaoTriThang || 0)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Tổng chi phí vận hành:</span>
                            <span>{formatVND(steps.tongChiPhiVanHanh || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Thông Số Kỹ Thuật</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Lãi suất ưu đãi:</div>
                      <div className="font-semibold">{formatPercent(inputs.laiSuatUuDai || 0)}/năm</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Lãi suất thả nổi:</div>
                      <div className="font-semibold">{formatPercent(inputs.laiSuatThaNoi || 0)}/năm</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Thời gian vay:</div>
                      <div className="font-semibold">{inputs.thoiGianVay || 0} năm</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Tỷ lệ lấp đầy:</div>
                      <div className="font-semibold">{formatPercent(inputs.tyLeLapDay || 0)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Thuế suất cho thuê:</div>
                      <div className="font-semibold">{formatPercent(inputs.thueSuatChoThue || 0)}</div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-muted-foreground">NPV:</div>
                      <div className="font-semibold">{formatVND(result.netPresentValue || 0)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rental Yield:</div>
                      <div className="font-semibold">{(result.rentalYield || 0).toFixed(2)}%/năm</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Investment Breakdown Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cơ Cấu Vốn Đầu Tư</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={investmentBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {investmentBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatVND(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Cash Flow Projection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dự Báo Dòng Tiền 12 Tháng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cashFlowData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                          <Tooltip 
                            formatter={(value, name) => [
                              formatVND(Number(value)), 
                              name === 'cashFlow' ? 'Dòng tiền tháng' : 'Tích lũy'
                            ]} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cashFlow" 
                            stroke={CHART_COLORS.primary}
                            strokeWidth={2}
                            name="cashFlow"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cumulative" 
                            stroke={CHART_COLORS.secondary}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="cumulative"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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


              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Tính toán lúc: {result.calculatedAt ? new Date(result.calculatedAt).toLocaleString('vi-VN') : 'N/A'}
          </div>
          <div className="flex gap-2">
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