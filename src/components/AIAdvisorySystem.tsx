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
} from "lucide-react";

import { CalculationResult, RealEstateInputs } from "@/types/real-estate";
import { formatVND, formatPercent } from "@/lib/financial-utils";
import { calculateRealEstateInvestment } from "@/lib/real-estate-calculator";

interface AIAdvisorySystemProps {
  result: CalculationResult;
  onScenarioGenerated?: (scenarios: ScenarioAnalysis) => void;
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

export default function AIAdvisorySystem({ result, onScenarioGenerated }: AIAdvisorySystemProps) {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [riskAssessment, setRiskAssessment] = React.useState<RiskAssessment | null>(null);
  const [scenarioAnalysis, setScenarioAnalysis] = React.useState<ScenarioAnalysis | null>(null);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [activeSection, setActiveSection] = React.useState<string>("overview");

  // AI RISK ASSESSMENT ENGINE
  const analyzeRisks = React.useCallback((inputs: RealEstateInputs, steps: any): RiskAssessment => {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let factorCount = 0;

    // 1. Loan Ratio Analysis
    const loanRatio = inputs.tyLeVay || 0;
    if (loanRatio > 85) {
      factors.push({
        type: "LOAN_RATIO",
        severity: "HIGH",
        description: `Tỷ lệ vay ${loanRatio.toFixed(1)}% rất cao`,
        impact: "Rủi ro thanh khoản cao, áp lực trả nợ lớn nếu thu nhập giảm",
        mitigation: "Tăng vốn tự có xuống dưới 80%, hoặc chọn BĐS giá thấp hơn"
      });
      totalScore += 85;
    } else if (loanRatio > 70) {
      factors.push({
        type: "LOAN_RATIO",
        severity: "MEDIUM",
        description: `Tỷ lệ vay ${loanRatio.toFixed(1)}% ở mức trung bình`,
        impact: "Cần theo dõi sát khả năng trả nợ",
        mitigation: "Chuẩn bị quỹ dự phòng ít nhất 6 tháng chi phí"
      });
      totalScore += 60;
    }
    factorCount++;

    // 2. Cash Flow Analysis
    const monthlyCashFlow = steps.dongTienRongBDS;
    const monthlyPayment = steps.tienTraNHThang || 0;
    const cashFlowRatio = monthlyPayment > 0 ? (monthlyCashFlow / monthlyPayment) * 100 : 0;
    
    if (monthlyCashFlow < 0) {
      factors.push({
        type: "CASH_FLOW",
        severity: "HIGH",
        description: "Dòng tiền âm - cần bỏ thêm tiền hàng tháng",
        impact: `Thiếu hụt ${formatVND(Math.abs(monthlyCashFlow))}/tháng`,
        mitigation: "Tăng giá thuê, giảm chi phí, hoặc trả nợ trước hạn"
      });
      totalScore += 90;
    } else if (cashFlowRatio < 10) {
      factors.push({
        type: "CASH_FLOW",
        severity: "MEDIUM",
        description: "Dòng tiền dương nhưng mỏng",
        impact: "Ít buffer cho biến động bất ngờ",
        mitigation: "Tạo quỹ dự phòng từ dòng tiền dương"
      });
      totalScore += 70;
    }
    factorCount++;

    // 3. Rental Yield Analysis
    const rentalYield = result.rentalYield || 0;
    if (rentalYield < 4) {
      factors.push({
        type: "RENTAL_YIELD",
        severity: "HIGH",
        description: `Tỷ suất cho thuê ${rentalYield.toFixed(2)}% thấp`,
        impact: "Hiệu quả đầu tư không cao so với thị trường",
        mitigation: "Tìm BĐS có yield cao hơn hoặc đàm phán giá mua"
      });
      totalScore += 75;
    } else if (rentalYield < 6) {
      factors.push({
        type: "RENTAL_YIELD",
        severity: "MEDIUM",
        description: `Tỷ suất cho thuê ${rentalYield.toFixed(2)}% trung bình`,
        impact: "Cạnh tranh với các kênh đầu tư khác",
        mitigation: "Cân nhắc tiềm năng tăng giá khu vực"
      });
      totalScore += 50;
    }
    factorCount++;

    // 4. Interest Rate Sensitivity
    const interestSpread = (inputs.laiSuatThaNoi || 0) - (inputs.laiSuatUuDai || 0);
    if (interestSpread > 3) {
      factors.push({
        type: "INTEREST_RATE",
        severity: "HIGH",
        description: `Chênh lệch lãi suất ${interestSpread}% lớn`,
        impact: "Sốc thanh toán khi hết ưu đãi",
        mitigation: "Chuẩn bị refinance hoặc trả nợ trước hạn"
      });
      totalScore += 70;
    }
    factorCount++;

    // 5. Vacancy Risk
    const occupancyRate = inputs.tyLeLapDay || 95;
    if (occupancyRate < 90) {
      factors.push({
        type: "VACANCY",
        severity: "MEDIUM",
        description: `Tỷ lệ lấp đầy ${occupancyRate}% thấp`,
        impact: "Thu nhập không ổn định",
        mitigation: "Cải thiện chất lượng BĐS, marketing tốt hơn"
      });
      totalScore += 60;
    }
    factorCount++;

    const avgScore = factorCount > 0 ? totalScore / factorCount : 20;
    
    // Determine overall risk level
    let level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    if (avgScore > 80) level = "CRITICAL";
    else if (avgScore > 60) level = "HIGH";
    else if (avgScore > 40) level = "MEDIUM";
    else level = "LOW";

    // Generate recommendations
    const recommendations: string[] = [];
    if (level === "CRITICAL" || level === "HIGH") {
      recommendations.push("🚨 Cân nhắc không đầu tư hoặc điều chỉnh mạnh các thông số");
      recommendations.push("💰 Tăng vốn tự có để giảm tỷ lệ vay");
      recommendations.push("🏠 Tìm BĐS có tỷ suất cho thuê cao hơn");
    } else if (level === "MEDIUM") {
      recommendations.push("⚠️ Đầu tư được nhưng cần quản lý rủi ro cẩn thận");
      recommendations.push("💡 Tạo quỹ dự phòng ít nhất 6 tháng chi phí");
      recommendations.push("📈 Theo dõi sát thị trường để điều chỉnh kịp thời");
    } else {
      recommendations.push("✅ Rủi ro thấp, phù hợp đầu tư");
      recommendations.push("🎯 Tập trung vào tối ưu hóa lợi nhuận");
      recommendations.push("🔄 Cân nhắc scale up với các BĐS tương tự");
    }

    return {
      level,
      score: avgScore,
      factors,
      recommendations
    };
  }, [result]);

  // AI SCENARIO GENERATOR
  const generateScenarios = React.useCallback((baseInputs: RealEstateInputs, baseResult: CalculationResult): ScenarioAnalysis => {
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
      // Add major repair fund
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

    // Vacancy Stress Test
    let testOccupancy = baseInputs.tyLeLapDay || 95;
    while (testOccupancy > 50) {
      testInputs = { ...baseInputs, tyLeLapDay: testOccupancy };
      const testResult = calculateRealEstateInvestment(testInputs);
      if (testResult.steps.dongTienRongBDS < 0) {
        stressTests.push({
          metric: "Tỷ lệ lấp đầy",
          breakingPoint: testOccupancy,
          currentSafety: (baseInputs.tyLeLapDay || 95) - testOccupancy,
          recommendation: (baseInputs.tyLeLapDay || 95) - testOccupancy < 10
            ? "🚨 Rủi ro trống nhà cao! Cần kế hoạch marketing"
            : "✅ An toàn với biến động vacancy"
        });
        break;
      }
      testOccupancy -= 5;
    }

    return {
      baseCase: {
        name: "Kịch bản cơ sở",
        inputs: baseInputs,
        result: baseResult,
        probability: 60,
        description: "Dựa trên thông số thực tế bạn nhập"
      },
      bestCase: {
        name: "Kịch bản tốt đẹp",
        inputs: bestInputs,
        result: bestResult,
        probability: 20,
        description: "Thuê cao hơn, lãi suất thấp, ít chi phí phát sinh"
      },
      worstCase: {
        name: "Kịch bản tồi tệ",
        inputs: worstInputs,
        result: worstResult,
        probability: 20,
        description: "Khó cho thuê, lãi suất cao, nhiều sửa chữa"
      },
      stressTests
    };
  }, []);

  // AI CHECKLIST GENERATOR
  const generateChecklist = React.useCallback((inputs: RealEstateInputs, result: CalculationResult): ChecklistItem[] => {
    const items: ChecklistItem[] = [];

    // Input Quality Checks
    const rentalYield = result.rentalYield || 0;
    items.push({
      id: "rental_yield_reality",
      category: "INPUT_QUALITY",
      title: "Tỷ suất cho thuê thực tế",
      description: `Yield ${rentalYield.toFixed(2)}% có phù hợp với thị trường?`,
      status: rentalYield >= 5 ? "PASS" : rentalYield >= 4 ? "WARNING" : "FAIL",
      recommendation: rentalYield < 4 ? "Kiểm tra lại giá thuê thị trường trên Batdongsan.com.vn" : undefined
    });

    items.push({
      id: "interest_rate_conservative",
      category: "INPUT_QUALITY", 
      title: "Lãi suất thận trọng",
      description: "Đã tính lãi suất bi quan sau ưu đãi?",
      status: (inputs.laiSuatThaNoi || 0) - (inputs.laiSuatUuDai || 0) >= 2 ? "PASS" : "WARNING",
      recommendation: "Nên dự phòng lãi suất thả nổi cao hơn 2-3% so với ưu đãi"
    });

    // Risk Management Checks
    items.push({
      id: "loan_ratio_safe",
      category: "RISK_MANAGEMENT",
      title: "Tỷ lệ vay an toàn", 
      description: `Tỷ lệ vay ${(inputs.tyLeVay || 0).toFixed(1)}%`,
      status: (inputs.tyLeVay || 0) <= 70 ? "PASS" : (inputs.tyLeVay || 0) <= 80 ? "WARNING" : "FAIL",
      recommendation: (inputs.tyLeVay || 0) > 80 ? "Giảm tỷ lệ vay xuống dưới 80% để giảm rủi ro" : undefined
    });

    items.push({
      id: "emergency_fund",
      category: "RISK_MANAGEMENT",
      title: "Quỹ dự phòng",
      description: "Có đủ tiền dự phòng 6 tháng chi phí?",
      status: "WARNING", // Can't check this automatically
      recommendation: "Chuẩn bị quỹ dự phòng ít nhất 6 tháng chi phí vận hành"
    });

    // Market Reality Checks
    items.push({
      id: "vacancy_realistic",
      category: "MARKET_REALITY",
      title: "Tỷ lệ trống nhà thực tế",
      description: `Lấp đầy ${inputs.tyLeLapDay || 95}%`,
      status: (inputs.tyLeLapDay || 95) <= 95 ? "PASS" : "WARNING",
      recommendation: "Nên tính 1-2 tháng trống/năm để thực tế"
    });

    // Personal Fit Checks
    const cashFlow = result.steps.dongTienRongBDS;
    items.push({
      id: "cash_flow_comfort",
      category: "PERSONAL_FIT",
      title: "Thoải mái với dòng tiền",
      description: cashFlow >= 0 ? "Dòng tiền dương" : "Cần bỏ thêm tiền hàng tháng",
      status: cashFlow > 2000000 ? "PASS" : cashFlow >= 0 ? "WARNING" : "FAIL",
      recommendation: cashFlow < 0 ? "Cân nhắc BĐS khác hoặc tăng vốn tự có" : undefined
    });

    return items;
  }, []);

  // Main Analysis Function
  const runAIAnalysis = React.useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const risks = analyzeRisks(result.inputs, result.steps);
      const scenarios = generateScenarios(result.inputs, result);
      const checklistItems = generateChecklist(result.inputs, result);
      
      setRiskAssessment(risks);
      setScenarioAnalysis(scenarios);
      setChecklist(checklistItems);
      
      if (onScenarioGenerated) {
        onScenarioGenerated(scenarios);
      }
    } catch (error) {
      console.error("AI Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [result, analyzeRisks, generateScenarios, generateChecklist, onScenarioGenerated]);

  // Auto-run analysis on mount
  React.useEffect(() => {
    runAIAnalysis();
  }, [runAIAnalysis]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return "text-green-600 bg-green-50 border-green-200";
      case "MEDIUM": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "HIGH": return "text-orange-600 bg-orange-50 border-orange-200";
      case "CRITICAL": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getChecklistStatusIcon = (status: string) => {
    switch (status) {
      case "PASS": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "WARNING": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "FAIL": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

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
              <p className="text-purple-600">Đánh giá rủi ro • Tạo kịch bản • Kiểm tra checklist</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <div className="font-semibold">Kịch Bản Tương Lai</div>
                  <div className="text-xs opacity-70">3 Scenarios + Stress Test</div>
                </div>
              </Button>

              <Button
                variant={activeSection === "checklist" ? "default" : "outline"}
                onClick={() => setActiveSection("checklist")}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <CheckCircle2 className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Checklist Vàng</div>
                  <div className="text-xs opacity-70">Best Practices Guide</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={runAIAnalysis}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <RefreshCw className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Phân Tích Lại</div>
                  <div className="text-xs opacity-70">Re-run AI Analysis</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        {activeSection === "risk" && riskAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Đánh Giá Rủi Ro AI
              </CardTitle>
              <CardDescription>
                Phân tích đa chiều các yếu tố rủi ro trong đầu tư của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Risk Score */}
              <div className={`p-6 rounded-lg border-2 ${getRiskColor(riskAssessment.level)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Mức Độ Rủi Ro: {riskAssessment.level}</h3>
                    <p className="text-sm opacity-80">Điểm số tổng thể: {riskAssessment.score.toFixed(0)}/100</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{riskAssessment.score.toFixed(0)}</div>
                    <div className="text-sm">Risk Score</div>
                  </div>
                </div>
                <Progress value={riskAssessment.score} className="mb-4" />
                <div className="space-y-2">
                  <h4 className="font-semibold">🎯 Khuyến nghị chính:</h4>
                  {riskAssessment.recommendations.map((rec, index) => (
                    <p key={index} className="text-sm">{rec}</p>
                  ))}
                </div>
              </div>

              {/* Risk Factors Detail */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Phân Tích Chi Tiết Từng Yếu Tố:</h4>
                {riskAssessment.factors.map((factor, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-400">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold">{factor.description}</h5>
                          <Badge variant={factor.severity === "HIGH" ? "destructive" : factor.severity === "MEDIUM" ? "secondary" : "default"}>
                            {factor.severity === "HIGH" ? "Cao" : factor.severity === "MEDIUM" ? "Trung bình" : "Thấp"}
                          </Badge>
                        </div>
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
            </CardContent>
          </Card>
        )}

        {/* Scenario Analysis */}
        {activeSection === "scenarios" && scenarioAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Phân Tích Kịch Bản & Stress Test
              </CardTitle>
              <CardDescription>
                AI tạo ra 3 kịch bản khác nhau và tìm "điểm gãy" của đầu tư
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Three Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[scenarioAnalysis.worstCase, scenarioAnalysis.baseCase, scenarioAnalysis.bestCase].map((scenario, index) => {
                  const isWorst = index === 0;
                  const isBase = index === 1;
                  const isBest = index === 2;
                  
                  return (
                    <Card key={scenario.name} className={`border-2 ${
                      isWorst ? "border-red-200 bg-red-50" :
                      isBase ? "border-blue-200 bg-blue-50" :
                      "border-green-200 bg-green-50"
                    }`}>
                      <CardContent className="pt-4">
                        <div className="text-center mb-4">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            {isWorst && <TrendingDown className="h-5 w-5 text-red-600" />}
                            {isBase && <Activity className="h-5 w-5 text-blue-600" />}
                            {isBest && <TrendingUp className="h-5 w-5 text-green-600" />}
                            <h4 className="font-bold">{scenario.name}</h4>
                          </div>
                          <Badge variant="outline" className="mb-2">
                            Xác suất: {scenario.probability}%
                          </Badge>
                          <p className="text-xs text-muted-foreground">{scenario.description}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Dòng tiền/tháng</div>
                            <div className={`text-xl font-bold ${
                              scenario.result.steps.dongTienRongBDS >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatVND(scenario.result.steps.dongTienRongBDS)}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">ROI năm</div>
                            <div className={`text-lg font-semibold ${
                              scenario.result.roiHangNam >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {scenario.result.roiHangNam.toFixed(1)}%
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>Tiền thuê:</span>
                              <span>{formatVND(scenario.inputs.tienThueThang || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Lãi suất:</span>
                              <span>{scenario.inputs.laiSuatThaNoi}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Lấp đầy:</span>
                              <span>{scenario.inputs.tyLeLapDay}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Stress Test Results */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Stress Test - Tìm "Điểm Gãy"
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarioAnalysis.stressTests.map((test, index) => (
                    <Card key={index} className="border-l-4 border-l-yellow-400">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">{test.metric}</h5>
                          <Badge variant="outline">Điểm gãy</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Điểm gãy:</span>
                            <span className="font-semibold text-red-600">
                              {test.metric.includes("Lãi suất") ? `${test.breakingPoint}%` : `${test.breakingPoint}%`}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Khoảng an toàn:</span>
                            <span className="font-semibold text-green-600">
                              {test.currentSafety.toFixed(1)}{test.metric.includes("Lãi suất") ? "%" : "%"}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
                            {test.recommendation}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Golden Checklist */}
        {activeSection === "checklist" && checklist.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Checklist Vàng - Best Practices
              </CardTitle>
              <CardDescription>
                Kiểm tra xem bạn đã follow best practices chưa theo chuẩn chuyên gia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {["INPUT_QUALITY", "RISK_MANAGEMENT", "MARKET_REALITY", "PERSONAL_FIT"].map(category => {
                  const categoryItems = checklist.filter(item => item.category === category);
                  const categoryName = {
                    "INPUT_QUALITY": "🎯 Chất Lượng Dữ Liệu",
                    "RISK_MANAGEMENT": "🛡️ Quản Lý Rủi Ro", 
                    "MARKET_REALITY": "📊 Thực Tế Thị Trường",
                    "PERSONAL_FIT": "👤 Phù Hợp Cá Nhân"
                  }[category];

                  const passCount = categoryItems.filter(item => item.status === "PASS").length;
                  const totalCount = categoryItems.length;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg">{categoryName}</h4>
                        <Badge variant={passCount === totalCount ? "default" : passCount > totalCount/2 ? "secondary" : "destructive"}>
                          {passCount}/{totalCount} ✓
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {categoryItems.map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="mt-0.5">
                              {getChecklistStatusIcon(item.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="font-semibold">{item.title}</h5>
                                <Badge variant={
                                  item.status === "PASS" ? "default" :
                                  item.status === "WARNING" ? "secondary" : "destructive"
                                } className="text-xs">
                                  {item.status === "PASS" ? "✓" : item.status === "WARNING" ? "⚠" : "✗"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                              {item.recommendation && (
                                <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border-l-4 border-yellow-400">
                                  💡 {item.recommendation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}