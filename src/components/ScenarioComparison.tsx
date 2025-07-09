"use client";

import React from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Award,
  Target,
  AlertTriangle,
  CheckCircle,
  Crown,
  Medal,
  Trophy,
  X,
  Plus,
} from "lucide-react";

import { CalculationResult } from "@/types/real-estate";
import { formatVND, formatPercent } from "@/lib/financial-utils";

interface ScenarioComparisonProps {
  scenarios: CalculationResult[];
  onRemoveScenario?: (index: number) => void;
  onAddScenario?: () => void;
}

export default function ScenarioComparison({
  scenarios,
  onRemoveScenario,
  onAddScenario,
}: ScenarioComparisonProps) {
  // Tính toán rankings
  const rankings = React.useMemo(() => {
    const byROI = [...scenarios].sort((a, b) => b.roiHangNam - a.roiHangNam);
    const byCashFlow = [...scenarios].sort(
      (a, b) => b.steps.dongTienRongBDS - a.steps.dongTienRongBDS
    );
    const byPayback = [...scenarios]
      .filter((s) => s.paybackPeriod > 0)
      .sort((a, b) => a.paybackPeriod - b.paybackPeriod);
    const byRisk = [...scenarios].sort((a, b) => {
      // Risk score: lower is better (higher loan ratio = higher risk)
      const riskA = a.inputs.tyLeVay + (a.steps.dongTienCuoiCung < 0 ? 50 : 0);
      const riskB = b.inputs.tyLeVay + (b.steps.dongTienCuoiCung < 0 ? 50 : 0);
      return riskA - riskB;
    });

    return { byROI, byCashFlow, byPayback, byRisk };
  }, [scenarios]);

  if (scenarios.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>So Sánh Kịch Bản</CardTitle>
          <CardDescription>
            Cần ít nhất 2 kịch bản để thực hiện so sánh
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            Hãy tạo thêm kịch bản để so sánh hiệu quả đầu tư
          </div>
          {onAddScenario && (
            <Button onClick={onAddScenario}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm kịch bản mới
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Data cho comparison table
  const comparisonData = scenarios.map((scenario, index) => ({
    ...scenario,
    index,
    name: scenario.scenarioName || `Kịch bản ${index + 1}`,
    roiRank: rankings.byROI.findIndex((s) => s === scenario) + 1,
    cashFlowRank: rankings.byCashFlow.findIndex((s) => s === scenario) + 1,
    paybackRank:
      scenario.paybackPeriod > 0
        ? rankings.byPayback.findIndex((s) => s === scenario) + 1
        : "-",
    riskRank: rankings.byRisk.findIndex((s) => s === scenario) + 1,
  }));

  // Data cho charts
  const chartData = comparisonData.map((item) => ({
    name:
      item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
    roi: item.roiHangNam,
    dongTien: item.steps.dongTienRongBDS / 1000000, // Convert to millions
    payback: item.paybackPeriod > 0 ? item.paybackPeriod : null,
    vonDauTu: item.steps.tongVonBanDau / 1000000000, // Convert to billions
    giaTriBDS: item.inputs.giaTriBDS / 1000000000,
  }));

  // Radar chart data
  const radarData = comparisonData.map((item) => ({
    scenario: item.name,
    roi: Math.max(0, Math.min(100, item.roiHangNam * 5)), // Scale to 0-100
    dongTien: Math.max(
      0,
      Math.min(100, (item.steps.dongTienRongBDS + 10000000) / 200000)
    ), // Scale to 0-100
    thoiGianHoanVon:
      item.paybackPeriod > 0
        ? Math.max(0, Math.min(100, 100 - item.paybackPeriod * 5))
        : 0,
    anToan: Math.max(0, Math.min(100, 100 - item.inputs.tyLeVay)), // Lower loan ratio = safer
  }));

  const getRankBadge = (rank: number | string) => {
    if (rank === "-") return <Badge variant="outline">N/A</Badge>;

    const numRank = typeof rank === "string" ? parseInt(rank) : rank;
    if (numRank === 1)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Crown className="h-3 w-3 mr-1" />#{rank}
        </Badge>
      );
    if (numRank === 2)
      return (
        <Badge className="bg-gray-400 hover:bg-gray-500">
          <Medal className="h-3 w-3 mr-1" />#{rank}
        </Badge>
      );
    if (numRank === 3)
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">
          <Trophy className="h-3 w-3 mr-1" />#{rank}
        </Badge>
      );
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const getPerformanceColor = (
    value: number,
    type: "roi" | "cashflow" | "payback"
  ) => {
    switch (type) {
      case "roi":
        return value > 10
          ? "text-green-600"
          : value > 5
          ? "text-yellow-600"
          : "text-red-600";
      case "cashflow":
        return value > 0 ? "text-green-600" : "text-red-600";
      case "payback":
        return value < 10
          ? "text-green-600"
          : value < 15
          ? "text-yellow-600"
          : "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm font-medium text-muted-foreground">
                ROI Cao Nhất
              </p>
              <p className="text-lg font-bold">
                {rankings.byROI[0]?.scenarioName || "Kịch bản 1"}
              </p>
              <p className="text-sm text-green-600">
                {formatPercent(rankings.byROI[0]?.roiHangNam || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium text-muted-foreground">
                Dòng Tiền Tốt Nhất
              </p>
              <p className="text-lg font-bold">
                {rankings.byCashFlow[0]?.scenarioName || "Kịch bản 1"}
              </p>
              <p className="text-sm text-green-600">
                {formatVND(rankings.byCashFlow[0]?.steps.dongTienRongBDS || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium text-muted-foreground">
                Hoàn Vốn Nhanh Nhất
              </p>
              <p className="text-lg font-bold">
                {rankings.byPayback[0]?.scenarioName || "N/A"}
              </p>
              <p className="text-sm text-blue-600">
                {rankings.byPayback[0]
                  ? `${(rankings.byPayback[0].paybackPeriod || 0).toFixed(
                      1
                    )} năm`
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium text-muted-foreground">
                An Toàn Nhất
              </p>
              <p className="text-lg font-bold">
                {rankings.byRisk[0]?.scenarioName || "Kịch bản 1"}
              </p>
              <p className="text-sm text-purple-600">
                Vay {rankings.byRisk[0]?.inputs.tyLeVay || 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Comparison */}
      <Tabs defaultValue="table" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table">Bảng So Sánh</TabsTrigger>
          <TabsTrigger value="charts">Biểu Đồ</TabsTrigger>
          <TabsTrigger value="analysis">Phân Tích</TabsTrigger>
        </TabsList>

        {/* Table Comparison */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>So Sánh Chi Tiết</CardTitle>
              <CardDescription>
                Bảng so sánh toàn diện các chỉ số quan trọng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Kịch bản</TableHead>
                      <TableHead className="text-right">Giá trị BĐS</TableHead>
                      <TableHead className="text-right">Vốn đầu tư</TableHead>
                      <TableHead className="text-right">
                        Dòng tiền/tháng
                      </TableHead>
                      <TableHead className="text-right">ROI/năm</TableHead>
                      <TableHead className="text-right">Hoàn vốn</TableHead>
                      <TableHead className="text-right">Tỷ lệ vay</TableHead>
                      <TableHead className="text-center">Xếp hạng</TableHead>
                      {onRemoveScenario && (
                        <TableHead className="w-[50px]"></TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonData.map((scenario) => (
                      <TableRow key={scenario.index}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{scenario.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(scenario.calculatedAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatVND(scenario.inputs.giaTriBDS)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatVND(scenario.steps.tongVonBanDau)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${getPerformanceColor(
                            scenario.steps.dongTienRongBDS,
                            "cashflow"
                          )}`}
                        >
                          {formatVND(scenario.steps.dongTienRongBDS)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${getPerformanceColor(
                            scenario.roiHangNam,
                            "roi"
                          )}`}
                        >
                          {formatPercent(scenario.roiHangNam)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            (scenario.paybackPeriod || 0) > 0
                              ? getPerformanceColor(
                                  scenario.paybackPeriod || 0,
                                  "payback"
                                )
                              : "text-gray-400"
                          }`}
                        >
                          {(scenario.paybackPeriod || 0) > 0
                            ? `${(scenario.paybackPeriod || 0).toFixed(1)} năm`
                            : "Không hoàn vốn"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              scenario.inputs.tyLeVay > 80
                                ? "destructive"
                                : scenario.inputs.tyLeVay > 70
                                ? "secondary"
                                : "default"
                            }
                          >
                            {scenario.inputs.tyLeVay}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {getRankBadge(scenario.roiRank)}
                            {getRankBadge(scenario.cashFlowRank)}
                          </div>
                        </TableCell>
                        {onRemoveScenario && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveScenario(scenario.index)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>So Sánh ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `${Number(value || 0).toFixed(2)}%`,
                          "ROI",
                        ]}
                      />
                      <Bar dataKey="roi" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>So Sánh Dòng Tiền</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `${Number(value || 0).toFixed(1)} triệu VNĐ`,
                          "Dòng tiền",
                        ]}
                      />
                      <Bar
                        dataKey="dongTien"
                        fill={(entry: any) =>
                          (entry.dongTien >= 0
                            ? "#22c55e"
                            : "#ef4444") as string
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Investment Size Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>So Sánh Quy Mô Đầu Tư</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          `${Number(value || 0).toFixed(1)} tỷ VNĐ`,
                          name === "giaTriBDS" ? "Giá trị BĐS" : "Vốn đầu tư",
                        ]}
                      />
                      <Bar
                        dataKey="giaTriBDS"
                        fill="#8b5cf6"
                        name="Giá trị BĐS"
                      />
                      <Bar
                        dataKey="vonDauTu"
                        fill="#f59e0b"
                        name="Vốn đầu tư"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Biểu Đồ Radar So Sánh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="scenario" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      {comparisonData.map((_, index) => (
                        <Radar
                          key={index}
                          name={comparisonData[index].name}
                          dataKey={`value${index}`}
                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                          fill={`hsl(${index * 60}, 70%, 50%)`}
                          fillOpacity={0.1}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Kịch Bản Xuất Sắc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    🏆 ROI Cao Nhất
                  </h4>
                  <p className="text-sm font-medium">
                    {rankings.byROI[0]?.scenarioName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ROI: {formatPercent(rankings.byROI[0]?.roiHangNam || 0)} -
                    Dòng tiền:{" "}
                    {formatVND(rankings.byROI[0]?.steps.dongTienRongBDS || 0)}
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-green-50">
                  <h4 className="font-semibold text-green-800 mb-2">
                    💰 Dòng Tiền Tốt Nhất
                  </h4>
                  <p className="text-sm font-medium">
                    {rankings.byCashFlow[0]?.scenarioName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dòng tiền:{" "}
                    {formatVND(
                      rankings.byCashFlow[0]?.steps.dongTienRongBDS || 0
                    )}{" "}
                    - ROI:{" "}
                    {formatPercent(rankings.byCashFlow[0]?.roiHangNam || 0)}
                  </p>
                </div>

                {rankings.byPayback[0] && (
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      ⚡ Hoàn Vốn Nhanh Nhất
                    </h4>
                    <p className="text-sm font-medium">
                      {rankings.byPayback[0].scenarioName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hoàn vốn:{" "}
                      {(rankings.byPayback[0].paybackPeriod || 0).toFixed(1)}{" "}
                      năm - ROI:{" "}
                      {formatPercent(rankings.byPayback[0].roiHangNam || 0)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Đánh Giá Rủi Ro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comparisonData.map((scenario, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-sm">{scenario.name}</p>
                      <Badge
                        variant={
                          scenario.inputs.tyLeVay < 70
                            ? "default"
                            : scenario.inputs.tyLeVay < 80
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {scenario.inputs.tyLeVay < 70
                          ? "An toàn"
                          : scenario.inputs.tyLeVay < 80
                          ? "Trung bình"
                          : "Rủi ro cao"}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Tỷ lệ vay:</span>
                        <span
                          className={
                            scenario.inputs.tyLeVay > 80
                              ? "text-red-600"
                              : "text-gray-600"
                          }
                        >
                          {scenario.inputs.tyLeVay}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dòng tiền cá nhân:</span>
                        <span
                          className={
                            scenario.steps.dongTienCuoiCung < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {formatVND(scenario.steps.dongTienCuoiCung)}
                        </span>
                      </div>
                      <Progress
                        value={Math.max(0, 100 - scenario.inputs.tyLeVay)}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Khuyến Nghị</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-semibold text-green-800 mb-2">
                      ✅ Nên Đầu Tư
                    </h4>
                    <div className="space-y-2">
                      {comparisonData
                        .filter(
                          (s) => s.roiHangNam > 8 && s.steps.dongTienRongBDS > 0
                        )
                        .map((scenario, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{scenario.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ROI {formatPercent(scenario.roiHangNam)}, dòng
                              tiền dương
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-red-50">
                    <h4 className="font-semibold text-red-800 mb-2">
                      ⚠️ Cần Cân Nhắc
                    </h4>
                    <div className="space-y-2">
                      {comparisonData
                        .filter(
                          (s) =>
                            s.roiHangNam <= 5 || s.steps.dongTienRongBDS <= 0
                        )
                        .map((scenario, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{scenario.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {scenario.roiHangNam <= 5 && "ROI thấp"}
                              {scenario.roiHangNam <= 5 &&
                                scenario.steps.dongTienRongBDS <= 0 &&
                                ", "}
                              {scenario.steps.dongTienRongBDS <= 0 &&
                                "dòng tiền âm"}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Scenario Button */}
      {onAddScenario && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Button onClick={onAddScenario} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Kịch Bản Mới
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                So sánh thêm các phương án đầu tư khác
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
