"use client";

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Star,
  AlertTriangle,
  CheckCircle,
  Crown,
  Zap,
  Target,
  DollarSign,
  Home,
  Calendar,
  Percent,
  Shield,
  Sparkles,
  Eye,
  ArrowRight,
  ChevronRight,
  Filter,
  Settings,
  BarChart3,
  PieChart,
  Gauge,
  Award,
  FlameIcon as Fire,
} from 'lucide-react';

import { CalculationResult, RealEstateInputs } from '@/types/real-estate';
import { formatVND, formatPercent } from '@/lib/financial-utils';

// ===== ENHANCED INTERFACES =====
interface DetailedPropertyComparisonProps {
  scenarios: CalculationResult[];
  onRemoveScenario?: (index: number) => void;
  onAddScenario?: () => void;
  onGenerateEconomicScenarios?: () => void;
}

interface PropertyHighlight {
  category: 'financing' | 'returns' | 'risk' | 'market' | 'timing';
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  title: string;
  description: string;
  value: string;
  impact: 'high' | 'medium' | 'low';
  score: number; // 0-100
  icon: React.ReactNode;
  color: string;
}

interface FieldComparison {
  field: keyof RealEstateInputs;
  displayName: string;
  category: 'financing' | 'property' | 'rental' | 'costs' | 'personal';
  format: 'currency' | 'percentage' | 'months' | 'number';
  importance: 'high' | 'medium' | 'low';
  description: string;
  betterWhen: 'higher' | 'lower' | 'optimal';
  optimal?: { min: number; max: number };
}

// ===== FIELD DEFINITIONS =====
const FIELD_COMPARISONS: FieldComparison[] = [
  // Financing Fields
  {
    field: 'laiSuatUuDai',
    displayName: 'Lãi suất ưu đãi',
    category: 'financing',
    format: 'percentage',
    importance: 'high',
    description: 'Lãi suất trong giai đoạn ưu đãi. Thấp hơn = tốt hơn',
    betterWhen: 'lower',
    optimal: { min: 6, max: 9 }
  },
  {
    field: 'laiSuatThaNoi',
    displayName: 'Lãi suất thả nổi',
    category: 'financing',
    format: 'percentage',
    importance: 'high',
    description: 'Lãi suất sau giai đoạn ưu đãi. Thấp hơn = tốt hơn',
    betterWhen: 'lower',
    optimal: { min: 8, max: 12 }
  },
  {
    field: 'thoiGianUuDai',
    displayName: 'Thời gian ưu đãi',
    category: 'financing',
    format: 'months',
    importance: 'medium',
    description: 'Thời gian áp dụng lãi suất ưu đãi. Dài hơn = tốt hơn',
    betterWhen: 'higher',
    optimal: { min: 12, max: 24 }
  },
  {
    field: 'thoiGianVay',
    displayName: 'Thời gian vay',
    category: 'financing',
    format: 'number',
    importance: 'medium',
    description: 'Thời gian trả nợ. Dài hơn = áp lực thấp hơn',
    betterWhen: 'optimal',
    optimal: { min: 15, max: 25 }
  },
  
  // Property Fields
  {
    field: 'giaTriBDS',
    displayName: 'Giá trị BĐS',
    category: 'property',
    format: 'currency',
    importance: 'high',
    description: 'Giá trị bất động sản. Tùy thuộc vào ngân sách',
    betterWhen: 'optimal'
  },
  {
    field: 'vonTuCo',
    displayName: 'Vốn tự có',
    category: 'property',
    format: 'currency',
    importance: 'high',
    description: 'Vốn tự có. Cao hơn = rủi ro thấp hơn',
    betterWhen: 'higher'
  },
  {
    field: 'chiPhiTrangBi',
    displayName: 'Chi phí trang bị',
    category: 'property',
    format: 'currency',
    importance: 'medium',
    description: 'Chi phí trang bị, nội thất. Thấp hơn = tốt hơn',
    betterWhen: 'lower'
  },
  
  // Rental Fields
  {
    field: 'tienThueThang',
    displayName: 'Tiền thuê/tháng',
    category: 'rental',
    format: 'currency',
    importance: 'high',
    description: 'Thu nhập từ thuê. Cao hơn = tốt hơn',
    betterWhen: 'higher'
  },
  {
    field: 'tyLeLapDay',
    displayName: 'Tỷ lệ lấp đầy',
    category: 'rental',
    format: 'percentage',
    importance: 'high',
    description: 'Tỷ lệ lấp đầy ước tính. Cao hơn = tốt hơn',
    betterWhen: 'higher',
    optimal: { min: 85, max: 95 }
  },
  
  // Cost Fields
  {
    field: 'phiQuanLy',
    displayName: 'Phí quản lý',
    category: 'costs',
    format: 'currency',
    importance: 'medium',
    description: 'Phí quản lý hàng tháng. Thấp hơn = tốt hơn',
    betterWhen: 'lower'
  },
  {
    field: 'phiBaoTri',
    displayName: 'Phí bảo trì',
    category: 'costs',
    format: 'percentage',
    importance: 'medium',
    description: 'Phí bảo trì (% giá trị BĐS/năm). Thấp hơn = tốt hơn',
    betterWhen: 'lower',
    optimal: { min: 0.5, max: 2 }
  },
  {
    field: 'baoHiemTaiSan',
    displayName: 'Bảo hiểm tài sản',
    category: 'costs',
    format: 'percentage',
    importance: 'low',
    description: 'Bảo hiểm tài sản (% giá trị BĐS/năm)',
    betterWhen: 'lower',
    optimal: { min: 0.1, max: 0.3 }
  },
];

// ===== MAIN COMPONENT =====
export default function DetailedPropertyComparison({
  scenarios,
  onRemoveScenario,
  onAddScenario,
  onGenerateEconomicScenarios,
}: DetailedPropertyComparisonProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [highlightFilter, setHighlightFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'importance' | 'difference'>('importance');

  // ===== FIELD COMPARISON ANALYSIS =====
  const fieldAnalysis = useMemo(() => {
    if (scenarios.length < 2) return [];
    
    return FIELD_COMPARISONS.map(field => {
      const values = scenarios.map(s => ({
        scenario: s,
        value: s.inputs[field.field] as number || 0,
        formatted: formatFieldValue(s.inputs[field.field] as number || 0, field.format)
      }));
      
      const min = Math.min(...values.map(v => v.value));
      const max = Math.max(...values.map(v => v.value));
      const range = max - min;
      const average = values.reduce((sum, v) => sum + v.value, 0) / values.length;
      
      // Determine best and worst
      let bestIndex = 0;
      let worstIndex = 0;
      
      values.forEach((v, i) => {
        if (field.betterWhen === 'higher' && v.value > values[bestIndex].value) {
          bestIndex = i;
        } else if (field.betterWhen === 'lower' && v.value < values[bestIndex].value) {
          bestIndex = i;
        }
        
        if (field.betterWhen === 'higher' && v.value < values[worstIndex].value) {
          worstIndex = i;
        } else if (field.betterWhen === 'lower' && v.value > values[worstIndex].value) {
          worstIndex = i;
        }
      });
      
      return {
        field,
        values,
        min,
        max,
        range,
        average,
        bestIndex,
        worstIndex,
        variationScore: range / average * 100, // Variation as percentage
      };
    });
  }, [scenarios]);

  // ===== PROPERTY HIGHLIGHTS =====
  const propertyHighlights = useMemo(() => {
    if (scenarios.length === 0) return [];
    
    const highlights: PropertyHighlight[] = [];
    
    scenarios.forEach((scenario, index) => {
      const scenarioName = scenario.scenarioName || `Kịch bản ${index + 1}`;
      
      // ROI Analysis
      if (scenario.roiHangNam > 15) {
        highlights.push({
          category: 'returns',
          type: 'strength',
          title: `ROI xuất sắc: ${formatPercent(scenario.roiHangNam)}`,
          description: `${scenarioName} có ROI vượt trội so với thị trường`,
          value: formatPercent(scenario.roiHangNam),
          impact: 'high',
          score: 90,
          icon: <Crown className="h-4 w-4" />,
          color: 'text-yellow-600'
        });
      }
      
      // Cash Flow Analysis
      if (scenario.steps.dongTienRongBDS > 5000000) {
        highlights.push({
          category: 'returns',
          type: 'strength',
          title: `Dòng tiền mạnh: ${formatVND(scenario.steps.dongTienRongBDS)}`,
          description: `${scenarioName} tạo dòng tiền tích cực hàng tháng`,
          value: formatVND(scenario.steps.dongTienRongBDS),
          impact: 'high',
          score: 85,
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'text-green-600'
        });
      }
      
      // Risk Analysis
      if (scenario.inputs.tyLeVay <= 70) {
        highlights.push({
          category: 'risk',
          type: 'strength',
          title: `Rủi ro thấp: Vay ${scenario.inputs.tyLeVay}%`,
          description: `${scenarioName} có tỷ lệ vay an toàn`,
          value: `${scenario.inputs.tyLeVay}%`,
          impact: 'medium',
          score: 80,
          icon: <Shield className="h-4 w-4" />,
          color: 'text-blue-600'
        });
      }
      
      // Interest Rate Analysis
      if (scenario.inputs.laiSuatThaNoi <= 9) {
        highlights.push({
          category: 'financing',
          type: 'opportunity',
          title: `Lãi suất tốt: ${scenario.inputs.laiSuatThaNoi}%`,
          description: `${scenarioName} có lãi suất cạnh tranh`,
          value: `${scenario.inputs.laiSuatThaNoi}%`,
          impact: 'high',
          score: 75,
          icon: <Percent className="h-4 w-4" />,
          color: 'text-green-600'
        });
      }
      
      // Negative indicators
      if (scenario.steps.dongTienRongBDS < 0) {
        highlights.push({
          category: 'returns',
          type: 'threat',
          title: `Dòng tiền âm: ${formatVND(scenario.steps.dongTienRongBDS)}`,
          description: `${scenarioName} cần bổ sung tiền hàng tháng`,
          value: formatVND(scenario.steps.dongTienRongBDS),
          impact: 'high',
          score: 20,
          icon: <TrendingDown className="h-4 w-4" />,
          color: 'text-red-600'
        });
      }
      
      if (scenario.inputs.tyLeVay > 80) {
        highlights.push({
          category: 'risk',
          type: 'threat',
          title: `Rủi ro cao: Vay ${scenario.inputs.tyLeVay}%`,
          description: `${scenarioName} có tỷ lệ vay rủi ro`,
          value: `${scenario.inputs.tyLeVay}%`,
          impact: 'high',
          score: 30,
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-red-600'
        });
      }
    });
    
    return highlights.sort((a, b) => b.score - a.score);
  }, [scenarios]);

  // ===== FILTERED DATA =====
  const filteredFieldAnalysis = useMemo(() => {
    let filtered = fieldAnalysis;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.field.category === selectedCategory);
    }
    
    if (sortBy === 'difference') {
      filtered = filtered.sort((a, b) => b.variationScore - a.variationScore);
    } else {
      filtered = filtered.sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        return importanceOrder[b.field.importance] - importanceOrder[a.field.importance];
      });
    }
    
    return filtered;
  }, [fieldAnalysis, selectedCategory, sortBy]);

  const filteredHighlights = useMemo(() => {
    if (highlightFilter === 'all') return propertyHighlights;
    return propertyHighlights.filter(h => h.category === highlightFilter);
  }, [propertyHighlights, highlightFilter]);

  // ===== UTILITY FUNCTIONS =====
  function formatFieldValue(value: number, format: string): string {
    switch (format) {
      case 'currency':
        return formatVND(value);
      case 'percentage':
        return `${value}%`;
      case 'months':
        return `${value} tháng`;
      default:
        return value.toString();
    }
  }

  function getFieldComparisonColor(value: number, field: FieldComparison, isOptimal: boolean): string {
    if (isOptimal) return 'text-green-600 bg-green-50';
    if (field.betterWhen === 'higher') return 'text-blue-600 bg-blue-50';
    if (field.betterWhen === 'lower') return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  }

  if (scenarios.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>So Sánh Chi Tiết Bất Động Sản</CardTitle>
          <CardDescription>
            Cần ít nhất 2 kịch bản để thực hiện so sánh chi tiết
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            So sánh từng yếu tố để đưa ra quyết định tốt nhất
          </div>
          {onAddScenario && (
            <Button onClick={onAddScenario}>
              <Home className="h-4 w-4 mr-2" />
              Thêm kịch bản mới
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  So Sánh Chi Tiết Bất Động Sản
                </CardTitle>
                <CardDescription>
                  Phân tích từng yếu tố để đưa ra quyết định đầu tư tốt nhất
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {onGenerateEconomicScenarios && (
                  <Button variant="outline" onClick={onGenerateEconomicScenarios}>
                    <Zap className="h-4 w-4 mr-2" />
                    Tạo Kịch Bản Kinh Tế
                  </Button>
                )}
                <Badge variant="secondary">
                  {scenarios.length} kịch bản
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Property Highlights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Điểm Nổi Bật
              </CardTitle>
              <Select value={highlightFilter} onValueChange={setHighlightFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="returns">Lợi nhuận</SelectItem>
                  <SelectItem value="risk">Rủi ro</SelectItem>
                  <SelectItem value="financing">Tài chính</SelectItem>
                  <SelectItem value="market">Thị trường</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredHighlights.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredHighlights.slice(0, 6).map((highlight, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          highlight.type === 'strength' ? 'bg-green-100' :
                          highlight.type === 'opportunity' ? 'bg-blue-100' :
                          highlight.type === 'threat' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }`}>
                          <div className={highlight.color}>
                            {highlight.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{highlight.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {highlight.description}
                          </p>
                          <Badge 
                            variant={highlight.impact === 'high' ? 'default' : 'secondary'}
                            className="mt-2"
                          >
                            {highlight.impact === 'high' ? 'Tác động cao' : 
                             highlight.impact === 'medium' ? 'Tác động trung bình' : 'Tác động thấp'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Không có điểm nổi bật nào được tìm thấy
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Field Comparison */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                So Sánh Từng Yếu Tố
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="financing">Tài chính</SelectItem>
                    <SelectItem value="property">Bất động sản</SelectItem>
                    <SelectItem value="rental">Cho thuê</SelectItem>
                    <SelectItem value="costs">Chi phí</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy as any}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="importance">Độ quan trọng</SelectItem>
                    <SelectItem value="difference">Mức chênh lệch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFieldAnalysis.map((analysis, index) => (
                <div key={analysis.field.field} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{analysis.field.displayName}</h4>
                      <Badge variant={
                        analysis.field.importance === 'high' ? 'default' :
                        analysis.field.importance === 'medium' ? 'secondary' : 'outline'
                      }>
                        {analysis.field.importance === 'high' ? 'Quan trọng' :
                         analysis.field.importance === 'medium' ? 'Trung bình' : 'Thấp'}
                      </Badge>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>Chênh lệch: {analysis.variationScore.toFixed(1)}%</span>
                          <Eye className="h-3 w-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{analysis.field.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="grid gap-2">
                    {analysis.values.map((value, scenarioIndex) => {
                      const isOptimal = analysis.field.optimal ? 
                        (value.value >= analysis.field.optimal.min && value.value <= analysis.field.optimal.max) : 
                        false;
                      const isBest = scenarioIndex === analysis.bestIndex;
                      const isWorst = scenarioIndex === analysis.worstIndex;
                      
                      return (
                        <div key={scenarioIndex} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {value.scenario.scenarioName || `Kịch bản ${scenarioIndex + 1}`}
                            </span>
                            {isBest && (
                              <Badge variant="default" className="text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                Tốt nhất
                              </Badge>
                            )}
                            {isWorst && analysis.values.length > 2 && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Cần cải thiện
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              isOptimal ? 'text-green-600' :
                              isBest ? 'text-blue-600' :
                              isWorst ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {value.formatted}
                            </span>
                            {isOptimal && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {onAddScenario && (
            <Button onClick={onAddScenario} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Thêm Kịch Bản
            </Button>
          )}
          {onGenerateEconomicScenarios && (
            <Button onClick={onGenerateEconomicScenarios}>
              <Zap className="h-4 w-4 mr-2" />
              Tạo Kịch Bản Kinh Tế
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}