// CREATED: 2025-07-10 - Detailed side-by-side metrics comparison for scenarios

"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Filter,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Percent,
  Calendar,
  Home,
  Calculator,
  Target,
  Info,
} from "lucide-react";

import { CalculationResultWithSale } from "@/types/sale-scenario";
import { formatVND, formatPercent } from "@/lib/financial-utils";

// ===== INTERFACES =====
interface DetailedMetricsTableProps {
  scenarios: CalculationResultWithSale[];
  className?: string;
}

interface MetricDefinition {
  key: string;
  displayName: string;
  category: "basic" | "advanced" | "sale" | "risk";
  description: string;
  getValue: (scenario: CalculationResultWithSale) => number;
  format: (value: number) => string;
  higherIsBetter: boolean;
  isPercentage?: boolean;
  unit?: string;
}

// ===== METRIC DEFINITIONS =====
const METRIC_DEFINITIONS: MetricDefinition[] = [
  // Basic Metrics
  {
    key: "roiHangNam",
    displayName: "ROI Hàng Năm",
    category: "basic",
    description: "Tỷ suất lợi nhuận hàng năm của khoản đầu tư",
    getValue: (s) => s.roiHangNam || 0,
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    isPercentage: true,
  },
  {
    key: "dongTienRongBDS",
    displayName: "Dòng Tiền Ròng/Tháng",
    category: "basic",
    description: "Dòng tiền ròng nhận được hàng tháng",
    getValue: (s) => s.steps?.dongTienRongBDS || 0,
    format: (v) => formatVND(v),
    higherIsBetter: true,
  },
  {
    key: "tongVonBanDau",
    displayName: "Vốn Ban Đầu",
    category: "basic",
    description: "Tổng số tiền cần chuẩn bị ban đầu",
    getValue: (s) => s.steps?.tongVonBanDau || 0,
    format: (v) => formatVND(v),
    higherIsBetter: false, // Lower is better for initial capital
  },
  {
    key: "rentalYield",
    displayName: "Rental Yield",
    category: "basic",
    description: "Tỷ lệ lợi nhuận từ cho thuê so với giá trị BĐS",
    getValue: (s) => s.rentalYield || 0,
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    isPercentage: true,
  },
  
  // Advanced Metrics
  {
    key: "paybackPeriod",
    displayName: "Thời Gian Hoàn Vốn",
    category: "advanced",
    description: "Thời gian cần thiết để thu hồi vốn đầu tư",
    getValue: (s) => s.paybackPeriod || 0,
    format: (v) => v > 0 ? `${v.toFixed(1)} năm` : "N/A",
    higherIsBetter: false,
    unit: "years",
  },
  {
    key: "capRate",
    displayName: "Cap Rate",
    category: "advanced",
    description: "Tỷ lệ vốn hóa (NOI/Property Value)",
    getValue: (s) => {
      const noi = (s.steps?.dongTienRongBDS || 0) * 12;
      const propertyValue = s.inputs?.giaTriBDS || 1;
      return (noi / propertyValue) * 100;
    },
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    isPercentage: true,
  },
  {
    key: "cashOnCash",
    displayName: "Cash-on-Cash Return",
    category: "advanced",
    description: "Tỷ suất lợi nhuận trên tiền mặt đầu tư",
    getValue: (s) => {
      const annualCashFlow = (s.steps?.dongTienRongBDS || 0) * 12;
      const initialCash = s.steps?.tongVonBanDau || 1;
      return (annualCashFlow / initialCash) * 100;
    },
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    isPercentage: true,
  },
  
  // Sale Analysis Metrics (if available)
  {
    key: "totalROIOnSale",
    displayName: "ROI Khi Bán",
    category: "sale",
    description: "Tổng ROI bao gồm cả lợi nhuận khi bán",
    getValue: (s) => s.saleAnalysis?.totalROIOnSale || 0,
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    isPercentage: true,
  },
  {
    key: "totalReturn",
    displayName: "Tổng Lợi Nhuận",
    category: "sale",
    description: "Tổng lợi nhuận từ cho thuê và bán BĐS",
    getValue: (s) => s.saleAnalysis?.totalReturn || (s.steps?.dongTienCuoiCung || 0),
    format: (v) => formatVND(v),
    higherIsBetter: true,
  },
  {
    key: "optimalHoldingPeriod",
    displayName: "Thời Gian Nắm Giữ Tối Ưu",
    category: "sale",
    description: "Thời gian nắm giữ để đạt ROI tối đa",
    getValue: (s) => s.saleAnalysis?.optimalSaleTiming?.bestYear || 0,
    format: (v) => v > 0 ? `${v} năm` : "N/A",
    higherIsBetter: false,
    unit: "years",
  },
  
  // Risk Metrics
  {
    key: "loanToValue",
    displayName: "Loan-to-Value",
    category: "risk",
    description: "Tỷ lệ vay so với giá trị BĐS",
    getValue: (s) => s.inputs?.tyLeVay || 0,
    format: (v) => formatPercent(v),
    higherIsBetter: false,
    isPercentage: true,
  },
  {
    key: "debtServiceCoverage",
    displayName: "DSCR",
    category: "risk",
    description: "Khả năng trả nợ (NOI/Debt Service)",
    getValue: (s) => {
      const noi = (s.steps?.dongTienRongBDS || 0) * 12;
      const debtService = (s.steps?.tienTraNHThang || 1) * 12;
      return noi / debtService;
    },
    format: (v) => v.toFixed(2),
    higherIsBetter: true,
  },
];

// ===== UTILITY FUNCTIONS =====
const getScenarioDisplayName = (scenario: CalculationResultWithSale, index: number): string => {
  return scenario.scenarioName || `Kịch bản ${index + 1}`;
};

const getMetricComparison = (values: number[], higherIsBetter: boolean) => {
  if (values.length === 0) return [];
  
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  return values.map(value => {
    if (value === max && higherIsBetter) return "best";
    if (value === min && !higherIsBetter) return "best";
    if (value === max && !higherIsBetter) return "worst";
    if (value === min && higherIsBetter) return "worst";
    return "neutral";
  });
};

const getComparisonIcon = (status: "best" | "worst" | "neutral") => {
  switch (status) {
    case "best":
      return <Crown className="h-4 w-4 text-yellow-500" />;
    case "worst":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
};

const getCellClassName = (status: "best" | "worst" | "neutral") => {
  switch (status) {
    case "best":
      return "bg-green-50 text-green-800 font-semibold";
    case "worst":
      return "bg-red-50 text-red-800";
    default:
      return "";
  }
};

// ===== MAIN COMPONENT =====
export default function DetailedMetricsTable({
  scenarios,
  className = "",
}: DetailedMetricsTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  // Filter metrics based on selected category
  const filteredMetrics = useMemo(() => {
    let metrics = METRIC_DEFINITIONS;
    
    if (selectedCategory !== "all") {
      metrics = metrics.filter(m => m.category === selectedCategory);
    }

    // Filter out sale metrics if no scenarios have sale analysis
    const hasSaleAnalysis = scenarios.some(s => s.saleAnalysis);
    if (!hasSaleAnalysis) {
      metrics = metrics.filter(m => m.category !== "sale");
    }

    // Show only metrics with differences if filter is enabled
    if (showOnlyDifferences) {
      metrics = metrics.filter(metric => {
        const values = scenarios.map(s => metric.getValue(s));
        const uniqueValues = new Set(values);
        return uniqueValues.size > 1; // Has differences
      });
    }

    return metrics;
  }, [selectedCategory, scenarios, showOnlyDifferences]);

  if (scenarios.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            So Sánh Chi Tiết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Cần ít nhất 2 kịch bản để so sánh chi tiết.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            So Sánh Chi Tiết
            <Badge variant="secondary">{scenarios.length} kịch bản</Badge>
          </CardTitle>
          
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chỉ số</SelectItem>
                  <SelectItem value="basic">Chỉ số cơ bản</SelectItem>
                  <SelectItem value="advanced">Chỉ số nâng cao</SelectItem>
                  <SelectItem value="sale">Phân tích bán</SelectItem>
                  <SelectItem value="risk">Đánh giá rủi ro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
              className="flex items-center gap-2"
            >
              {showOnlyDifferences ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showOnlyDifferences ? "Hiện tất cả" : "Chỉ khác biệt"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Chỉ Số</TableHead>
                  {scenarios.map((scenario, index) => (
                    <TableHead key={index} className="text-center min-w-[150px]">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {getScenarioDisplayName(scenario, index)}
                        </div>
                        <Badge 
                          variant={scenario.scenarioType === "buy_now" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {scenario.scenarioType === "buy_now" ? "Mua Ngay" : "Mua Tương Lai"}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {filteredMetrics.map((metric) => {
                  const values = scenarios.map(s => metric.getValue(s));
                  const comparisons = getMetricComparison(values, metric.higherIsBetter);
                  
                  return (
                    <TableRow key={metric.key} className="hover:bg-muted/50">
                      {/* Metric Name */}
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span>{metric.displayName}</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-[200px]">{metric.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {metric.category}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      {/* Values for each scenario */}
                      {values.map((value, index) => (
                        <TableCell 
                          key={index}
                          className={`text-center ${getCellClassName(comparisons[index])}`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-medium">
                              {metric.format(value)}
                            </span>
                            {getComparisonIcon(comparisons[index])}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-yellow-500" />
              <span>Tốt nhất</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span>Kém nhất</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-gray-400" />
              <span>Trung bình</span>
            </div>
            <div className="ml-auto">
              <span>Có {filteredMetrics.length} chỉ số được hiển thị</span>
            </div>
          </div>
          
          {/* Empty state for filters */}
          {filteredMetrics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Không có chỉ số nào phù hợp với bộ lọc hiện tại.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  setSelectedCategory("all");
                  setShowOnlyDifferences(false);
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}