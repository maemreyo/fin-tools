"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Info,
  ArrowLeft,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Calendar,
  DollarSign,
  Settings,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Clock,
  Rocket,
  Star,
  Wand2
} from 'lucide-react';

import { RealEstateInputs, CalculationResult } from '@/types/real-estate';
import { TimelineEvent, TimelineEventType, TimelineScenario } from '@/types/timeline';
import { TimelineEnabledInputs, SuggestedEvent } from '@/types/timeline-integration';
import { EVENT_TYPE_CONFIG, EVENT_TEMPLATES, getEventTemplate } from '@/lib/timeline-constants';
import { IntegratedRealEstateCalculator } from '@/lib/timeline-integration';
import { createTimelineScenario } from '@/lib/timeline-engine';
import { formatVND } from '@/lib/financial-utils';

// ===== COMPONENT INTERFACES =====

interface ProgressiveDisclosureProps {
  inputs: RealEstateInputs;
  onInputsChange: (inputs: TimelineEnabledInputs) => void;
  onTimelineCreate: (scenario: TimelineScenario) => void;
  initialMode?: 'BASIC' | 'EXPERT';
  showWizard?: boolean;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isOptional: boolean;
  estimatedTime: number; // minutes
}

interface LearningCard {
  id: string;
  title: string;
  description: string;
  benefit: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedSavings?: number;
  icon: React.ReactNode;
  eventType?: TimelineEventType;
}

// ===== MAIN PROGRESSIVE DISCLOSURE COMPONENT =====

export const ProgressiveDisclosureUI: React.FC<ProgressiveDisclosureProps> = ({
  inputs,
  onInputsChange,
  onTimelineCreate,
  initialMode = 'BASIC',
  showWizard = true
}) => {
  const [currentMode, setCurrentMode] = useState<'BASIC' | 'EXPERT'>(initialMode);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basics']));
  const [isWizardMode, setIsWizardMode] = useState(showWizard);
  const [isCreatingTimeline, setIsCreatingTimeline] = useState(false);
  const [timelineInputs, setTimelineInputs] = useState<TimelineEnabledInputs>({
    ...inputs,
    enableTimeline: false,
    timelineStartDate: new Date(),
    includeInflation: false,
    inflationRate: 3.0,
    includePropertyAppreciation: false,
    appreciationRate: 5.0
  });

  // ===== WIZARD STEPS CONFIGURATION =====

  const wizardSteps: WizardStep[] = useMemo(() => [
    {
      id: 'property',
      title: 'Thông tin bất động sản',
      description: 'Nhập thông tin cơ bản về BĐS và khoản vay',
      icon: <DollarSign className="h-5 w-5" />,
      isCompleted: !!(inputs.giaTriBDS && inputs.tyLeVay),
      isOptional: false,
      estimatedTime: 3
    },
    {
      id: 'timeline',
      title: 'Kích hoạt Timeline',
      description: 'Chọn chế độ timeline và cấu hình cơ bản',
      icon: <Calendar className="h-5 w-5" />,
      isCompleted: timelineInputs.enableTimeline,
      isOptional: false,
      estimatedTime: 2
    },
    {
      id: 'events',
      title: 'Sự kiện quan trọng',
      description: currentMode === 'BASIC' ? 'Thêm 3-4 sự kiện cơ bản' : 'Tạo timeline chi tiết',
      icon: <Target className="h-5 w-5" />,
      isCompleted: false, // Will be calculated based on events
      isOptional: false,
      estimatedTime: currentMode === 'BASIC' ? 5 : 15
    },
    {
      id: 'review',
      title: 'Xem lại và tạo',
      description: 'Kiểm tra thông tin và tạo timeline',
      icon: <CheckCircle className="h-5 w-5" />,
      isCompleted: false,
      isOptional: false,
      estimatedTime: 2
    }
  ], [inputs.giaTriBDS, inputs.tyLeVay, timelineInputs.enableTimeline, currentMode]);

  // ===== LEARNING CARDS CONFIGURATION =====

  const learningCards: LearningCard[] = useMemo(() => [
    {
      id: 'early-payment',
      title: 'Trả nợ trước hạn',
      description: 'Giảm tổng lãi phải trả và rút ngắn thời gian vay',
      benefit: 'Tiết kiệm lãi suất đáng kể',
      difficulty: 'EASY',
      estimatedSavings: 200000000, // 200M VND
      icon: <Zap className="h-5 w-5" />,
      eventType: TimelineEventType.EARLY_PAYMENT
    },
    {
      id: 'rate-change',
      title: 'Thay đổi lãi suất',
      description: 'Chuẩn bị cho việc kết thúc ưu đãi và lãi suất thả nổi',
      benefit: 'Dự đoán dòng tiền tương lai chính xác',
      difficulty: 'MEDIUM',
      icon: <TrendingUp className="h-5 w-5" />,
      eventType: TimelineEventType.INTEREST_RATE_CHANGE
    },
    {
      id: 'cash-flow',
      title: 'Cập nhật dòng tiền',
      description: 'Theo dõi thay đổi thu nhập và chi phí theo thời gian',
      benefit: 'Quản lý dòng tiền tốt hơn',
      difficulty: 'MEDIUM',
      icon: <DollarSign className="h-5 w-5" />,
      eventType: TimelineEventType.CASH_FLOW_UPDATE
    },
    {
      id: 'grace-period',
      title: 'Ân hạn gốc',
      description: 'Thiết lập thời gian chỉ trả lãi, chưa trả gốc',
      benefit: 'Giảm áp lực dòng tiền ban đầu',
      difficulty: 'EASY',
      icon: <Shield className="h-5 w-5" />,
      eventType: TimelineEventType.PRINCIPAL_GRACE_PERIOD
    }
  ], []);

  // ===== EVENT HANDLERS =====

  const handleModeSwitch = useCallback((mode: 'BASIC' | 'EXPERT') => {
    setCurrentMode(mode);
    // Reset wizard when switching modes
    if (mode === 'BASIC') {
      setCurrentStep(Math.min(currentStep, 2)); // Limit to basic steps
    }
  }, [currentStep]);

  const handleStepComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    // Auto-advance to next step
    const currentStepIndex = wizardSteps.findIndex(step => step.id === stepId);
    if (currentStepIndex !== -1 && currentStepIndex < wizardSteps.length - 1) {
      setCurrentStep(currentStepIndex + 1);
    }
  }, [wizardSteps]);

  const handleTimelineEnable = useCallback(() => {
    const enabledInputs = {
      ...timelineInputs,
      enableTimeline: true,
      timelineStartDate: new Date()
    };
    setTimelineInputs(enabledInputs);
    onInputsChange(enabledInputs);
    handleStepComplete('timeline');
    
    toast.success('Timeline đã được kích hoạt!', {
      description: 'Bạn có thể bắt đầu thêm sự kiện',
    });
  }, [timelineInputs, onInputsChange, handleStepComplete]);

  const handleAddLearningEvent = useCallback(async (card: LearningCard) => {
    if (!card.eventType) return;

    try {
      // Create suggested event from learning card
      const template = EVENT_TEMPLATES.find(t => t.type === card.eventType);
      if (template) {
        const newEvent: TimelineEvent = {
          ...template.defaultValues,
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: card.eventType,
          name: card.title,
          description: card.description,
          month: 12, // Default to month 12
          isActive: true,
          createdAt: new Date()
        } as TimelineEvent;

        toast.success('Sự kiện đã được thêm!', {
          description: `${card.title} - Tháng 12`,
        });

        // Would integrate with parent component here
        console.log('Created event:', newEvent);
      }
    } catch (error) {
      console.error('Error adding learning event:', error);
      toast.error('Có lỗi khi thêm sự kiện');
    }
  }, []);

  const handleCreateTimeline = useCallback(async () => {
    if (!timelineInputs.enableTimeline) {
      toast.error('Vui lòng kích hoạt Timeline trước');
      return;
    }

    setIsCreatingTimeline(true);
    
    try {
      // Create basic timeline scenario with minimal events
      const basicEvents: TimelineEvent[] = [
        {
          id: `loan_disbursement_${Date.now()}`,
          type: TimelineEventType.LOAN_DISBURSEMENT,
          name: 'Giải ngân khoản vay',
          description: 'Giải ngân khoản vay chính',
          month: 1,
          isActive: true,
          createdAt: new Date(),
          amount: (inputs.giaTriBDS * inputs.tyLeVay) / 100,
          loanBalance: (inputs.giaTriBDS * inputs.tyLeVay) / 100,
          interestRate: inputs.laiSuatUuDai
        } as any,
        {
          id: `rate_change_${Date.now()}`,
          type: TimelineEventType.INTEREST_RATE_CHANGE,
          name: 'Kết thúc ưu đãi lãi suất',
          description: 'Chuyển từ lãi suất ưu đãi sang lãi suất thả nổi',
          month: inputs.thoiGianUuDai || 24,
          isActive: true,
          createdAt: new Date(),
          newRate: inputs.laiSuatThaNoi,
          oldRate: inputs.laiSuatUuDai,
          reason: 'promotion_end'
        } as any
      ];

      // Create timeline scenario
      const scenario = await createTimelineScenario(
        timelineInputs,
        basicEvents,
        `Timeline Scenario - ${currentMode} Mode`
      );

      toast.success('Timeline đã được tạo thành công!', {
        description: `${scenario.monthlyBreakdowns.length} tháng được mô phỏng`,
      });

      onTimelineCreate(scenario);
      handleStepComplete('review');

    } catch (error) {
      console.error('Error creating timeline:', error);
      toast.error('Có lỗi khi tạo timeline', {
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
      });
    } finally {
      setIsCreatingTimeline(false);
    }
  }, [timelineInputs, inputs, currentMode, onTimelineCreate, handleStepComplete]);

  // ===== MISSING RENDER METHODS IMPLEMENTATION =====

  const renderBasicModeContent = () => (
    <div className="space-y-6">
      {/* Learning Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Sự kiện quan trọng nên thêm
          </CardTitle>
          <CardDescription>
            Chọn 3-4 sự kiện cơ bản để tối ưu hóa khoản đầu tư của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningCards.map((card) => (
              <Card
                key={card.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => handleAddLearningEvent(card)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{card.title}</h4>
                        <Badge variant={card.difficulty === 'EASY' ? 'default' : 'secondary'}>
                          {card.difficulty === 'EASY' ? 'Dễ' : 'Trung bình'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {card.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600">
                          {card.benefit}
                        </Badge>
                        {card.estimatedSavings && (
                          <span className="text-xs text-green-600">
                            💰 {formatVND(card.estimatedSavings)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Điều khiển Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={handleCreateTimeline} 
              className="flex-1"
              disabled={!timelineInputs.enableTimeline || isCreatingTimeline}
            >
              {isCreatingTimeline ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo Timeline...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Tạo Timeline cơ bản
                </>
              )}
            </Button>
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExpertModeContent = () => (
    <div className="space-y-6">
      {/* Advanced Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cấu hình nâng cao
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Economic Settings */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 font-semibold">
              <ChevronRight className="h-4 w-4" />
              Cài đặt kinh tế vĩ mô
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={timelineInputs.includeInflation}
                      onCheckedChange={(checked) => {
                        const updatedInputs = { ...timelineInputs, includeInflation: checked };
                        setTimelineInputs(updatedInputs);
                        onInputsChange(updatedInputs);
                      }}
                    />
                    <Label>Bao gồm lạm phát</Label>
                  </div>
                  {timelineInputs.includeInflation && (
                    <div className="ml-6">
                      <Label>Lạm phát hàng năm (%)</Label>
                      <Input
                        type="number"
                        value={timelineInputs.inflationRate}
                        onChange={(e) => {
                          const updatedInputs = { 
                            ...timelineInputs, 
                            inflationRate: parseFloat(e.target.value) || 0
                          };
                          setTimelineInputs(updatedInputs);
                          onInputsChange(updatedInputs);
                        }}
                        min="0"
                        max="20"
                        step="0.1"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={timelineInputs.includePropertyAppreciation}
                      onCheckedChange={(checked) => {
                        const updatedInputs = { ...timelineInputs, includePropertyAppreciation: checked };
                        setTimelineInputs(updatedInputs);
                        onInputsChange(updatedInputs);
                      }}
                    />
                    <Label>Tăng giá BĐS</Label>
                  </div>
                  {timelineInputs.includePropertyAppreciation && (
                    <div className="ml-6">
                      <Label>Tăng giá hàng năm (%)</Label>
                      <Input
                        type="number"
                        value={timelineInputs.appreciationRate}
                        onChange={(e) => {
                          const updatedInputs = { 
                            ...timelineInputs, 
                            appreciationRate: parseFloat(e.target.value) || 0
                          };
                          setTimelineInputs(updatedInputs);
                          onInputsChange(updatedInputs);
                        }}
                        min="0"
                        max="20"
                        step="0.1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* AI Suggestions */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 font-semibold">
              <ChevronRight className="h-4 w-4" />
              Gợi ý AI thông minh
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Tối ưu tự động</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    AI sẽ phân tích dữ liệu của bạn và đề xuất timeline tối ưu
                  </p>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Tạo timeline AI
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Expert Timeline Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Điều khiển Timeline Chuyên gia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={handleCreateTimeline} 
              className="flex-1"
              disabled={!timelineInputs.enableTimeline || isCreatingTimeline}
            >
              {isCreatingTimeline ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo Timeline...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Tạo Timeline chuyên gia
                </>
              )}
            </Button>
            <Button variant="outline">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Tối ưu
            </Button>
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderModeSelector = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Chế độ Timeline
            </CardTitle>
            <CardDescription>
              Chọn mức độ chi tiết phù hợp với kinh nghiệm của bạn
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={currentMode === 'BASIC' ? 'default' : 'outline'}
              onClick={() => handleModeSwitch('BASIC')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Cơ bản
            </Button>
            <Button
              variant={currentMode === 'EXPERT' ? 'default' : 'outline'}
              onClick={() => handleModeSwitch('EXPERT')}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Chuyên gia
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Card className={`p-4 ${currentMode === 'BASIC' ? 'border-primary' : ''}`}>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Chế độ Cơ bản
              </h4>
              <p className="text-sm text-muted-foreground">
                4-5 sự kiện quan trọng nhất, phù hợp người mới
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">Đơn giản</Badge>
                <Badge variant="secondary">5-10 phút</Badge>
                <Badge variant="secondary">Học tập</Badge>
              </div>
            </div>
          </Card>
          <Card className={`p-4 ${currentMode === 'EXPERT' ? 'border-primary' : ''}`}>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Chế độ Chuyên gia
              </h4>
              <p className="text-sm text-muted-foreground">
                Toàn bộ sự kiện timeline, phân tích chuyên sâu
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">Chi tiết</Badge>
                <Badge variant="secondary">15-30 phút</Badge>
                <Badge variant="secondary">Tối ưu</Badge>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  const renderWizardProgress = () => {
    const totalSteps = wizardSteps.length;
    const progress = (currentStep / (totalSteps - 1)) * 100;
    const totalTime = wizardSteps.reduce((sum, step) => sum + step.estimatedTime, 0);
    const completedTime = wizardSteps
      .slice(0, currentStep)
      .reduce((sum, step) => sum + step.estimatedTime, 0);

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tiến độ Timeline Setup
              </CardTitle>
              <CardDescription>
                Bước {currentStep + 1}/{totalSteps} - Ước tính còn {totalTime - completedTime} phút
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWizardMode(!isWizardMode)}
            >
              {isWizardMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isWizardMode ? 'Tạm dừng' : 'Tiếp tục'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {wizardSteps.map((step, index) => (
              <div
                key={step.id}
                className={`text-center p-2 rounded-lg border ${
                  index === currentStep
                    ? 'border-primary bg-primary/10'
                    : completedSteps.has(step.id)
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {completedSteps.has(step.id) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="text-xs font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">
                  {step.estimatedTime}min
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCurrentStepContent = () => {
    const currentStepData = wizardSteps[currentStep];
    if (!currentStepData) return null;

    switch (currentStepData.id) {
      case 'property':
        return (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Vui lòng hoàn tất thông tin bất động sản ở phần trên trước khi tiếp tục
            </AlertDescription>
          </Alert>
        );
      
      case 'timeline':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Kích hoạt Timeline</CardTitle>
              <CardDescription>
                Chuyển từ tính toán tĩnh sang mô phỏng timeline 240 tháng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTimelineEnable}
                disabled={timelineInputs.enableTimeline}
                size="lg"
                className="w-full"
              >
                {timelineInputs.enableTimeline ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Timeline đã được kích hoạt
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5 mr-2" />
                    Kích hoạt Timeline ngay
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      
      default:
        return currentMode === 'BASIC' ? renderBasicModeContent() : renderExpertModeContent();
    }
  };

  // ===== MAIN RENDER =====

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Mode Selector */}
        {renderModeSelector()}

        {/* Wizard Progress */}
        {isWizardMode && renderWizardProgress()}

        {/* Wizard Navigation */}
        {isWizardMode && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>

                <div className="text-center">
                  <h3 className="font-semibold">{wizardSteps[currentStep]?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {wizardSteps[currentStep]?.description}
                  </p>
                </div>

                <Button
                  onClick={() => setCurrentStep(Math.min(wizardSteps.length - 1, currentStep + 1))}
                  disabled={currentStep === wizardSteps.length - 1}
                >
                  Tiếp theo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Step Content */}
        {isWizardMode ? renderCurrentStepContent() : (
          currentMode === 'BASIC' ? renderBasicModeContent() : renderExpertModeContent()
        )}
      </div>
    </TooltipProvider>
  );
};

export default ProgressiveDisclosureUI;