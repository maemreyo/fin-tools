"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Brain,
  TrendingDown,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calculator,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Gauge,
  Search,
  Calendar,
  Rocket,
  ArrowRight,
  Clock,
  DollarSign,
  Settings,
  PlayCircle,
  TrendingDownIcon
} from "lucide-react";

import { CalculationResult, RealEstateInputs } from "@/types/real-estate";
import { formatVND, formatPercent } from "@/lib/financial-utils";
import { calculateRealEstateInvestment } from "@/lib/real-estate-calculator";



// ===== ENHANCED PROPS INTERFACE =====
interface AIAdvisorySystemProps {
  result: CalculationResult;
}

interface RiskAssessment {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number; // 0-100
  factors: RiskFactor[];
  recommendations: string[];
}

interface RiskFactor {
  type: "LOAN_RATIO" | "CASH_FLOW" | "RENTAL_YIELD" | "INTEREST_RATE" | "VACANCY" | "INCOME_STABILITY";
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  impact: string;
  mitigation: string;
}

interface StressTestResult {
  metric: string;
  breakingPoint: number;
  currentSafety: number; // How far from breaking point
  recommendation: string;
}

interface ScenarioData {
  name: string;
  inputs: RealEstateInputs;
  result: CalculationResult;
  probability: number;
  description: string;
}

interface ScenarioAnalysis {
  baseCase: ScenarioData;
  bestCase: ScenarioData;
  worstCase: ScenarioData;
  stressTests: StressTestResult[];
}

interface ChecklistItem {
  id: string;
  category: "INPUT_QUALITY" | "RISK_MANAGEMENT" | "MARKET_REALITY" | "PERSONAL_FIT";
  title: string;
  description: string;
  status: "PASS" | "WARNING" | "FAIL";
  recommendation?: string;
}


// ===== MAIN COMPONENT =====
export const AIAdvisorySystem: React.FC<AIAdvisorySystemProps> = ({ result }) => {
  // ===== STATE =====
  const [activeSection, setActiveSection] = useState<"risk" | "scenarios" | "checklist">("risk");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenarioAnalysis, setScenarioAnalysis] = useState<ScenarioAnalysis | null>(null);



  // ===== RISK ASSESSMENT (Existing functionality) =====
  const riskAssessment = useMemo((): RiskAssessment => {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let factorCount = 0;

    // Loan ratio risk
    const loanRatio = (result.inputs.tyLeVay || 0);
    if (loanRatio > 80) {
      factors.push({
        type: "LOAN_RATIO",
        severity: "HIGH",
        description: `Tỷ lệ vay ${loanRatio}% rất cao`,
        impact: "Rủi ro thanh khoản cao, áp lực trả nợ lớn",
        mitigation: "Cân nhắc giảm tỷ lệ vay xuống dưới 80% hoặc tăng vốn tự có"
      });
      totalScore += 80;
    } else if (loanRatio > 70) {
      factors.push({
        type: "LOAN_RATIO",
        severity: "MEDIUM",
        description: `Tỷ lệ vay ${loanRatio}% ở mức trung bình`,
        impact: "Có thể gặp khó khăn khi lãi suất tăng",
        mitigation: "Theo dõi chặt chẽ diễn biến lãi suất thị trường"
      });
      totalScore += 60;
    } else {
      totalScore += 30;
    }
    factorCount++;

    // Cash flow risk
    const monthlyCashFlow = result.steps.dongTienRongBDS;
    if (monthlyCashFlow < 0) {
      factors.push({
        type: "CASH_FLOW",
        severity: "HIGH", 
        description: `Dòng tiền âm ${formatVND(monthlyCashFlow)}/tháng`,
        impact: "Phải bù tiền hàng tháng, áp lực tài chính",
        mitigation: "Tăng tiền thuê, giảm chi phí, hoặc trả nợ trước hạn"
      });
      totalScore += 90;
    } else if (monthlyCashFlow < 2000000) {
      factors.push({
        type: "CASH_FLOW",
        severity: "MEDIUM",
        description: `Dòng tiền thấp ${formatVND(monthlyCashFlow)}/tháng`,
        impact: "Ít dư địa cho các chi phí phát sinh",
        mitigation: "Dự phòng quỹ sửa chữa và chi phí bất ngờ"
      });
      totalScore += 50;
    } else {
      totalScore += 20;
    }
    factorCount++;

    // ROI assessment
    const roi = result.roiHangNam || 0;
    if (roi < 5) {
      factors.push({
        type: "RENTAL_YIELD",
        severity: "HIGH",
        description: `ROI thấp ${roi.toFixed(1)}%/năm`,
        impact: "Hiệu quả đầu tư kém, không bù được lạm phát",
        mitigation: "Cân nhắc chọn BDS có tiềm năng tăng giá hoặc tăng tiền thuê"
      });
      totalScore += 70;
    } else if (roi < 8) {
      factors.push({
        type: "RENTAL_YIELD", 
        severity: "MEDIUM",
        description: `ROI ở mức trung bình ${roi.toFixed(1)}%/năm`,
        impact: "Hiệu quả đầu tư chấp nhận được nhưng chưa tối ưu",
        mitigation: "Tìm cách tối ưu hóa để nâng ROI lên 10%+"
      });
      totalScore += 40;
    } else {
      totalScore += 10;
    }
    factorCount++;

    const avgScore = totalScore / factorCount;
    let level: RiskAssessment["level"];
    let recommendations: string[] = [];

    if (avgScore >= 70) {
      level = "CRITICAL";
      recommendations = [
        "🚨 Đầu tư này có rủi ro rất cao",
        "🔄 Cân nhắc điều chỉnh cấu trúc tài chính",
        "💡 Tham khảo ý kiến chuyên gia tài chính"
      ];
    } else if (avgScore >= 50) {
      level = "HIGH";
      recommendations = [
        "⚠️ Cần theo dõi chặt chẽ các yếu tố rủi ro",
        "📊 Lập kế hoạch dự phòng rủi ro",
        "🎯 Tối ưu hóa để giảm rủi ro"
      ];
    } else if (avgScore >= 30) {
      level = "MEDIUM";
      recommendations = [
        "✅ Đầu tư ở mức rủi ro chấp nhận được",
        "📈 Có thể tối ưu để tăng lợi nhuận",
        "🔄 Cân nhắc scale up với các BĐS tương tự"
      ];
    } else {
      level = "LOW";
      recommendations = [
        "🎉 Đầu tư tốt với rủi ro thấp",
        "💎 Cân nhắc tăng quy mô đầu tư",
        "📊 Chia sẻ kinh nghiệm với cộng đồng"
      ];
    }

    return {
      level,
      score: 100 - avgScore, // Invert score for better UX
      factors,
      recommendations
    };
  }, [result]);

  // ===== SCENARIO ANALYSIS (Existing functionality) =====
  const generateScenarios = useCallback((baseInputs: RealEstateInputs, baseResult: CalculationResult): ScenarioAnalysis => {
    // Best Case Scenario
    const bestInputs: RealEstateInputs = {
      ...baseInputs,
      tienThueThang: (baseInputs.tienThueThang || 0) * 1.15, // 15% higher rent
      laiSuatThaNoi: (baseInputs.laiSuatThaNoi || 0) - 1, // 1% lower interest
      tyLeLapDay: Math.min(98, (baseInputs.tyLeLapDay || 95) + 3), // Better occupancy
      phiBaoTri: Math.max(0.5, (baseInputs.phiBaoTri || 1) - 0.3), // Lower maintenance
    };

    // Worst Case Scenario  
    const worstInputs: RealEstateInputs = {
      ...baseInputs,
      tienThueThang: (baseInputs.tienThueThang || 0) * 0.85, // 15% lower rent
      laiSuatThaNoi: (baseInputs.laiSuatThaNoi || 0) + 2, // 2% higher interest
      tyLeLapDay: Math.max(80, (baseInputs.tyLeLapDay || 95) - 10), // 10% vacancy
      phiBaoTri: (baseInputs.phiBaoTri || 1) + 1, // Higher maintenance
      duPhongCapEx: (baseInputs.duPhongCapEx || 1) + 1,
    };

    const bestResult = calculateRealEstateInvestment(bestInputs);
    const worstResult = calculateRealEstateInvestment(worstInputs);

    // Stress Tests
    const stressTests: StressTestResult[] = [];

    // Interest Rate Stress Test
    let testRate = baseInputs.laiSuatThaNoi || 10;
    let testInputs = { ...baseInputs };
    while (testRate < 20) {
      testInputs.laiSuatThaNoi = testRate;
      const testResult = calculateRealEstateInvestment(testInputs);
      if (testResult.steps.dongTienRongBDS < 0) {
        stressTests.push({
          metric: "Lãi suất thả nổi",
          breakingPoint: testRate,
          currentSafety: testRate - (baseInputs.laiSuatThaNoi || 10),
          recommendation: testRate - (baseInputs.laiSuatThaNoi || 10) < 2 
            ? "🚨 Rủi ro cao! Chuẩn bị kế hoạch khi lãi suất tăng"
            : "⚠️ Theo dõi lãi suất thị trường"
        });
        break;
      }
      testRate += 0.5;
    }

    return {
      baseCase: {
        name: "Kịch bản cơ sở",
        inputs: baseInputs,
        result: baseResult,
        probability: 60,
        description: "Dựa trên thông số hiện tại"
      },
      bestCase: {
        name: "Kịch bản tốt nhất",
        inputs: bestInputs,
        result: bestResult,
        probability: 20,
        description: "Thị trường thuận lợi, tối ưu hóa tốt"
      },
      worstCase: {
        name: "Kịch bản xấu nhất",
        inputs: worstInputs,
        result: worstResult,
        probability: 20,
        description: "Thị trường khó khăn, rủi ro xảy ra"
      },
      stressTests
    };
  }, []);

  // ===== EVENT HANDLERS =====
  const handleAIAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const analysis = generateScenarios(result.inputs, result);
      setScenarioAnalysis(analysis);
      setIsAnalyzing(false);
    }, 2000);
  }, [result, generateScenarios]);

  // ===== UTILITY FUNCTIONS =====
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "LOW": return "text-green-600 bg-green-50 border-green-200";
      case "MEDIUM": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "HIGH": return "text-orange-600 bg-orange-50 border-orange-200";
      case "CRITICAL": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };



  // ===== LOADING STATE =====
  if (isAnalyzing) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-800">AI đang phân tích...</h3>
              <p className="text-purple-600">Đánh giá rủi ro • Tạo kịch bản • Phân tích thông minh</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* AI Overview */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="h-6 w-6" />
              Phân Tích Thông Minh AI
            </CardTitle>
            <CardDescription>
              Đánh giá toàn diện đầu tư của bạn từ góc độ chuyên gia với AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <Button
                variant={activeSection === "risk" ? "default" : "outline"}
                onClick={() => setActiveSection("risk")}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Shield className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Phân Tích Rủi Ro</div>
                  <div className="text-xs opacity-70">AI Risk Assessment</div>
                </div>
              </Button>

              <Button
                variant={activeSection === "scenarios" ? "default" : "outline"}
                onClick={() => setActiveSection("scenarios")}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <BarChart3 className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Kịch Bản & Stress Test</div>
                  <div className="text-xs opacity-70">Multi-Scenario Analysis</div>
                </div>
              </Button>

              <Button
                variant={activeSection === "checklist" ? "default" : "outline"}
                onClick={() => setActiveSection("checklist")}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <CheckCircle2 className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Checklist Đầu Tư</div>
                  <div className="text-xs opacity-70">Investment Readiness</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>




        {/* Risk Analysis (Existing) */}
        {activeSection === "risk" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Đánh Giá Rủi Ro Toàn Diện
              </CardTitle>
              <CardDescription>
                AI phân tích {riskAssessment.factors.length} yếu tố rủi ro chính
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Score */}
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getRiskLevelColor(riskAssessment.level)}`}>
                  <div className="text-2xl font-bold">{riskAssessment.score}/100</div>
                  <div>
                    <div className="font-semibold">Điểm Đánh Giá</div>
                    <div className="text-sm">
                      Mức rủi ro: {riskAssessment.level === "LOW" ? "Thấp" : 
                                   riskAssessment.level === "MEDIUM" ? "Trung bình" :
                                   riskAssessment.level === "HIGH" ? "Cao" : "Rất cao"}
                    </div>
                  </div>
                </div>
                <Progress value={riskAssessment.score} className="w-full max-w-md mx-auto" />
              </div>

              {/* Risk Factors */}
              <div className="space-y-4">
                <h4 className="font-semibold">Phân Tích Chi Tiết Rủi Ro</h4>
                {riskAssessment.factors.map((factor, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-400">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <h5 className="font-semibold">{factor.description}</h5>
                        </div>
                        <Badge variant={factor.severity === "HIGH" ? "destructive" : factor.severity === "MEDIUM" ? "secondary" : "default"}>
                          {factor.severity === "HIGH" ? "Cao" : factor.severity === "MEDIUM" ? "Trung bình" : "Thấp"}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-red-600">Tác động: </span>
                          {factor.impact}
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Giải pháp: </span>
                          {factor.mitigation}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h4 className="font-semibold">Khuyến Nghị Từ AI</h4>
                {riskAssessment.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">{rec}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Scenarios Button */}
        {!scenarioAnalysis && activeSection === "scenarios" && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Brain className="h-16 w-16 mx-auto text-purple-600" />
                <div>
                  <h3 className="text-xl font-bold">Phân Tích Kịch Bản Thông Minh</h3>
                  <p className="text-muted-foreground">
                    AI sẽ tạo 3 kịch bản và chạy stress test để đánh giá độ bền vững
                  </p>
                </div>
                <Button onClick={handleAIAnalysis} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Brain className="h-4 w-4 mr-2" />
                  Bắt Đầu Phân Tích AI
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </TooltipProvider>
  );
};