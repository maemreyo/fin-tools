"use client";

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Crown,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Target,
  Zap,
  Award,
  ThumbsUp,
  ThumbsDown,
  Eye,
  BarChart3,
  PieChart,
  Gauge,
  DollarSign,
  Home,
  Calendar,
  Percent,
  Users,
  Building,
  Factory,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  FlameIcon as Fire,
  Snowflake,
  Lightbulb,
  AlertCircle,
  Info,
} from 'lucide-react';

import { CalculationResult } from '@/types/real-estate';
import { formatVND, formatPercent } from '@/lib/financial-utils';

// ===== ENHANCED INTERFACES =====
interface EnhancedVisualComparisonProps {
  scenarios: CalculationResult[];
  onSelectScenario?: (scenario: CalculationResult) => void;
  onRemoveScenario?: (index: number) => void;
}

interface PropertyScore {
  scenarioIndex: number;
  scenario: CalculationResult;
  scores: {
    profitability: number;    // 0-100
    cashFlow: number;        // 0-100
    risk: number;            // 0-100 (higher = safer)
    financing: number;       // 0-100
    overall: number;         // 0-100
  };
  rank: number;
  strengths: HighlightItem[];
  weaknesses: HighlightItem[];
  opportunities: HighlightItem[];
  threats: HighlightItem[];
}

interface HighlightItem {
  category: 'profitability' | 'risk' | 'financing' | 'timing' | 'market';
  title: string;
  value: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  color: string;
}

interface ComparisonMetric {
  key: string;
  name: string;
  category: 'financial' | 'risk' | 'performance';
  getValue: (scenario: CalculationResult) => number;
  format: (value: number) => string;
  higherIsBetter: boolean;
  description: string;
  weight: number; // For overall scoring
}

// ===== COMPARISON METRICS =====
const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: 'roi',
    name: 'ROI hàng năm',
    category: 'performance',
    getValue: (s) => s.roiHangNam,
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    description: 'Tỷ lệ lợi nhuận trên vốn đầu tư',
    weight: 25
  },
  {
    key: 'cashFlow',
    name: 'Dòng tiền/tháng',
    category: 'financial',
    getValue: (s) => s.steps.dongTienRongBDS,
    format: (v) => formatVND(v),
    higherIsBetter: true,
    description: 'Dòng tiền ròng hàng tháng',
    weight: 20
  },
  {
    key: 'payback',
    name: 'Thời gian hoàn vốn',
    category: 'performance',
    getValue: (s) => s.paybackPeriod,
    format: (v) => v > 0 ? `${v.toFixed(1)} năm` : 'N/A',
    higherIsBetter: false,
    description: 'Thời gian thu hồi vốn đầu tư',
    weight: 15
  },
  {
    key: 'loanRatio',
    name: 'Tỷ lệ vay',
    category: 'risk',
    getValue: (s) => s.inputs.tyLeVay || 0,
    format: (v) => `${v}%`,
    higherIsBetter: false,
    description: 'Tỷ lệ vay so với giá trị BĐS',
    weight: 15
  },
  {
    key: 'rentalYield',
    name: 'Rental Yield',
    category: 'performance',
    getValue: (s) => s.rentalYield,
    format: (v) => formatPercent(v),
    higherIsBetter: true,
    description: 'Tỷ lệ lợi nhuận từ cho thuê',
    weight: 10
  },
  {
    key: 'interestRate',
    name: 'Lãi suất sau ưu đãi',
    category: 'financial',
    getValue: (s) => s.inputs.laiSuatThaNoi || 0,
    format: (v) => `${v}%`,
    higherIsBetter: false,
    description: 'Lãi suất thả nổi',
    weight: 10
  },
  {
    key: 'totalInvestment',
    name: 'Vốn đầu tư',
    category: 'financial',
    getValue: (s) => s.steps.tongVonBanDau,
    format: (v) => formatVND(v),
    higherIsBetter: false,
    description: 'Tổng vốn cần đầu tư ban đầu',
    weight: 5
  }
];

// ===== MAIN COMPONENT =====
export default function EnhancedVisualComparison({
  scenarios,
  onSelectScenario,
  onRemoveScenario
}: EnhancedVisualComparisonProps) {
  const [sortBy, setSortBy] = useState<'overall' | 'roi' | 'cashFlow' | 'risk'>('overall');
  const [showDetails, setShowDetails] = useState<{ [key: number]: boolean }>({});
  const [selectedMetric, setSelectedMetric] = useState<string>('roi');

  // ===== SCORING SYSTEM =====
  const propertyScores = useMemo((): PropertyScore[] => {
    if (scenarios.length === 0) return [];

    const scores = scenarios.map((scenario, index) => {
      // Calculate individual scores (0-100)
      const profitability = Math.min(100, Math.max(0, scenario.roiHangNam * 5)); // 20% ROI = 100 points
      const cashFlow = Math.min(100, Math.max(0, (scenario.steps.dongTienRongBDS + 5000000) / 100000)); // 5M+ = good
      const risk = Math.min(100, Math.max(0, 100 - (scenario.inputs.tyLeVay || 0))); // Lower loan ratio = safer
      const financing = Math.min(100, Math.max(0, 100 - (scenario.inputs.laiSuatThaNoi || 10) * 5)); // Lower interest = better
      
      const overall = (profitability * 0.3 + cashFlow * 0.25 + risk * 0.25 + financing * 0.2);

      // Generate SWOT analysis
      const strengths: HighlightItem[] = [];
      const weaknesses: HighlightItem[] = [];
      const opportunities: HighlightItem[] = [];
      const threats: HighlightItem[] = [];

      // Profitability Analysis
      if (scenario.roiHangNam > 15) {
        strengths.push({
          category: 'profitability',
          title: 'ROI xuất sắc',
          value: formatPercent(scenario.roiHangNam),
          description: 'Tỷ suất lợi nhuận vượt trội so với thị trường',
          impact: 'high',
          icon: <Crown className="h-4 w-4" />,
          color: 'text-yellow-600 bg-yellow-50'
        });
      } else if (scenario.roiHangNam < 8) {
        weaknesses.push({
          category: 'profitability',
          title: 'ROI thấp',
          value: formatPercent(scenario.roiHangNam),
          description: 'Tỷ suất lợi nhuận dưới mức kỳ vọng',
          impact: 'high',
          icon: <TrendingDown className="h-4 w-4" />,
          color: 'text-red-600 bg-red-50'
        });
      }

      // Cash Flow Analysis
      if (scenario.steps.dongTienRongBDS > 3000000) {
        strengths.push({
          category: 'profitability',
          title: 'Dòng tiền tích cực',
          value: formatVND(scenario.steps.dongTienRongBDS),
          description: 'Tạo dòng tiền ổn định hàng tháng',
          impact: 'high',
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'text-green-600 bg-green-50'
        });
      } else if (scenario.steps.dongTienRongBDS < 0) {
        threats.push({
          category: 'profitability',
          title: 'Dòng tiền âm',
          value: formatVND(scenario.steps.dongTienRongBDS),
          description: 'Cần bổ sung tiền hàng tháng',
          impact: 'high',
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-red-600 bg-red-50'
        });
      }

      // Risk Analysis
      if ((scenario.inputs.tyLeVay || 0) <= 70) {
        strengths.push({
          category: 'risk',
          title: 'Rủi ro thấp',
          value: `${scenario.inputs.tyLeVay}% vay`,
          description: 'Tỷ lệ vay an toàn, ít rủi ro thanh khoản',
          impact: 'medium',
          icon: <Shield className="h-4 w-4" />,
          color: 'text-blue-600 bg-blue-50'
        });
      } else if ((scenario.inputs.tyLeVay || 0) > 85) {
        threats.push({
          category: 'risk',
          title: 'Rủi ro cao',
          value: `${scenario.inputs.tyLeVay}% vay`,
          description: 'Tỷ lệ vay cao, rủi ro thanh khoản',
          impact: 'high',
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-red-600 bg-red-50'
        });
      }

      // Financing Analysis
      if ((scenario.inputs.laiSuatThaNoi || 0) <= 9) {
        opportunities.push({
          category: 'financing',
          title: 'Lãi suất tốt',
          value: `${scenario.inputs.laiSuatThaNoi}%`,
          description: 'Lãi suất cạnh tranh, tiết kiệm chi phí',
          impact: 'medium',
          icon: <Percent className="h-4 w-4" />,
          color: 'text-green-600 bg-green-50'
        });
      } else if ((scenario.inputs.laiSuatThaNoi || 0) > 12) {
        weaknesses.push({
          category: 'financing',
          title: 'Lãi suất cao',
          value: `${scenario.inputs.laiSuatThaNoi}%`,
          description: 'Lãi suất cao, tăng chi phí vay',
          impact: 'medium',
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'text-orange-600 bg-orange-50'
        });
      }

      // Payback Analysis
      if (scenario.paybackPeriod > 0 && scenario.paybackPeriod <= 8) {
        strengths.push({
          category: 'timing',
          title: 'Hoàn vốn nhanh',
          value: `${scenario.paybackPeriod.toFixed(1)} năm`,
          description: 'Thời gian thu hồi vốn hợp lý',
          impact: 'medium',
          icon: <Calendar className="h-4 w-4" />,
          color: 'text-green-600 bg-green-50'
        });
      } else if (scenario.paybackPeriod > 15) {
        weaknesses.push({
          category: 'timing',
          title: 'Hoàn vốn chậm',
          value: `${scenario.paybackPeriod.toFixed(1)} năm`,
          description: 'Thời gian thu hồi vốn dài',
          impact: 'medium',
          icon: <Calendar className="h-4 w-4" />,
          color: 'text-orange-600 bg-orange-50'
        });
      }

      // Market opportunities
      if (scenario.rentalYield > 8) {
        opportunities.push({
          category: 'market',
          title: 'Rental yield cao',
          value: formatPercent(scenario.rentalYield),
          description: 'Tỷ lệ lợi nhuận từ cho thuê tốt',
          impact: 'medium',
          icon: <Home className="h-4 w-4" />,
          color: 'text-blue-600 bg-blue-50'
        });
      }

      return {
        scenarioIndex: index,
        scenario,
        scores: {
          profitability,
          cashFlow,
          risk,
          financing,
          overall
        },
        rank: 0, // Will be calculated after sorting
        strengths,
        weaknesses,
        opportunities,
        threats
      };
    });

    // Calculate ranks
    const sortedScores = [...scores].sort((a, b) => b.scores.overall - a.scores.overall);
    sortedScores.forEach((score, index) => {
      score.rank = index + 1;
    });

    return scores;
  }, [scenarios]);

  // ===== SORTED PROPERTIES =====
  const sortedProperties = useMemo(() => {
    const sorted = [...propertyScores];
    switch (sortBy) {
      case 'overall':
        return sorted.sort((a, b) => b.scores.overall - a.scores.overall);
      case 'roi':
        return sorted.sort((a, b) => b.scenario.roiHangNam - a.scenario.roiHangNam);
      case 'cashFlow':
        return sorted.sort((a, b) => b.scenario.steps.dongTienRongBDS - a.scenario.steps.dongTienRongBDS);
      case 'risk':
        return sorted.sort((a, b) => b.scores.risk - a.scores.risk);
      default:
        return sorted;
    }
  }, [propertyScores, sortBy]);

  // ===== UTILITY FUNCTIONS =====
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number): React.ReactNode => {
    if (score >= 80) return <Crown className="h-4 w-4" />;
    if (score >= 60) return <Star className="h-4 w-4" />;
    if (score >= 40) return <Target className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Crown className="h-3 w-3 mr-1" />Tốt nhất</Badge>;
    if (rank === 2) return <Badge className="bg-gray-100 text-gray-800 border-gray-300"><Award className="h-3 w-3 mr-1" />Thứ 2</Badge>;
    if (rank === 3) return <Badge className="bg-orange-100 text-orange-800 border-orange-300"><Target className="h-3 w-3 mr-1" />Thứ 3</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const toggleDetails = (index: number) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Chưa có dữ liệu so sánh</h3>
          <p className="text-sm text-muted-foreground">
            Tạo ít nhất 2 kịch bản để thấy so sánh chi tiết
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  So Sánh Chi Tiết - Cân Đo Đong Đếm
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Phân tích ưu nhược điểm để đưa ra quyết định tốt nhất
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy as any}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Điểm tổng</SelectItem>
                    <SelectItem value="roi">ROI cao nhất</SelectItem>
                    <SelectItem value="cashFlow">Dòng tiền tốt nhất</SelectItem>
                    <SelectItem value="risk">An toàn nhất</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="secondary">{scenarios.length} kịch bản</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Comparison Cards */}
        <div className="space-y-4">
          {sortedProperties.map((property, index) => (
            <Card 
              key={property.scenarioIndex} 
              className={`transition-all hover:shadow-lg ${
                property.rank === 1 ? 'ring-2 ring-yellow-200 bg-yellow-50/30' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getScoreColor(property.scores.overall)}`}>
                      {getScoreIcon(property.scores.overall)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {property.scenario.scenarioName || `Kịch bản ${property.scenarioIndex + 1}`}
                        </h3>
                        {getRankBadge(property.rank)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatVND(property.scenario.inputs.giaTriBDS || 0)} • 
                        {formatVND(property.scenario.inputs.vonTuCo || 0)} vốn tự có
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {property.scores.overall.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Điểm tổng</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {formatPercent(property.scenario.roiHangNam)}
                    </div>
                    <div className="text-sm text-muted-foreground">ROI/năm</div>
                    <div className="text-xs text-blue-600">
                      {property.scores.profitability.toFixed(0)}/100
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {formatVND(property.scenario.steps.dongTienRongBDS)}
                    </div>
                    <div className="text-sm text-muted-foreground">Dòng tiền</div>
                    <div className="text-xs text-green-600">
                      {property.scores.cashFlow.toFixed(0)}/100
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {property.scenario.inputs.tyLeVay}%
                    </div>
                    <div className="text-sm text-muted-foreground">Tỷ lệ vay</div>
                    <div className="text-xs text-purple-600">
                      {property.scores.risk.toFixed(0)}/100
                    </div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {property.scenario.inputs.laiSuatThaNoi}%
                    </div>
                    <div className="text-sm text-muted-foreground">Lãi suất</div>
                    <div className="text-xs text-orange-600">
                      {property.scores.financing.toFixed(0)}/100
                    </div>
                  </div>
                </div>

                {/* SWOT Analysis Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Strengths */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Ưu điểm</span>
                      <Badge variant="secondary" className="text-xs">
                        {property.strengths.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {property.strengths.slice(0, 2).map((strength, i) => (
                        <div key={i} className={`p-2 rounded text-xs ${strength.color}`}>
                          <div className="flex items-center gap-1">
                            {strength.icon}
                            <span className="font-medium">{strength.title}</span>
                          </div>
                          <div className="text-xs opacity-75">{strength.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Nhược điểm</span>
                      <Badge variant="secondary" className="text-xs">
                        {property.weaknesses.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {property.weaknesses.slice(0, 2).map((weakness, i) => (
                        <div key={i} className={`p-2 rounded text-xs ${weakness.color}`}>
                          <div className="flex items-center gap-1">
                            {weakness.icon}
                            <span className="font-medium">{weakness.title}</span>
                          </div>
                          <div className="text-xs opacity-75">{weakness.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Cơ hội</span>
                      <Badge variant="secondary" className="text-xs">
                        {property.opportunities.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {property.opportunities.slice(0, 2).map((opportunity, i) => (
                        <div key={i} className={`p-2 rounded text-xs ${opportunity.color}`}>
                          <div className="flex items-center gap-1">
                            {opportunity.icon}
                            <span className="font-medium">{opportunity.title}</span>
                          </div>
                          <div className="text-xs opacity-75">{opportunity.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Threats */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">Rủi ro</span>
                      <Badge variant="secondary" className="text-xs">
                        {property.threats.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {property.threats.slice(0, 2).map((threat, i) => (
                        <div key={i} className={`p-2 rounded text-xs ${threat.color}`}>
                          <div className="flex items-center gap-1">
                            {threat.icon}
                            <span className="font-medium">{threat.title}</span>
                          </div>
                          <div className="text-xs opacity-75">{threat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Phân tích điểm số</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Khả năng sinh lời</span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.scores.profitability} className="w-24 h-2" />
                        <span className="text-sm font-medium w-10">{property.scores.profitability.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dòng tiền</span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.scores.cashFlow} className="w-24 h-2" />
                        <span className="text-sm font-medium w-10">{property.scores.cashFlow.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Độ an toàn</span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.scores.risk} className="w-24 h-2" />
                        <span className="text-sm font-medium w-10">{property.scores.risk.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Điều kiện vay</span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.scores.financing} className="w-24 h-2" />
                        <span className="text-sm font-medium w-10">{property.scores.financing.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleDetails(property.scenarioIndex)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showDetails[property.scenarioIndex] ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                  </Button>
                  <div className="flex items-center gap-2">
                    {onSelectScenario && (
                      <Button 
                        size="sm"
                        onClick={() => onSelectScenario(property.scenario)}
                        disabled={property.rank === 1}
                      >
                        {property.rank === 1 ? 'Đã chọn' : 'Chọn kịch bản này'}
                      </Button>
                    )}
                    {onRemoveScenario && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onRemoveScenario(property.scenarioIndex)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Detailed Analysis (Collapsible) */}
                {showDetails[property.scenarioIndex] && (
                  <div className="mt-4 p-4 border rounded-lg bg-white">
                    <h4 className="font-medium mb-3">Phân tích chi tiết SWOT</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">✅ Ưu điểm</h5>
                        <div className="space-y-2">
                          {property.strengths.map((item, i) => (
                            <div key={i} className="p-3 bg-green-50 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                {item.icon}
                                <span className="font-medium">{item.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {item.impact}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                              <p className="text-sm font-medium">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-600 mb-2">❌ Nhược điểm</h5>
                        <div className="space-y-2">
                          {property.weaknesses.map((item, i) => (
                            <div key={i} className="p-3 bg-red-50 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                {item.icon}
                                <span className="font-medium">{item.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {item.impact}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                              <p className="text-sm font-medium">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">🎯 Kết luận</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kịch bản <strong>{sortedProperties[0]?.scenario.scenarioName || 'Tốt nhất'}</strong> có 
                điểm số cao nhất ({sortedProperties[0]?.scores.overall.toFixed(0)}/100) với {sortedProperties[0]?.strengths.length} ưu điểm nổi bật.
              </p>
              <div className="flex justify-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  {sortedProperties.filter(p => p.scores.overall >= 70).length} kịch bản tốt
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {sortedProperties.filter(p => p.scores.overall >= 50 && p.scores.overall < 70).length} kịch bản khá
                </Badge>
                <Badge className="bg-red-100 text-red-800">
                  {sortedProperties.filter(p => p.scores.overall < 50).length} kịch bản cần cải thiện
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}