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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Brain,
  Crown,
  Star,
  Award,
  CheckCircle,
  Info,
  Lightbulb,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

import { RealEstateInputs, CalculationResult } from '@/types/real-estate';
import { formatVND, formatPercent } from '@/lib/financial-utils';
import {
  EnhancedEconomicScenarioGenerator,
  ENHANCED_ECONOMIC_SCENARIOS,
  EnhancedGeneratedScenario,
  EnhancedEconomicFactors,
  EnhancedEconomicScenario,
  MarketContext
} from '@/lib/enhanced-economic-scenarios';

// ===== INTERFACES =====
interface EnhancedEconomicScenarioGeneratorProps {
  inputs: RealEstateInputs;
  onScenariosGenerated: (scenarios: EnhancedGeneratedScenario[]) => void;
  onAddToComparison: (results: CalculationResult[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

// ===== MAIN COMPONENT =====
export default function EnhancedEconomicScenarioGeneratorUI({
  inputs,
  onScenariosGenerated,
  onAddToComparison,
  isOpen,
  onClose
}: EnhancedEconomicScenarioGeneratorProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['property_boom', 'market_correction', 'rental_boom']);
  const [generatedScenarios, setGeneratedScenarios] = useState<EnhancedGeneratedScenario[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomScenario, setShowCustomScenario] = useState(false);

  // ===== MARKET CONTEXT STATE =====
  const [marketContext, setMarketContext] = useState<MarketContext>({
    marketType: 'secondary',
    investorType: 'new_investor',
    purchaseDate: new Date(),
    currentMarketValue: inputs.giaTriBDS
  });

  // ===== CUSTOM SCENARIO STATE =====
  const [customScenario, setCustomScenario] = useState<{
    name: string;
    description: string;
    factors: Partial<EnhancedEconomicFactors>;
  }>({
    name: '',
    description: '',
    factors: {}
  });

  // ===== MARKET CONTEXT DETECTION =====
  const suggestedContext = useMemo(() => {
    const propertyValue = inputs.giaTriBDS || 0;
    const suggestions = [];

    // Auto-detect likely investor type based on inputs
    // Removed scenarioName check as it's not part of RealEstateInputs
    // For now, default to new_investor or add more sophisticated detection if needed
    suggestions.push('new_investor');

    // Auto-detect market type based on property characteristics
    if (propertyValue > 5000000000) { // > 5 tỷ likely secondary
      suggestions.push('secondary');
    } else {
      suggestions.push('primary');
    }

    return suggestions;
  }, [inputs]);

  // ===== HANDLERS =====
  const handleGenerateScenarios = async () => {
    if (selectedScenarios.length === 0) return;
    
    setIsGenerating(true);
    try {
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const scenarios = EnhancedEconomicScenarioGenerator.generateEnhancedScenarios(
        inputs,
        marketContext,
        selectedScenarios
      );
      
      setGeneratedScenarios(scenarios);
      onScenariosGenerated(scenarios);
    } catch (error) {
      console.error('Error generating enhanced scenarios:', error);
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
      scenarioName: `${gs.scenario.name} (${marketContext.investorType === 'existing_investor' ? 'Existing' : 'New'} - ${marketContext.marketType})`
    }));
    onAddToComparison(results);
    onClose();
  };

  const getScenarioIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      TrendingUp: <TrendingUp className="h-4 w-4" />,
      TrendingDown: <TrendingDown className="h-4 w-4" />,
      Target: <Target className="h-4 w-4" />,
      Shield: <Shield className="h-4 w-4" />,
      AlertTriangle: <AlertTriangle className="h-4 w-4" />,
      Rocket: <Rocket className="h-4 w-4" />,
      Home: <Home className="h-4 w-4" />,
      Settings: <Settings className="h-4 w-4" />
    };
    return iconMap[iconName] || <BarChart3 className="h-4 w-4" />;
  };

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactIcon = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return <ThumbsUp className="h-3 w-3" />;
      case 'negative': return <ThumbsDown className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced Economic Scenario Generator
          </DialogTitle>
          <DialogDescription>
            Context-aware analysis cho different investor types và market conditions
          </DialogDescription>
        </DialogHeader>

        <TooltipProvider>
          <Tabs defaultValue="context" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="context">Market Context</TabsTrigger>
              <TabsTrigger value="scenarios">Economic Scenarios</TabsTrigger>
              <TabsTrigger value="custom">Custom Scenario</TabsTrigger>
              <TabsTrigger value="results">Results & Analysis</TabsTrigger>
            </TabsList>

            {/* ===== MARKET CONTEXT SELECTION ===== */}
            <TabsContent value="context" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Investor Context
                  </CardTitle>
                  <CardDescription>
                    Chọn perspective của bạn để có analysis chính xác
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Investor Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Bạn là loại investor nào?</Label>
                    <RadioGroup 
                      value={marketContext.investorType} 
                      onValueChange={(value: 'new_investor' | 'existing_investor') => 
                        setMarketContext(prev => ({ ...prev, investorType: value }))
                      }
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="new_investor" id="new_investor" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="new_investor" className="font-medium cursor-pointer">
                              🆕 New Investor
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Đang muốn mua bất động sản đầu tư mới. Quan tâm đến entry cost và ROI potential.
                            </p>
                            <div className="mt-2 space-y-1 text-xs">
                              <div>• Chi phí mua ảnh hưởng trực tiếp</div>
                              <div>• Timing entry quan trọng</div>
                              <div>• Cần optimize purchase price</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="existing_investor" id="existing_investor" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="existing_investor" className="font-medium cursor-pointer">
                              🏠 Existing Investor
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Đã sở hữu bất động sản. Quan tâm đến asset value và rental optimization.
                            </p>
                            <div className="mt-2 space-y-1 text-xs">
                              <div>• Asset appreciation quan trọng</div>
                              <div>• Refinancing opportunities</div>
                              <div>• Portfolio optimization</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Market Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Market Type</Label>
                    <RadioGroup 
                      value={marketContext.marketType} 
                      onValueChange={(value: 'primary' | 'secondary') => 
                        setMarketContext(prev => ({ ...prev, marketType: value }))
                      }
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="primary" id="primary" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="primary" className="font-medium cursor-pointer">
                              🏢 Primary Market
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Mua từ chủ đầu tư. Giá niêm yết, delivery sau 1-2 năm.
                            </p>
                            <div className="mt-2 space-y-1 text-xs">
                              <div>• Giá ổn định hơn</div>
                              <div>• Payment schedule linh hoạt</div>
                              <div>• Warranty từ CĐT</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="secondary" id="secondary" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="secondary" className="font-medium cursor-pointer">
                              🔄 Secondary Market
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Mua từ người đã mua. Giá thị trường, nhận nhà ngay.
                            </p>
                            <div className="mt-2 space-y-1 text-xs">
                              <div>• Giá biến động theo thị trường</div>
                              <div>• Có thể thương lượng</div>
                              <div>• Instant ownership</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Purchase Date for Existing Investors */}
                  {marketContext.investorType === 'existing_investor' && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Thời gian mua (cho existing investors)</Label>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="purchase-date">Ngày mua</Label>
                          <Input
                            id="purchase-date"
                            type="date"
                            value={marketContext.purchaseDate?.toISOString().split('T')[0] || ''}
                            onChange={(e) => setMarketContext(prev => ({ 
                              ...prev, 
                              purchaseDate: new Date(e.target.value) 
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="current-value">Giá trị thị trường hiện tại</Label>
                          <Input
                            id="current-value"
                            type="number"
                            value={marketContext.currentMarketValue || ''}
                            onChange={(e) => setMarketContext(prev => ({ 
                              ...prev, 
                              currentMarketValue: Number(e.target.value) 
                            }))}
                            placeholder="Ví dụ: 2800000000"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auto-suggestions */}
                  <Alert className="border-blue-200 bg-blue-50">
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription className="text-blue-800">
                      <strong>💡 Gợi ý:</strong> Dựa trên dữ liệu bạn nhập, chúng tôi suggest{' '}
                      <Badge variant="outline">{suggestedContext.join(', ')}</Badge> context.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== ENHANCED SCENARIO SELECTION ===== */}
            <TabsContent value="scenarios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Enhanced Economic Scenarios
                  </CardTitle>
                  <CardDescription>
                    Chọn các scenarios để phân tích impact lên investment của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {ENHANCED_ECONOMIC_SCENARIOS.map((scenario) => (
                      <Card 
                        key={scenario.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedScenarios.includes(scenario.id) 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : ''
                        }`}
                        onClick={() => handleScenarioToggle(scenario.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedScenarios.includes(scenario.id)}
                                onChange={() => handleScenarioToggle(scenario.id)}
                                className="rounded"
                              />
                              <div className={`p-2 rounded-lg bg-gray-100`}>
                                {getScenarioIconComponent(scenario.icon)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{scenario.name}</h4>
                              <p className="text-xs text-muted-foreground mb-3">
                                {scenario.description}
                              </p>
                              
                              {/* Market Impact Indicators */}
                              <div className="space-y-2">
                                <h5 className="text-xs font-medium">Impact Analysis:</h5>
                                <div className="grid grid-cols-1 gap-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span>New Investors:</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getImpactColor(scenario.marketImpacts.newInvestors)}`}
                                    >
                                      {getImpactIcon(scenario.marketImpacts.newInvestors)}
                                      <span className="ml-1 capitalize">{scenario.marketImpacts.newInvestors}</span>
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span>Existing Investors:</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getImpactColor(scenario.marketImpacts.existingInvestors)}`}
                                    >
                                      {getImpactIcon(scenario.marketImpacts.existingInvestors)}
                                      <span className="ml-1 capitalize">{scenario.marketImpacts.existingInvestors}</span>
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span>Rental Market:</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getImpactColor(scenario.marketImpacts.rentalMarket)}`}
                                    >
                                      {getImpactIcon(scenario.marketImpacts.rentalMarket)}
                                      <span className="ml-1 capitalize">{scenario.marketImpacts.rentalMarket}</span>
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <Badge variant="outline" className="text-xs">
                                  {scenario.probability}% probability
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Selected: {selectedScenarios.length} scenarios
                      </span>
                      {marketContext.investorType && (
                        <Badge variant="outline">
                          {marketContext.investorType === 'existing_investor' ? 'Existing' : 'New'} Investor
                        </Badge>
                      )}
                      {marketContext.marketType && (
                        <Badge variant="outline">
                          {marketContext.marketType === 'primary' ? 'Primary' : 'Secondary'} Market
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleGenerateScenarios}
                      disabled={selectedScenarios.length === 0 || isGenerating}
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Enhanced Scenarios
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== CUSTOM SCENARIO ===== */}
            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create Custom Economic Scenario</CardTitle>
                  <CardDescription>
                    Tạo kịch bản kinh tế tùy chỉnh với các factors riêng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="custom-name">Scenario Name</Label>
                        <Input
                          id="custom-name"
                          value={customScenario.name}
                          onChange={(e) => setCustomScenario(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ví dụ: Custom High Inflation"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-description">Description</Label>
                        <Input
                          id="custom-description"
                          value={customScenario.description}
                          onChange={(e) => setCustomScenario(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Mô tả ngắn gọn scenario"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      <h4 className="font-medium">Economic Factors</h4>
                      
                      {/* Property Market Factors */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-sm text-blue-700">🏠 Property Market</h5>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Primary Market Price Change (%)</Label>
                            <Slider
                              value={[customScenario.factors.primaryMarketPriceChange || 0]}
                              onValueChange={(value) => setCustomScenario(prev => ({ 
                                ...prev, 
                                factors: { ...prev.factors, primaryMarketPriceChange: value[0] } 
                              }))}
                              min={-20}
                              max={30}
                              step={0.5}
                              className="mt-2"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              Current: {customScenario.factors.primaryMarketPriceChange || 0}%
                            </div>
                          </div>
                          <div>
                            <Label>Secondary Market Price Change (%)</Label>
                            <Slider
                              value={[customScenario.factors.secondaryMarketPriceChange || 0]}
                              onValueChange={(value) => setCustomScenario(prev => ({ 
                                ...prev, 
                                factors: { ...prev.factors, secondaryMarketPriceChange: value[0] } 
                              }))}
                              min={-30}
                              max={50}
                              step={0.5}
                              className="mt-2"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              Current: {customScenario.factors.secondaryMarketPriceChange || 0}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rental Market Factors */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-sm text-green-700">🏠 Rental Market</h5>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Rental Price Change (%)</Label>
                            <Slider
                              value={[customScenario.factors.rentalPriceChange || 0]}
                              onValueChange={(value) => setCustomScenario(prev => ({ 
                                ...prev, 
                                factors: { ...prev.factors, rentalPriceChange: value[0] } 
                              }))}
                              min={-15}
                              max={25}
                              step={0.5}
                              className="mt-2"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              Current: {customScenario.factors.rentalPriceChange || 0}%
                            </div>
                          </div>
                          <div>
                            <Label>Rental Demand Change (%)</Label>
                            <Slider
                              value={[customScenario.factors.rentalDemandChange || 0]}
                              onValueChange={(value) => setCustomScenario(prev => ({ 
                                ...prev, 
                                factors: { ...prev.factors, rentalDemandChange: value[0] } 
                              }))}
                              min={-20}
                              max={30}
                              step={1}
                              className="mt-2"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              Current: {customScenario.factors.rentalDemandChange || 0}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Financial Factors */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-sm text-purple-700">🏦 Financial</h5>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Bank Lending Rate Change (%)</Label>
                            <Slider
                              value={[customScenario.factors.bankLendingRateChange || 0]}
                              onValueChange={(value) => setCustomScenario(prev => ({ 
                                ...prev, 
                                factors: { ...prev.factors, bankLendingRateChange: value[0] } 
                              }))}
                              min={-3}
                              max={5}
                              step={0.1}
                              className="mt-2"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              Current: {customScenario.factors.bankLendingRateChange || 0}%
                            </div>
                          </div>
                          <div>
                            <Label>Credit Availability Change (%)</Label>
                            <Slider
                              value={[customScenario.factors.creditAvailabilityChange || 0]}
                              onValueChange={(value) => setCustomScenario(prev => ({ 
                                ...prev, 
                                factors: { ...prev.factors, creditAvailabilityChange: value[0] } 
                              }))}
                              min={-50}
                              max={30}
                              step={1}
                              className="mt-2"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              Current: {customScenario.factors.creditAvailabilityChange || 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCustomScenario(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          // Add custom scenario logic here
                          setShowCustomScenario(false);
                        }}
                        disabled={!customScenario.name.trim()}
                      >
                        Create Scenario
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== ENHANCED RESULTS ===== */}
            <TabsContent value="results" className="space-y-4">
              {generatedScenarios.length > 0 ? (
                <div className="space-y-4">
                  {/* Context Summary */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-blue-800">Analysis Context</h3>
                          <p className="text-sm text-blue-600">
                            {marketContext.investorType === 'existing_investor' ? 'Existing' : 'New'} Investor • 
                            {marketContext.marketType === 'primary' ? 'Primary' : 'Secondary'} Market
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {generatedScenarios.length} scenarios analyzed
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Results Grid */}
                  <div className="space-y-4">
                    {generatedScenarios.map((generated, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gray-100">
                                {getScenarioIconComponent(generated.scenario.icon)}
                              </div>
                              <div>
                                <h3 className="font-medium">{generated.scenario.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {generated.scenario.description}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              className={`${
                                generated.impactAnalysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                                generated.impactAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                generated.impactAnalysis.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {generated.impactAnalysis.riskLevel.toUpperCase()} RISK
                            </Badge>
                          </div>

                          <div className="grid gap-4 md:grid-cols-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">
                                {formatPercent(generated.result.roiHangNam || 0)}
                              </div>
                              <div className="text-sm text-muted-foreground">ROI/năm</div>
                              <div className="text-xs text-blue-600">
                                {generated.impactAnalysis.roiChange >= 0 ? '+' : ''}
                                {generated.impactAnalysis.roiChange.toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">
                                {formatVND(generated.result.steps?.dongTienRongBDS || 0)}
                              </div>
                              <div className="text-sm text-muted-foreground">Cash Flow</div>
                              <div className="text-xs text-green-600">
                                {generated.impactAnalysis.cashFlowChange >= 0 ? '+' : ''}
                                {(generated.impactAnalysis.cashFlowChange / 1000000).toFixed(1)}M
                              </div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">
                                {generated.result.paybackPeriod > 0 ? 
                                  `${generated.result.paybackPeriod.toFixed(1)} năm` : 
                                  'N/A'
                                }
                              </div>
                              <div className="text-sm text-muted-foreground">Payback</div>
                              <div className="text-xs text-purple-600">
                                {generated.impactAnalysis.paybackChange >= 0 ? '+' : ''}
                                {generated.impactAnalysis.paybackChange.toFixed(1)} năm
                              </div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-lg font-bold text-orange-600">
                                {generated.scenario.probability}%
                              </div>
                              <div className="text-sm text-muted-foreground">Probability</div>
                              <div className="text-xs text-orange-600">
                                {generated.scenario.timeframe}
                              </div>
                            </div>
                          </div>

                          {/* Key Impacts */}
                          {generated.impactAnalysis.keyImpacts.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-sm mb-2">🎯 Key Impacts:</h4>
                              <div className="flex flex-wrap gap-2">
                                {generated.impactAnalysis.keyImpacts.map((impact, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {impact}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Investor Advice */}
                          {generated.impactAnalysis.investorAdvice.length > 0 && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h4 className="font-medium text-sm text-blue-800 mb-2">💡 Recommendations:</h4>
                              <div className="space-y-1">
                                {generated.impactAnalysis.investorAdvice.map((advice, i) => (
                                  <div key={i} className="text-sm text-blue-700 flex items-start gap-2">
                                    <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>{advice}</span>
                                  </div>
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
                      Generate Again
                    </Button>
                    <Button onClick={handleAddToComparison}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Add to Comparison
                    </Button>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No scenarios generated yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set your market context và chọn scenarios để bắt đầu analysis
                    </p>
                    
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}