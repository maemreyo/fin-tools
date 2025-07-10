// CREATED: 2025-07-10 - User flow guidance component for natural progression hints

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowRight,
  Plus,
  Zap,
  Clock,
  Target,
  Lightbulb,
  TrendingUp,
  Calculator,
  Eye,
  Calendar,
  Building,
  Rocket,
  CheckCircle,
  ArrowUp,
} from "lucide-react";

import { CalculationResultWithSale } from "@/types/sale-scenario";

// ===== INTERFACES =====
interface UserFlowGuidanceProps {
  scenarios: CalculationResultWithSale[];
  hasCalculatedBuyNow: boolean;
  hasFutureScenarios: boolean;
  onCreateFutureScenario?: () => void;
  onCalculateNew?: () => void;
  onViewComparison?: () => void;
  className?: string;
}

interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  type: "primary" | "secondary" | "info";
  priority: number;
  condition: (props: UserFlowGuidanceProps) => boolean;
  onAction?: () => void;
}

// ===== GUIDANCE STEPS DEFINITIONS =====
const createGuidanceSteps = (props: UserFlowGuidanceProps): GuidanceStep[] => [
  {
    id: "create-buy-now",
    title: "Tính toán kịch bản 'Mua Ngay'",
    description: "Bắt đầu bằng việc phân tích khoản đầu tư với điều kiện thị trường hiện tại.",
    action: "Tính toán ngay",
    icon: <Zap className="h-5 w-5" />,
    type: "primary",
    priority: 1,
    condition: (p) => !p.hasCalculatedBuyNow,
    onAction: props.onCalculateNew,
  },
  {
    id: "create-future-scenario",
    title: "Tạo kịch bản 'Mua Tương Lai'",
    description: "So sánh với việc mua trong tương lai với các điều kiện kinh tế khác nhau.",
    action: "Tạo kịch bản tương lai",
    icon: <Clock className="h-5 w-5" />,
    type: "primary",
    priority: 2,
    condition: (p) => p.hasCalculatedBuyNow && !p.hasFutureScenarios,
    onAction: props.onCreateFutureScenario,
  },
  {
    id: "compare-scenarios",
    title: "So sánh và phân tích",
    description: "Xem phân tích chi tiết để đưa ra quyết định đầu tư tối ưu.",
    action: "Xem so sánh chi tiết",
    icon: <Target className="h-5 w-5" />,
    type: "primary",
    priority: 3,
    condition: (p) => p.hasCalculatedBuyNow && p.hasFutureScenarios && p.scenarios.length >= 2,
    onAction: props.onViewComparison,
  },
  {
    id: "add-more-scenarios",
    title: "Thêm kịch bản khác",
    description: "Tạo thêm các kịch bản với thông số khác nhau để có cái nhìn toàn diện hơn.",
    action: "Thêm kịch bản",
    icon: <Plus className="h-5 w-5" />,
    type: "secondary",
    priority: 4,
    condition: (p) => p.scenarios.length >= 1 && p.scenarios.length < 5,
    onAction: props.onCalculateNew,
  },
  {
    id: "optimize-existing",
    title: "Tối ưu hóa kịch bản hiện tại",
    description: "Điều chỉnh các thông số để cải thiện kết quả đầu tư.",
    action: "Tối ưu hóa",
    icon: <TrendingUp className="h-5 w-5" />,
    type: "info",
    priority: 5,
    condition: (p) => p.scenarios.length >= 1,
    onAction: props.onCalculateNew,
  },
];

// ===== UTILITY FUNCTIONS =====
const getScenarioType = (scenario: CalculationResultWithSale): "buy_now" | "buy_future" | "standard" => {
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

  return "standard";
};

const getProgressStatus = (props: UserFlowGuidanceProps) => {
  const hasBuyNow = props.scenarios.some(s => getScenarioType(s) === "buy_now");
  const hasFuture = props.scenarios.some(s => getScenarioType(s) === "buy_future");
  
  if (!hasBuyNow && !hasFuture) return { step: 1, total: 3, label: "Bắt đầu phân tích" };
  if (hasBuyNow && !hasFuture) return { step: 2, total: 3, label: "Tạo kịch bản tương lai" };
  if (hasBuyNow && hasFuture) return { step: 3, total: 3, label: "So sánh và quyết định" };
  
  return { step: 1, total: 3, label: "Bắt đầu phân tích" };
};

const getMotivationalMessage = (props: UserFlowGuidanceProps): string => {
  const { scenarios, hasCalculatedBuyNow, hasFutureScenarios } = props;
  
  if (scenarios.length === 0) {
    return "🚀 Hãy bắt đầu hành trình đầu tư thông minh của bạn!";
  }
  
  if (hasCalculatedBuyNow && !hasFutureScenarios) {
    return "📈 Tuyệt vời! Giờ hãy khám phá các cơ hội trong tương lai.";
  }
  
  if (hasCalculatedBuyNow && hasFutureScenarios) {
    return "🎯 Hoàn hảo! Bạn đã có đầy đủ thông tin để đưa ra quyết định sáng suốt.";
  }
  
  return "💡 Tiếp tục khám phá để tối ưu hóa khoản đầu tư của bạn!";
};

// ===== MAIN COMPONENT =====
export default function UserFlowGuidance({
  scenarios,
  hasCalculatedBuyNow,
  hasFutureScenarios,
  onCreateFutureScenario,
  onCalculateNew,
  onViewComparison,
  className = "",
}: UserFlowGuidanceProps) {
  // Get applicable guidance steps
  const guidanceSteps = createGuidanceSteps({
    scenarios,
    hasCalculatedBuyNow,
    hasFutureScenarios,
    onCreateFutureScenario,
    onCalculateNew,
    onViewComparison,
  }).filter(step => step.condition({
    scenarios,
    hasCalculatedBuyNow,
    hasFutureScenarios,
    onCreateFutureScenario,
    onCalculateNew,
    onViewComparison,
  })).sort((a, b) => a.priority - b.priority);

  // Get progress status
  const progress = getProgressStatus({
    scenarios,
    hasCalculatedBuyNow,
    hasFutureScenarios,
    onCreateFutureScenario,
    onCalculateNew,
    onViewComparison,
  });

  // Get motivational message
  const motivationalMessage = getMotivationalMessage({
    scenarios,
    hasCalculatedBuyNow,
    hasFutureScenarios,
    onCreateFutureScenario,
    onCalculateNew,
    onViewComparison,
  });

  // Don't show if no guidance needed
  if (guidanceSteps.length === 0) {
    return null;
  }

  const primarySteps = guidanceSteps.filter(s => s.type === "primary");
  const secondarySteps = guidanceSteps.filter(s => s.type === "secondary");
  const infoSteps = guidanceSteps.filter(s => s.type === "info");

  return (
    <Card className={`border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
      <CardContent className="p-6">
        {/* Header with Progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Hướng dẫn tiếp theo</h3>
              <p className="text-sm text-blue-700">{motivationalMessage}</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Bước {progress.step}/{progress.total}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-blue-600 mb-1">
            <span>Tiến độ</span>
            <span>{Math.round((progress.step / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.step / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-1">{progress.label}</p>
        </div>

        {/* Primary Actions */}
        {primarySteps.length > 0 && (
          <div className="space-y-3 mb-4">
            {primarySteps.map((step, index) => (
              <Alert key={step.id} className="border-blue-300 bg-white">
                {/* Icon - this will be in the first grid column */} 
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {step.icon}
                </div>
                {/* Content wrapper - this will be in the second grid column */} 
                <div className="col-start-2 flex flex-col gap-1">
                  <AlertTitle>{step.title}</AlertTitle>
                  <AlertDescription>{step.description}</AlertDescription>
                  <Button
                    onClick={step.onAction}
                    className="bg-blue-600 hover:bg-blue-700 text-white self-end mt-2" 
                    disabled={!step.onAction}
                  >
                    {step.action}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Secondary Actions */}
        {secondarySteps.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Tùy chọn bổ sung</h4>
            {secondarySteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 flex-1">
                  <div className="text-blue-600 flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-blue-900">{step.title}</span>
                    <p className="text-xs text-blue-600 mt-1 truncate">{step.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={step.onAction}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  disabled={!step.onAction}
                >
                  {step.action}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Info Tips */}
        {infoSteps.length > 0 && scenarios.length > 0 && (
          <div className="pt-4 border-t border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Gợi ý</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {infoSteps.slice(0, 2).map((step) => (
                <Button
                  key={step.id}
                  variant="ghost"
                  size="sm"
                  onClick={step.onAction}
                  className="justify-start text-blue-700 hover:bg-blue-100 h-auto p-3 w-full"
                  disabled={!step.onAction}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {step.icon}
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium truncate">{step.title}</div>
                      <div className="text-xs opacity-80 truncate">{step.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Achievement Message */}
        {hasCalculatedBuyNow && hasFutureScenarios && scenarios.length >= 2 && (
          <Alert className="mt-4 border-green-300 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Xuất sắc!</strong> Bạn đã hoàn thành phân tích so sánh cơ bản. 
              Giờ bạn có thể đưa ra quyết định đầu tư dựa trên dữ liệu chi tiết.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}