/**
 * SCENARIO COMPARISON INTERFACE
 * Side-by-side comparison of timeline scenarios với visual analytics
 */

"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Minus,
  Plus,
  RotateCcw,
  Download,
  Share,
  Lightbulb,
  Crown,
  Medal,
  Trophy
} from 'lucide-react';

// Chart components (using recharts)
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
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

import { TimelineScenario, MonthlyBreakdown } from '@/types/timeline';
import { TimelineScenarioComparison } from '@/types/timeline-integration';
import { formatVND } from '@/lib/financial-utils';

// ===== INTERFACES =====

interface ScenarioComparisonProps {
  scenarios: TimelineScenario[];
  onScenarioAdd?: () => void;
  onScenarioRemove?: (scenarioId: string) => void;
  maxScenarios?: number;
}

interface ComparisonMetrics {
  totalInterestPaid: number;
  totalCashFlowGenerated: number;
  averageMonthlyPayment: number;
  payoffMonth: number;
  roiHangNam: number;
  netPresentValue: number;
  riskScore: number;
  optimizationScore: number;
}

interface ScenarioAnalysis extends ComparisonMetrics {
  scenario: TimelineScenario;
  rank: {
    totalInterest: number;
    cashFlow: number;
    roi: number;
    payoffTime: number;
    overall: number;
  };
  advantages: string[];
  disadvantages: string[];
  recommendation: 'BEST' | 'GOOD' | 'AVERAGE' | 'POOR';
}

// ===== MAIN COMPARISON COMPONENT =====

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  onScenarioAdd,
  onScenarioRemove,
  maxScenarios = 5
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'charts' | 'detailed' | 'recommendations'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<'cashFlow' | 'interestPaid' | 'loanBalance'>('cashFlow');
  const [timeRange, setTimeRange] = useState<'12' | '60' | '120' | '240'>('60'); // months

  // ===== COMPUTED ANALYSIS =====

  const scenarioAnalyses = useMemo((): ScenarioAnalysis[] => {
    if (scenarios.length === 0) return [];

    // Calculate metrics for each scenario
    const analyses: Omit<ScenarioAnalysis, 'rank' | 'advantages' | 'disadvantages' | 'recommendation'>[] = scenarios.map(scenario => {
      const monthlyBreakdowns = scenario.monthlyBreakdowns;
      const totalCashFlowGenerated = monthlyBreakdowns.reduce((sum, m) => sum + m.finalCashFlow, 0);
      const averageMonthlyPayment = monthlyBreakdowns.reduce((sum, m) => sum + m.totalLoanPayment, 0) / monthlyBreakdowns.length;
      
      // Risk score calculation (0-100, lower is better)
      const negativeCashFlowMonths = monthlyBreakdowns.filter(m => m.finalCashFlow < 0).length;
      const riskScore = Math.min(100, (negativeCashFlowMonths / monthlyBreakdowns.length) * 100 + 
        (scenario.errors.length * 10) + (scenario.warnings.length * 5));
      
      // Optimization score (0-100, higher is better)
      const optimizationScore = Math.max(0, 100 - riskScore - 
        (scenario.totalInterestPaid / scenario.totalPrincipalPaid * 20));

      return {
        scenario,
        totalInterestPaid: scenario.totalInterestPaid,
        totalCashFlowGenerated,
        averageMonthlyPayment,
        payoffMonth: scenario.payoffMonth,
        roiHangNam: scenario.roiHangNam,
        netPresentValue: scenario.netPresentValue,
        riskScore,
        optimizationScore
      };
    });

    // Calculate rankings
    const rankedAnalyses: ScenarioAnalysis[] = analyses.map((analysis, index) => {
      const ranks = {
        totalInterest: analyses.filter(a => a.totalInterestPaid < analysis.totalInterestPaid).length + 1,
        cashFlow: analyses.filter(a => a.totalCashFlowGenerated > analysis.totalCashFlowGenerated).length + 1,
        roi: analyses.filter(a => a.roiHangNam > analysis.roiHangNam).length + 1,
        payoffTime: analyses.filter(a => a.payoffMonth < analysis.payoffMonth).length + 1,
        overall: 0 // Will be calculated
      };

      // Overall rank (average of other ranks, lower is better)
      ranks.overall = Math.round((ranks.totalInterest + ranks.cashFlow + ranks.roi + ranks.payoffTime) / 4);

      // Generate advantages and disadvantages
      const advantages: string[] = [];
      const disadvantages: string[] = [];

      if (ranks.totalInterest === 1) advantages.push('Lãi suất thấp nhất');
      if (ranks.cashFlow === 1) advantages.push('Dòng tiền tốt nhất');
      if (ranks.roi === 1) advantages.push('ROI cao nhất');
      if (ranks.payoffTime === 1) advantages.push('Trả nợ sớm nhất');

      if (ranks.totalInterest === scenarios.length) disadvantages.push('Lãi suất cao nhất');
      if (ranks.cashFlow === scenarios.length) disadvantages.push('Dòng tiền kém nhất');
      if (ranks.roi === scenarios.length) disadvantages.push('ROI thấp nhất');
      if (ranks.payoffTime === scenarios.length) disadvantages.push('Trả nợ lâu nhất');

      if (analysis.riskScore > 30) disadvantages.push('Rủi ro cao');
      if (analysis.optimizationScore < 50) disadvantages.push('Chưa tối ưu');

      // Recommendation
      let recommendation: ScenarioAnalysis['recommendation'];
      if (ranks.overall <= 1.5) recommendation = 'BEST';
      else if (ranks.overall <= 2.5) recommendation = 'GOOD';
      else if (ranks.overall <= 3.5) recommendation = 'AVERAGE';
      else recommendation = 'POOR';

      return {
        ...analysis,
        rank: ranks,
        advantages,
        disadvantages,
        recommendation
      };
    });

    return rankedAnalyses.sort((a, b) => a.rank.overall - b.rank.overall);
  }, [scenarios]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (scenarios.length === 0) return [];

    const maxMonths = parseInt(timeRange);
    const months = Array.from({ length: maxMonths }, (_, i) => i + 1);

    return months.map(month => {
      const dataPoint: any = { month };
      
      scenarios.forEach((scenario, index) => {
        const breakdown = scenario.monthlyBreakdowns[month - 1];
        if (breakdown) {
          const scenarioKey = `scenario_${index}`;
          dataPoint[`${scenarioKey}_cashFlow`] = breakdown.finalCashFlow;
          dataPoint[`${scenarioKey}_interestPaid`] = breakdown.cumulativeInterestPaid;
          dataPoint[`${scenarioKey}_loanBalance`] = breakdown.remainingBalance;
          dataPoint[`${scenarioKey}_name`] = scenario.scenarioName;
        }
      });

      return dataPoint;
    });
  }, [scenarios, timeRange]);

  // Color palette for scenarios
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  // ===== EVENT HANDLERS =====

  const handleAddScenario = useCallback(() => {
    if (scenarios.length >= maxScenarios) {
      toast.error(`Chỉ có thể so sánh tối đa ${maxScenarios} kịch bản`);
      return;
    }
    onScenarioAdd?.();
  }, [scenarios.length, maxScenarios, onScenarioAdd]);

  const handleRemoveScenario = useCallback((scenarioId: string) => {
    onScenarioRemove?.(scenarioId);
    toast.success('Đã xóa kịch bản khỏi so sánh');
  }, [onScenarioRemove]);

  const handleExportComparison = useCallback(() => {
    const exportData = {
      comparisonDate: new Date().toISOString(),
      scenarios: scenarios.map(s => ({
        name: s.scenarioName,
        id: s.timelineId,
        metrics: scenarioAnalyses.find(a => a.scenario.timelineId === s.timelineId)
      })),
      analysis: scenarioAnalyses
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-comparison-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Đã xuất báo cáo so sánh');
  }, [scenarios, scenarioAnalyses]);

  // ===== RENDER METHODS =====

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarioAnalyses.map((analysis, index) => (
          <Card key={analysis.scenario.timelineId} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {analysis.rank.overall === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                  {analysis.rank.overall === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                  {analysis.rank.overall === 3 && <Trophy className="h-4 w-4 text-amber-600" />}
                  {analysis.scenario.scenarioName}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveScenario(analysis.scenario.timelineId)}
                  className="h-6 w-6 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  analysis.recommendation === 'BEST' ? 'default' :
                  analysis.recommendation === 'GOOD' ? 'secondary' :
                  analysis.recommendation === 'AVERAGE' ? 'outline' : 'destructive'
                }>
                  {analysis.recommendation === 'BEST' ? 'Tốt nhất' :
                   analysis.recommendation === 'GOOD' ? 'Tốt' :
                   analysis.recommendation === 'AVERAGE' ? 'Trung bình' : 'Kém'}
                </Badge>
                <Badge variant="outline">
                  Hạng {analysis.rank.overall}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">ROI</div>
                  <div className="font-semibold text-green-600">
                    {(analysis.roiHangNam || 0).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Dòng tiền TB</div>
                  <div className={`font-semibold ${analysis.totalCashFlowGenerated >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatVND(analysis.totalCashFlowGenerated / 240)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Tổng lãi</div>
                  <div className="font-semibold text-red-600">
                    {formatVND(analysis.totalInterestPaid)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Trả hết nợ</div>
                  <div className="font-semibold">
                    T{analysis.payoffMonth}
                  </div>
                </div>
              </div>

              {/* Advantages */}
              {analysis.advantages.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-green-600 mb-1">Ưu điểm:</div>
                  <div className="space-y-1">
                    {analysis.advantages.map((advantage, idx) => (
                      <div key={idx} className="text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {advantage}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disadvantages */}
              {analysis.disadvantages.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-600 mb-1">Nhược điểm:</div>
                  <div className="space-y-1">
                    {analysis.disadvantages.map((disadvantage, idx) => (
                      <div key={idx} className="text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        {disadvantage}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk & Optimization Scores */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Điểm rủi ro:</span>
                  <span className={`font-semibold ${analysis.riskScore < 20 ? 'text-green-600' : analysis.riskScore < 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {(analysis.riskScore || 0).toFixed(0)}/100
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Điểm tối ưu:</span>
                  <span className={`font-semibold ${analysis.optimizationScore > 70 ? 'text-green-600' : analysis.optimizationScore > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {(analysis.optimizationScore || 0).toFixed(0)}/100
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Scenario Card */}
        {scenarios.length < maxScenarios && (
          <Card className="border-dashed border-2 border-gray-300 hover:border-primary transition-colors">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Thêm kịch bản</h3>
              <p className="text-sm text-muted-foreground mb-4">
                So sánh với kịch bản khác để ra quyết định tốt hơn
              </p>
              <Button onClick={handleAddScenario} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Thêm kịch bản
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Comparison Table */}
      {scenarioAnalyses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Bảng so sánh nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Chỉ số</th>
                    {scenarioAnalyses.map((analysis, index) => (
                      <th key={analysis.scenario.timelineId} className="text-center py-2">
                        <div className="flex items-center justify-center gap-1">
                          {analysis.rank.overall === 1 && <Crown className="h-3 w-3 text-yellow-500" />}
                          Kịch bản {index + 1}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">ROI (%/năm)</td>
                    {scenarioAnalyses.map(analysis => (
                      <td key={analysis.scenario.timelineId} className="text-center py-2">
                        <span className={analysis.rank.roi === 1 ? 'font-bold text-green-600' : ''}>
                          {(analysis.roiHangNam || 0).toFixed(1)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Tổng lãi (VND)</td>
                    {scenarioAnalyses.map(analysis => (
                      <td key={analysis.scenario.timelineId} className="text-center py-2">
                        <span className={analysis.rank.totalInterest === 1 ? 'font-bold text-green-600' : ''}>
                          {formatVND(analysis.totalInterestPaid)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Trả hết nợ (tháng)</td>
                    {scenarioAnalyses.map(analysis => (
                      <td key={analysis.scenario.timelineId} className="text-center py-2">
                        <span className={analysis.rank.payoffTime === 1 ? 'font-bold text-green-600' : ''}>
                          {analysis.payoffMonth}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Hạng tổng thể</td>
                    {scenarioAnalyses.map(analysis => (
                      <td key={analysis.scenario.timelineId} className="text-center py-2">
                        <Badge variant={analysis.rank.overall === 1 ? 'default' : 'outline'}>
                          #{analysis.rank.overall}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCharts = () => (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="metric">Chỉ số:</label>
              <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashFlow">Dòng tiền</SelectItem>
                  <SelectItem value="interestPaid">Lãi tích lũy</SelectItem>
                  <SelectItem value="loanBalance">Dư nợ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="timeRange">Thời gian:</label>
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">1 năm</SelectItem>
                  <SelectItem value="60">5 năm</SelectItem>
                  <SelectItem value="120">10 năm</SelectItem>
                  <SelectItem value="240">20 năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedMetric === 'cashFlow' ? 'Dòng tiền theo thời gian' :
             selectedMetric === 'interestPaid' ? 'Lãi tích lũy theo thời gian' :
             'Dư nợ theo thời gian'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatVND(value)} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    formatVND(value),
                    name.split('_')[2] || name
                  ]}
                  labelFormatter={(month) => `Tháng ${month}`}
                />
                <Legend />
                {scenarios.map((scenario, index) => (
                  <Line
                    key={scenario.timelineId}
                    type="monotone"
                    dataKey={`scenario_${index}_${selectedMetric}`}
                    stroke={colors[index]}
                    strokeWidth={2}
                    name={scenario.scenarioName}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ROI Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">So sánh ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioAnalyses.map(a => ({
                  name: a.scenario.scenarioName,
                  roi: a.roiHangNam
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${(value || 0).toFixed(1)}%`, 'ROI']} />
                  <Bar dataKey="roi">
                    {scenarioAnalyses.map((analysis, index) => (
                      <Cell key={index} fill={colors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Interest Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">So sánh tổng lãi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioAnalyses.map(a => ({
                  name: a.scenario.scenarioName,
                  interest: a.totalInterestPaid
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatVND(value)} />
                  <Tooltip formatter={(value: any) => [formatVND(value), 'Tổng lãi']} />
                  <Bar dataKey="interest">
                    {scenarioAnalyses.map((analysis, index) => (
                      <Cell key={index} fill={colors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRecommendations = () => {
    const bestScenario = scenarioAnalyses[0]; // Already sorted by rank
    
    return (
      <div className="space-y-6">
        {/* Best Scenario Highlight */}
        {bestScenario && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Crown className="h-5 w-5 text-yellow-500" />
                Kịch bản được đề xuất
              </CardTitle>
              <CardDescription className="text-green-700">
                {bestScenario.scenario.scenarioName} là lựa chọn tối ưu nhất dựa trên phân tích toàn diện
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(bestScenario.roiHangNam || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">ROI hàng năm</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatVND(bestScenario.totalInterestPaid)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tổng lãi phải trả</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {bestScenario.payoffMonth}
                  </div>
                  <div className="text-sm text-muted-foreground">Tháng trả hết nợ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(bestScenario.riskScore || 0).toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Điểm rủi ro</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Lý do đề xuất:</h4>
                <ul className="space-y-1">
                  {bestScenario.advantages.map((advantage, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {advantage}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Gợi ý tối ưu hóa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarioAnalyses.map((analysis, index) => (
                <div key={analysis.scenario.timelineId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{analysis.scenario.scenarioName}</h4>
                    <Badge variant={
                      analysis.recommendation === 'BEST' ? 'default' :
                      analysis.recommendation === 'GOOD' ? 'secondary' :
                      analysis.recommendation === 'AVERAGE' ? 'outline' : 'destructive'
                    }>
                      {analysis.recommendation === 'BEST' ? 'Tốt nhất' :
                       analysis.recommendation === 'GOOD' ? 'Tốt' :
                       analysis.recommendation === 'AVERAGE' ? 'Trung bình' : 'Cần cải thiện'}
                    </Badge>
                  </div>

                  {analysis.disadvantages.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-orange-600">Điểm cần cải thiện:</div>
                      <ul className="space-y-1">
                        {analysis.disadvantages.map((disadvantage, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5" />
                            <span>{disadvantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Specific recommendations based on analysis */}
                  <div className="mt-3 text-sm text-muted-foreground">
                    {analysis.riskScore > 30 && (
                      <div>💡 Cân nhắc giảm rủi ro bằng cách tăng vốn tự có hoặc lập quỹ dự phòng</div>
                    )}
                    {analysis.optimizationScore < 50 && (
                      <div>💡 Có thể tối ưu hóa bằng cách trả nợ trước hạn hoặc tăng thu nhập thuê</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có kịch bản nào để so sánh</h3>
          <p className="text-muted-foreground mb-4">
            Thêm ít nhất 2 kịch bản để bắt đầu so sánh
          </p>
          <Button onClick={handleAddScenario}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm kịch bản đầu tiên
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                So sánh Kịch bản Timeline
              </CardTitle>
              <CardDescription>
                Phân tích và so sánh {scenarios.length} kịch bản để đưa ra quyết định tối ưu
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportComparison}>
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddScenario}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm kịch bản
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeView} onValueChange={(view: any) => setActiveView(view)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="charts">Biểu đồ</TabsTrigger>
          <TabsTrigger value="detailed">Chi tiết</TabsTrigger>
          <TabsTrigger value="recommendations">Gợi ý</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          {renderCharts()}
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tính năng phân tích chi tiết sẽ được bổ sung trong phiên bản tiếp theo
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          {renderRecommendations()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScenarioComparison;