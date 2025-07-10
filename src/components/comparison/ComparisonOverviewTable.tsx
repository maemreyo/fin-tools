// CREATED: 2025-07-10 - Overview comparison table for Buy Now vs Future scenarios

"use client";

import React, { useMemo } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Zap,
  Clock,
  BarChart3,
  Crown,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { CalculationResultWithSale } from "@/types/sale-scenario";
import { formatVND, formatPercent } from "@/lib/financial-utils";

// ===== INTERFACES =====
interface ComparisonOverviewTableProps {
  scenarios: CalculationResultWithSale[];
  className?: string;
}

interface TableRowData {
  scenario: CalculationResultWithSale;
  scenarioType: "buy_now" | "buy_future" | "standard";
  displayName: string;
  roiOverall: number;
  monthlyCashFlow: number;
  initialCapital: number;
  totalProfit: number;
  purchaseTiming: string;
  economicScenario: string;
  isBestROI: boolean;
  isBestCashFlow: boolean;
  isBestCapital: boolean;
}

// ===== UTILITY FUNCTIONS =====
const getScenarioType = (
  scenario: CalculationResultWithSale
): "buy_now" | "buy_future" | "standard" => {
  // Check enhanced metadata first
  if (scenario.scenarioType) {
    return scenario.scenarioType;
  }

  // Fallback detection based on timing info
  if (
    scenario.purchaseTimingInfo?.monthsFromNow &&
    scenario.purchaseTimingInfo.monthsFromNow > 0
  ) {
    return "buy_future";
  }

  // Check scenario name patterns
  const name = scenario.scenarioName?.toLowerCase() || "";
  if (name.includes("mua ngay") || name.includes("buy now")) {
    return "buy_now";
  }
  if (name.includes("mua tương lai") || name.includes("buy future")) {
    return "buy_future";
  }

  return "standard";
};

const getScenarioTypeBadge = (
  scenarioType: "buy_now" | "buy_future" | "standard"
) => {
  switch (scenarioType) {
    case "buy_now":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300 gap-1">
          <Zap className="h-3 w-3" />
          Mua Ngay
        </Badge>
      );
    case "buy_future":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300 gap-1">
          <Clock className="h-3 w-3" />
          Mua Tương Lai
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <BarChart3 className="h-3 w-3" />
          Kịch Bản
        </Badge>
      );
  }
};

const getPurchaseTimingDisplay = (scenario: CalculationResultWithSale): string => {
  if (scenario.purchaseTimingInfo?.purchaseDate) {
    return format(scenario.purchaseTimingInfo.purchaseDate, "dd/MM/yyyy", {
      locale: vi,
    });
  }

  if (scenario.purchaseTimingInfo?.monthsFromNow) {
    const months = scenario.purchaseTimingInfo.monthsFromNow;
    if (months < 12) {
      return `${months} tháng nữa`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 
        ? `${years} năm ${remainingMonths} tháng nữa`
        : `${years} năm nữa`;
    }
  }

  return "Ngay bây giờ";
};

const getEconomicScenarioDisplay = (scenario: CalculationResultWithSale): string => {
  if (scenario.economicScenarioApplied?.name) {
    return scenario.economicScenarioApplied.name;
  }

  // Fallback for scenarios without economic scenario info
  const scenarioType = getScenarioType(scenario);
  return scenarioType === "buy_now" ? "Hiện tại" : "Dự phóng";
};

// ===== MAIN COMPONENT =====
export default function ComparisonOverviewTable({
  scenarios,
  className = "",
}: ComparisonOverviewTableProps) {
  // Prepare table data with rankings
  const tableData: TableRowData[] = useMemo(() => {
    const rows = scenarios.map((scenario) => {
      const scenarioType = getScenarioType(scenario);
      
      return {
        scenario,
        scenarioType,
        displayName: scenario.scenarioName || "Kịch bản không tên",
        roiOverall: scenario.roiHangNam || 0,
        monthlyCashFlow: scenario.steps?.dongTienRongBDS || 0,
        initialCapital: scenario.steps?.tongVonBanDau || 0,
        totalProfit: scenario.saleAnalysis?.totalReturn || (scenario.steps?.dongTienCuoiCung || 0),
        purchaseTiming: getPurchaseTimingDisplay(scenario),
        economicScenario: getEconomicScenarioDisplay(scenario),
        isBestROI: false,
        isBestCashFlow: false,
        isBestCapital: false,
      };
    });

    // Determine best scenarios for highlighting
    const bestROI = Math.max(...rows.map(r => r.roiOverall));
    const bestCashFlow = Math.max(...rows.map(r => r.monthlyCashFlow));
    const lowestCapital = Math.min(...rows.map(r => r.initialCapital));

    return rows.map(row => ({
      ...row,
      isBestROI: row.roiOverall === bestROI,
      isBestCashFlow: row.monthlyCashFlow === bestCashFlow,
      isBestCapital: row.initialCapital === lowestCapital,
    }));
  }, [scenarios]);

  if (scenarios.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tổng Quan So Sánh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Chưa có kịch bản nào để so sánh. Hãy tạo ít nhất một kịch bản.
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
            <Target className="h-5 w-5" />
            Tổng Quan So Sánh
            <Badge variant="secondary">{tableData.length} kịch bản</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Kịch Bản</TableHead>
                  <TableHead className="text-right">
                    <Tooltip>
                      <TooltipTrigger>ROI Tổng Thể</TooltipTrigger>
                      <TooltipContent>
                        <p>Tỷ suất lợi nhuận hàng năm của khoản đầu tư</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right">
                    <Tooltip>
                      <TooltipTrigger>Dòng Tiền Ròng/Tháng</TooltipTrigger>
                      <TooltipContent>
                        <p>Dòng tiền ròng nhận được hàng tháng sau tất cả chi phí</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right">
                    <Tooltip>
                      <TooltipTrigger>Vốn Ban Đầu</TooltipTrigger>
                      <TooltipContent>
                        <p>Tổng số tiền cần chuẩn bị từ đầu</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right">
                    <Tooltip>
                      <TooltipTrigger>Tổng Lợi Nhuận</TooltipTrigger>
                      <TooltipContent>
                        <p>Tổng lợi nhuận dự kiến (bao gồm cả khi bán nếu có)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead>
                    <Tooltip>
                      <TooltipTrigger>Thời Điểm Mua</TooltipTrigger>
                      <TooltipContent>
                        <p>Thời điểm dự kiến thực hiện giao dịch mua</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead>
                    <Tooltip>
                      <TooltipTrigger>Kịch Bản Kinh Tế</TooltipTrigger>
                      <TooltipContent>
                        <p>Điều kiện kinh tế được áp dụng trong tính toán</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    {/* Scenario Name & Type */}
                    <TableCell className="space-y-1">
                      <div className="font-medium">{row.displayName}</div>
                      {getScenarioTypeBadge(row.scenarioType)}
                    </TableCell>
                    
                    {/* ROI Overall */}
                    <TableCell className="text-right">
                      <div className={`font-medium ${row.isBestROI ? 'text-green-600' : ''}`}>
                        {formatPercent(row.roiOverall)}
                        {row.isBestROI && <Crown className="inline h-4 w-4 ml-1 text-yellow-500" />}
                      </div>
                    </TableCell>
                    
                    {/* Monthly Cash Flow */}
                    <TableCell className="text-right">
                      <div className={`font-medium ${row.isBestCashFlow ? 'text-green-600' : ''}`}>
                        {formatVND(row.monthlyCashFlow)}
                        {row.isBestCashFlow && <Crown className="inline h-4 w-4 ml-1 text-yellow-500" />}
                        {row.monthlyCashFlow > 0 ? (
                          <TrendingUp className="inline h-3 w-3 ml-1 text-green-500" />
                        ) : (
                          <TrendingDown className="inline h-3 w-3 ml-1 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Initial Capital */}
                    <TableCell className="text-right">
                      <div className={`font-medium ${row.isBestCapital ? 'text-green-600' : ''}`}>
                        {formatVND(row.initialCapital)}
                        {row.isBestCapital && <Crown className="inline h-4 w-4 ml-1 text-yellow-500" />}
                      </div>
                    </TableCell>
                    
                    {/* Total Profit */}
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {formatVND(row.totalProfit)}
                      </div>
                    </TableCell>
                    
                    {/* Purchase Timing */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{row.purchaseTiming}</span>
                      </div>
                    </TableCell>
                    
                    {/* Economic Scenario */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{row.economicScenario}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-yellow-500" />
              <span>Tốt nhất</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>Dòng tiền dương</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span>Dòng tiền âm</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}