// UPDATED: 2025-07-10 - Major refactor with new comparison components (AC1-AC16)

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Target,
  BarChart3,
  Lightbulb,
  TrendingUp,
  Plus,
  Eye,
  Settings,
  Info,
  CheckCircle,
  AlertTriangle,
  Zap,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { CalculationResult } from "@/types/real-estate";
import { CalculationResultWithSale } from "@/types/sale-scenario";

// Import new components
import ComparisonOverviewTable from "./ComparisonOverviewTable";
import DetailedMetricsTable from "./DetailedMetricsTable";
import RecommendationPanel from "./RecommendationPanel";
import UserFlowGuidance from "./UserFlowGuidance";

// ===== ENHANCED INTERFACES =====
interface EnhancedVisualComparisonProps {
  scenarios: CalculationResultWithSale[];
  onSelectScenario?: (scenario: CalculationResult) => void;
  onRemoveScenario?: (index: number) => void;
  showRecommendation?: boolean;
  comparisonMode?: "standard" | "buy_now_vs_future";
  // New props for enhanced UX
  onCreateFutureScenario?: () => void;
  onCalculateNew?: () => void;
  isLoading?: boolean;
}

// ===== UTILITY FUNCTIONS =====
const getScenarioType = (
  scenario: CalculationResultWithSale
): "buy_now" | "buy_future" | "standard" => {
  if (scenario.scenarioType) {
    return scenario.scenarioType;
  }

  if (
    scenario.purchaseTimingInfo?.monthsFromNow &&
    scenario.purchaseTimingInfo.monthsFromNow > 0
  ) {
    return "buy_future";
  }

  const name = scenario.scenarioName?.toLowerCase() || "";
  if (name.includes("mua ngay") || name.includes("buy now")) {
    return "buy_now";
  }
  if (name.includes("mua tương lai") || name.includes("buy future")) {
    return "buy_future";
  }

  return "standard";
};

const analyzeScenarios = (scenarios: CalculationResultWithSale[]) => {
  const buyNowScenarios = scenarios.filter(s => getScenarioType(s) === "buy_now");
  const futureScenarios = scenarios.filter(s => getScenarioType(s) === "buy_future");
  const standardScenarios = scenarios.filter(s => getScenarioType(s) === "standard");

  return {
    total: scenarios.length,
    buyNow: buyNowScenarios.length,
    future: futureScenarios.length,
    standard: standardScenarios.length,
    hasCalculatedBuyNow: buyNowScenarios.length > 0,
    hasFutureScenarios: futureScenarios.length > 0,
    hasCompleteComparison: buyNowScenarios.length > 0 && futureScenarios.length > 0,
    isBuyNowVsFutureMode: buyNowScenarios.length > 0 || futureScenarios.length > 0,
  };
};

// ===== MAIN COMPONENT =====
export default function EnhancedVisualComparison({
  scenarios,
  onSelectScenario,
  onRemoveScenario,
  showRecommendation = true,
  comparisonMode = "standard",
  onCreateFutureScenario,
  onCalculateNew,
  isLoading = false,
}: EnhancedVisualComparisonProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserGuidance, setShowUserGuidance] = useState(true);

  // Analyze scenarios
  const scenarioAnalysis = useMemo(() => analyzeScenarios(scenarios), [scenarios]);

  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-muted-foreground">Đang tính toán...</span>
        </div>
      </Card>
    );
  }

  // Empty state
  if (scenarios.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có kịch bản nào để so sánh
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy bắt đầu bằng cách tạo kịch bản đầu tiên của bạn
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={onCalculateNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tạo kịch bản mới
                </Button>
                {comparisonMode === "buy_now_vs_future" && (
                  <Button
                    variant="outline"
                    onClick={onCreateFutureScenario}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Tạo kịch bản tương lai
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Single scenario state  
  if (scenarios.length === 1) {
    const scenario = scenarios[0];
    const scenarioType = getScenarioType(scenario);
    
    return (
      <div className="space-y-6">
        {/* User Guidance for single scenario */}
        {showUserGuidance && (
          <UserFlowGuidance
            scenarios={scenarios}
            hasCalculatedBuyNow={scenarioAnalysis.hasCalculatedBuyNow}
            hasFutureScenarios={scenarioAnalysis.hasFutureScenarios}
            onCreateFutureScenario={onCreateFutureScenario}
            onCalculateNew={onCalculateNew}
          />
        )}

        {/* Single Scenario Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-5 w-5" />
              {scenario.scenarioName || "Kịch bản đầu tư"}
              <Badge
                variant={scenarioType === "buy_now" ? "default" : "secondary"}
                className="gap-1"
              >
                {scenarioType === "buy_now" ? (
                  <>
                    <Zap className="h-3 w-3" />
                    Mua Ngay
                  </>
                ) : scenarioType === "buy_future" ? (
                  <>
                    <Clock className="h-3 w-3" />
                    Mua Tương Lai
                  </>
                ) : (
                  "Kịch Bản"
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Quick metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {(scenario.roiHangNam || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600">ROI Hàng Năm</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {((scenario.steps?.dongTienRongBDS || 0) / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-green-600">Dòng Tiền/Tháng</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {((scenario.steps?.tongVonBanDau || 0) / 1000000000).toFixed(1)}B
                </div>
                <div className="text-sm text-purple-600">Vốn Ban Đầu</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {scenario.paybackPeriod ? `${scenario.paybackPeriod.toFixed(1)}` : "N/A"}
                </div>
                <div className="text-sm text-orange-600">Hoàn Vốn (năm)</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={onCalculateNew} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm kịch bản khác
              </Button>
              {scenarioType === "buy_now" && onCreateFutureScenario && (
                <Button onClick={onCreateFutureScenario} className="gap-2">
                  <Clock className="h-4 w-4" />
                  So sánh với tương lai
                </Button>
              )}
              {onSelectScenario && (
                <Button
                  variant="secondary"
                  onClick={() => onSelectScenario(scenario)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Xem chi tiết
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Multiple scenarios comparison
  return (
    <div className="space-y-6">
      {/* User Flow Guidance */}
      {showUserGuidance && (
        <UserFlowGuidance
          scenarios={scenarios}
          hasCalculatedBuyNow={scenarioAnalysis.hasCalculatedBuyNow}
          hasFutureScenarios={scenarioAnalysis.hasFutureScenarios}
          onCreateFutureScenario={onCreateFutureScenario}
          onCalculateNew={onCalculateNew}
          onViewComparison={() => setActiveTab("detailed")}
        />
      )}

      {/* Comparison Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Target className="h-5 w-5" />
              So Sánh Kịch Bản Đầu Tư
              <Badge variant="secondary">{scenarios.length} kịch bản</Badge>
              {scenarioAnalysis.isBuyNowVsFutureMode && (
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  Mua Ngay vs. Tương Lai
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserGuidance(!showUserGuidance)}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                {showUserGuidance ? "Ẩn gợi ý" : "Hiện gợi ý"}
              </Button>
              <Button onClick={onCalculateNew} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm kịch bản
              </Button>
            </div>
          </div>
          
          {/* Status badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {scenarioAnalysis.buyNow > 0 && (
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                {scenarioAnalysis.buyNow} Mua Ngay
              </Badge>
            )}
            {scenarioAnalysis.future > 0 && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {scenarioAnalysis.future} Mua Tương Lai
              </Badge>
            )}
            {scenarioAnalysis.standard > 0 && (
              <Badge variant="outline" className="gap-1">
                <BarChart3 className="h-3 w-3" />
                {scenarioAnalysis.standard} Khác
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Comparison Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Target className="h-4 w-4" />
            Tổng Quan
          </TabsTrigger>
          <TabsTrigger value="detailed" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Chi Tiết
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Khuyến Nghị
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Tùy Chọn
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - AC1, AC2, AC3 */}
        <TabsContent value="overview" className="space-y-6">
          <ComparisonOverviewTable scenarios={scenarios} />
          
          {/* Quick insights */}
          {scenarioAnalysis.hasCompleteComparison && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Phân tích hoàn tất!</strong> Bạn đã có đủ dữ liệu để so sánh giữa 
                &quot;Mua Ngay&quot; và &quot;Mua Tương Lai&quot;. Xem tab Khuyến Nghị để có quyết định tốt nhất.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Detailed Tab - AC11, AC15 */}
        <TabsContent value="detailed" className="space-y-6">
          <DetailedMetricsTable scenarios={scenarios} />
        </TabsContent>

        {/* Recommendations Tab - AC5, AC16 */}
        <TabsContent value="recommendations" className="space-y-6">
          {showRecommendation ? (
            <RecommendationPanel scenarios={scenarios} />
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Tính năng khuyến nghị đã bị tắt. Bật lại trong cài đặt để xem phân tích và gợi ý chi tiết.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tùy Chọn Hiển Thị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Hiển thị khuyến nghị</div>
                    <div className="text-sm text-muted-foreground">
                      Bật/tắt phần phân tích và khuyến nghị thông minh
                    </div>
                  </div>
                  <Button
                    variant={showRecommendation ? "default" : "outline"}
                    size="sm"
                    onClick={() => toast.info("Tính năng này được điều khiển bởi props")}
                  >
                    {showRecommendation ? "Đang bật" : "Đang tắt"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Hướng dẫn người dùng</div>
                    <div className="text-sm text-muted-foreground">
                      Hiển thị gợi ý và hướng dẫn các bước tiếp theo
                    </div>
                  </div>
                  <Button
                    variant={showUserGuidance ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowUserGuidance(!showUserGuidance)}
                  >
                    {showUserGuidance ? "Đang bật" : "Đang tắt"}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="font-medium">Thao tác kịch bản</div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={onCalculateNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm kịch bản mới
                    </Button>
                    {comparisonMode === "buy_now_vs_future" && onCreateFutureScenario && (
                      <Button variant="outline" size="sm" onClick={onCreateFutureScenario}>
                        <Clock className="h-4 w-4 mr-2" />
                        Tạo kịch bản tương lai
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <strong>Thống kê:</strong> {scenarios.length} kịch bản, 
                  {scenarioAnalysis.buyNow} mua ngay, 
                  {scenarioAnalysis.future} tương lai
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              So sánh {scenarios.length} kịch bản • 
              Cập nhật: {new Date().toLocaleString('vi-VN')}
            </div>
            <div className="flex gap-2">
              {onSelectScenario && scenarios.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectScenario(scenarios[0])}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </Button>
              )}
              <Button size="sm" onClick={() => setActiveTab("recommendations")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Xem khuyến nghị
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}