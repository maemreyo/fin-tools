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
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  AlertTriangle,
  Rocket,
  Settings,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Gauge,
  Calendar,
  DollarSign,
  Home,
  Users,
  Building,
  Factory,
  Briefcase,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Download,
  Share,
  Sparkles,
  FlameIcon as Fire,
  Snowflake,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
} from 'lucide-react';

import { RealEstateInputs, CalculationResult } from '@/types/real-estate';
import { formatVND, formatPercent } from '@/lib/financial-utils';
import {
  EconomicScenarioGenerator as EconomicGenerator,
  ECONOMIC_SCENARIOS,
  GeneratedScenario,
  EconomicFactors,
  EconomicScenario,
  getScenarioIcon,
  getScenarioColor
} from '@/lib/economic-scenario-generator';

// ===== INTERFACES =====
interface EconomicScenarioGeneratorProps {
  baseInputs: RealEstateInputs;
  onScenariosGenerated: (scenarios: GeneratedScenario[]) => void;
  onAddToComparison: (results: CalculationResult[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface CustomScenarioForm {
  name: string;
  description: string;
  factors: Partial<EconomicFactors>;
}

// ===== MAIN COMPONENT =====
export default function EconomicScenarioGenerator({
  baseInputs,
  onScenariosGenerated,
  onAddToComparison,
  isOpen,
  onClose
}: EconomicScenarioGeneratorProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['baseline', 'optimistic', 'conservative']);
  const [generatedScenarios, setGeneratedScenarios] = useState<GeneratedScenario[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomScenario, setShowCustomScenario] = useState(false);
  const [customScenario, setCustomScenario] = useState<CustomScenarioForm>({
    name: '',
    description: '',
    factors: {}
  });
  const [showSensitivityAnalysis, setShowSensitivityAnalysis] = useState(false);

  // ===== SENSITIVITY ANALYSIS =====
  const sensitivityAnalysis = useMemo(() => {
    if (!baseInputs.giaTriBDS) return [];
    return EconomicGenerator.sensitivityAnalysis(baseInputs);
  }, [baseInputs]);

  // ===== HANDLERS =====
  const handleGenerateScenarios = async () => {
    if (selectedScenarios.length === 0) return;
    
    setIsGenerating(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const scenarios = EconomicGenerator.generateScenarios(
        baseInputs,
        selectedScenarios
      );
      
      setGeneratedScenarios(scenarios);
      onScenariosGenerated(scenarios);
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScenarioToggle = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const handleAddToComparison = () => {
    const results = generatedScenarios.map(gs => ({
      ...gs.result,
      scenarioName: gs.scenario.name
    }));
    onAddToComparison(results);
    onClose();
  };

  const handleCustomScenarioSubmit = () => {
    if (!customScenario.name.trim()) return;
    
    const newScenario = EconomicGenerator.createCustomScenario(
      customScenario.name,
      customScenario.description,
      customScenario.factors
    );
    
    // Add to available scenarios temporarily
    const scenarios = EconomicGenerator.generateScenarios(
      baseInputs,
      [newScenario.id]
    );
    
    setGeneratedScenarios(prev => [...prev, ...scenarios]);
    setShowCustomScenario(false);
    setCustomScenario({ name: '', description: '', factors: {} });
  };

  const getScenarioIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      TrendingUp: <TrendingUp className="h-4 w-4" />,
      TrendingDown: <TrendingDown className="h-4 w-4" />,
      Target: <Target className="h-4 w-4" />,
      Shield: <Shield className="h-4 w-4" />,
      AlertTriangle: <AlertTriangle className="h-4 w-4" />,
      Rocket: <Rocket className="h-4 w-4" />,
      Settings: <Settings className="h-4 w-4" />
    };
    return iconMap[iconName] || <BarChart3 className="h-4 w-4" />;
  };

  const getRiskLevelColor = (riskLevel: string) => {
    const colorMap: { [key: string]: string } = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50'
    };
    return colorMap[riskLevel] || 'text-gray-600 bg-gray-50';
  };

  const getRiskLevelText = (riskLevel: string) => {
    const textMap: { [key: string]: string } = {
      low: 'Rủi ro thấp',
      medium: 'Rủi ro trung bình',
      high: 'Rủi ro cao',
      critical: 'Rủi ro nghiêm trọng'
    };
    return textMap[riskLevel] || 'Không xác định';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Tạo Kịch Bản Kinh Tế
          </DialogTitle>
          <DialogDescription>
            Mô phỏng tác động của các yếu tố kinh tế lên đầu tư bất động sản
          </DialogDescription>
        </DialogHeader>

        <TooltipProvider>
          <Tabs defaultValue="scenarios" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scenarios">Kịch bản Kinh tế</TabsTrigger>
              <TabsTrigger value="sensitivity">Phân tích Nhạy cảm</TabsTrigger>
              <TabsTrigger value="results">Kết quả</TabsTrigger>
            </TabsList>

            {/* Scenario Selection */}
            <TabsContent value="scenarios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chọn Kịch Bản Kinh Tế</CardTitle>
                  <CardDescription>
                    Chọn các kịch bản để mô phỏng tác động lên đầu tư của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {ECONOMIC_SCENARIOS.map((scenario) => (
                      <Card 
                        key={scenario.id} 
                        className={`cursor-pointer transition-all ${
                          selectedScenarios.includes(scenario.id) 
                            ? 'ring-2 ring-primary' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleScenarioToggle(scenario.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedScenarios.includes(scenario.id)}
                                onChange={() => handleScenarioToggle(scenario.id)}
                              />
                              <div className={`p-2 rounded-lg ${getScenarioColor(scenario.color)}`}>
                                <div className={scenario.color}>
                                  {getScenarioIconComponent(scenario.icon)}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{scenario.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {scenario.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {scenario.probability}% xác suất
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {scenario.timeframe}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCustomScenario(true)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Tạo Kịch Bản Tùy Chỉnh
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Đã chọn {selectedScenarios.length} kịch bản
                      </span>
                      <Button 
                        onClick={handleGenerateScenarios}
                        disabled={selectedScenarios.length === 0 || isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Tạo Kịch Bản
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sensitivity Analysis */}
            <TabsContent value="sensitivity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phân Tích Độ Nhạy Cảm</CardTitle>
                  <CardDescription>
                    Xác định yếu tố nào ảnh hưởng nhiều nhất đến kết quả đầu tư
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sensitivityAnalysis.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{item.factor}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-lg">
                            {item.impact.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Tác động ROI
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Gợi ý</h4>
                    <p className="text-sm text-blue-800">
                      Tập trung vào yếu tố "{sensitivityAnalysis[0]?.factor}" có tác động lớn nhất. 
                      Thay đổi nhỏ ở yếu tố này có thể ảnh hưởng đáng kể đến kết quả đầu tư.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results */}
            <TabsContent value="results" className="space-y-4">
              {generatedScenarios.length > 0 ? (
                <div className="space-y-4">
                  {/* Overview Cards */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-sm text-muted-foreground">Kịch bản tốt nhất</div>
                            <div className="font-medium">
                              {generatedScenarios
                                .sort((a, b) => b.result.roiHangNam - a.result.roiHangNam)[0]
                                ?.scenario.name}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-sm text-muted-foreground">Rủi ro thấp nhất</div>
                            <div className="font-medium">
                              {generatedScenarios
                                .sort((a, b) => {
                                  const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 };
                                  return riskOrder[a.impactAnalysis.riskLevel] - riskOrder[b.impactAnalysis.riskLevel];
                                })[0]?.scenario.name}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <div>
                            <div className="text-sm text-muted-foreground">Cần chú ý</div>
                            <div className="font-medium">
                              {generatedScenarios.filter(s => s.impactAnalysis.riskLevel === 'high' || s.impactAnalysis.riskLevel === 'critical').length} kịch bản
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-4">
                    {generatedScenarios.map((generated, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getScenarioColor(generated.scenario.color)}`}>
                                <div className={generated.scenario.color}>
                                  {getScenarioIconComponent(generated.scenario.icon)}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-medium">{generated.scenario.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {generated.scenario.description}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              className={getRiskLevelColor(generated.impactAnalysis.riskLevel)}
                              variant="secondary"
                            >
                              {getRiskLevelText(generated.impactAnalysis.riskLevel)}
                            </Badge>
                          </div>

                          <div className="grid gap-4 md:grid-cols-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {formatPercent(generated.result.roiHangNam)}
                              </div>
                              <div className="text-sm text-muted-foreground">ROI/năm</div>
                              <div className="text-xs text-muted-foreground">
                                {generated.impactAnalysis.roiChange >= 0 ? '+' : ''}
                                {generated.impactAnalysis.roiChange.toFixed(1)}%
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {formatVND(generated.result.steps.dongTienRongBDS)}
                              </div>
                              <div className="text-sm text-muted-foreground">Dòng tiền/tháng</div>
                              <div className="text-xs text-muted-foreground">
                                {generated.impactAnalysis.cashFlowChange >= 0 ? '+' : ''}
                                {(generated.impactAnalysis.cashFlowChange / 1000000).toFixed(1)}M
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {generated.result.paybackPeriod > 0 ? 
                                  `${generated.result.paybackPeriod.toFixed(1)} năm` : 
                                  'N/A'
                                }
                              </div>
                              <div className="text-sm text-muted-foreground">Hoàn vốn</div>
                              <div className="text-xs text-muted-foreground">
                                {generated.impactAnalysis.paybackChange >= 0 ? '+' : ''}
                                {generated.impactAnalysis.paybackChange.toFixed(1)} năm
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {generated.scenario.probability}%
                              </div>
                              <div className="text-sm text-muted-foreground">Xác suất</div>
                              <div className="text-xs text-muted-foreground">
                                {generated.scenario.timeframe}
                              </div>
                            </div>
                          </div>

                          {generated.impactAnalysis.keyImpacts.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-sm mb-2">Tác động chính:</h4>
                              <div className="flex flex-wrap gap-2">
                                {generated.impactAnalysis.keyImpacts.map((impact, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {impact}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setGeneratedScenarios([])}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tạo lại
                    </Button>
                    <Button onClick={handleAddToComparison}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Thêm vào So sánh
                    </Button>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Chưa có kịch bản nào</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Chọn kịch bản kinh tế và nhấn "Tạo Kịch Bản" để xem kết quả
                    </p>
                    <Button onClick={() => setShowCustomScenario(true)}>
                      Tạo Kịch Bản Ngay
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TooltipProvider>

        {/* Custom Scenario Dialog */}
        <Dialog open={showCustomScenario} onOpenChange={setShowCustomScenario}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo Kịch Bản Tùy Chỉnh</DialogTitle>
              <DialogDescription>
                Điều chỉnh các yếu tố kinh tế để tạo kịch bản riêng
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="scenario-name">Tên kịch bản</Label>
                  <Input
                    id="scenario-name"
                    value={customScenario.name}
                    onChange={(e) => setCustomScenario(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ví dụ: Kịch bản tùy chỉnh"
                  />
                </div>
                <div>
                  <Label htmlFor="scenario-description">Mô tả</Label>
                  <Input
                    id="scenario-description"
                    value={customScenario.description}
                    onChange={(e) => setCustomScenario(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả ngắn gọn về kịch bản"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Thay đổi lãi suất (%)</Label>
                  <Slider
                    value={[customScenario.factors.interestRateChange || 0]}
                    onValueChange={(value) => setCustomScenario(prev => ({ 
                      ...prev, 
                      factors: { ...prev.factors, interestRateChange: value[0] } 
                    }))}
                    min={-2}
                    max={5}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    Hiện tại: {customScenario.factors.interestRateChange || 0}%
                  </div>
                </div>

                <div>
                  <Label>Thay đổi giá bất động sản (%)</Label>
                  <Slider
                    value={[customScenario.factors.propertyPriceChange || 0]}
                    onValueChange={(value) => setCustomScenario(prev => ({ 
                      ...prev, 
                      factors: { ...prev.factors, propertyPriceChange: value[0] } 
                    }))}
                    min={-10}
                    max={20}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    Hiện tại: {customScenario.factors.propertyPriceChange || 0}%
                  </div>
                </div>

                <div>
                  <Label>Thay đổi thu nhập thuê (%)</Label>
                  <Slider
                    value={[customScenario.factors.rentalIncomeChange || 0]}
                    onValueChange={(value) => setCustomScenario(prev => ({ 
                      ...prev, 
                      factors: { ...prev.factors, rentalIncomeChange: value[0] } 
                    }))}
                    min={-10}
                    max={15}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    Hiện tại: {customScenario.factors.rentalIncomeChange || 0}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCustomScenario(false)}>
                Hủy
              </Button>
              <Button onClick={handleCustomScenarioSubmit}>
                Tạo Kịch Bản
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}