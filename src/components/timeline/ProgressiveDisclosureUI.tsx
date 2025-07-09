/**
 * PROGRESSIVE DISCLOSURE UI & WIZARD FLOW
 * User-friendly step-by-step interface for timeline creation
 */

"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  RotateCcw
} from 'lucide-react';

import { RealEstateInputs, CalculationResult } from '@/types/real-estate';
import { TimelineEvent, TimelineEventType, TimelineScenario } from '@/types/timeline';
import { TimelineEnabledInputs, SuggestedEvent } from '@/types/timeline-integration';
import { EVENT_TYPE_CONFIG, EVENT_TEMPLATES } from '@/lib/timeline-constants';
import { IntegratedRealEstateCalculator } from '@/lib/timeline-integration';

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
      estimatedTime: currentMode === 'BASIC' ? 5 : 10
    },
    {
      id: 'optimization',
      title: 'Tối ưu hóa',
      description: 'Xem gợi ý và tối ưu timeline',
      icon: <TrendingUp className="h-5 w-5" />,
      isCompleted: false,
      isOptional: true,
      estimatedTime: 5
    },
    {
      id: 'review',
      title: 'Xem trước & Tạo',
      description: 'Kiểm tra và tạo timeline hoàn chỉnh',
      icon: <CheckCircle className="h-5 w-5" />,
      isCompleted: false,
      isOptional: false,
      estimatedTime: 2
    }
  ], [inputs, timelineInputs, currentMode]);

  // ===== LEARNING CARDS FOR BASIC MODE =====

  const learningCards: LearningCard[] = useMemo(() => [
    {
      id: 'cash-payment',
      title: 'Thanh toán vốn tự có',
      description: 'Theo dõi việc thanh toán tiền mặt ban đầu và chi phí phát sinh',
      benefit: 'Quản lý dòng tiền chính xác từ đầu',
      difficulty: 'EASY',
      icon: <DollarSign className="h-5 w-5" />,
      eventType: TimelineEventType.CASH_PAYMENT
    },
    {
      id: 'loan-disbursement',
      title: 'Giải ngân khoản vay',
      description: 'Theo dõi thời điểm và số tiền ngân hàng giải ngân',
      benefit: 'Tính toán lãi suất chính xác từng tháng',
      difficulty: 'EASY',
      icon: <Shield className="h-5 w-5" />,
      eventType: TimelineEventType.LOAN_DISBURSEMENT
    },
    {
      id: 'early-payment',
      title: 'Trả nợ trước hạn',
      description: 'Lập kế hoạch trả nợ sớm để tiết kiệm lãi suất',
      benefit: 'Tiết kiệm hàng trăm triệu lãi vay',
      difficulty: 'MEDIUM',
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
  }, [timelineInputs, onInputsChange, handleStepComplete]);

  const handleAddLearningEvent = useCallback(async (card: LearningCard) => {
    if (!card.eventType) return;

    // Create suggested event from learning card
    const template = EVENT_TEMPLATES.find(t => t.type === card.eventType);
    if (template) {
      // Add event using template defaults
      // This would integrate with the EventManagement component
      console.log('Adding event from learning card:', card.title);
    }
  }, []);

  const handleCreateTimeline = useCallback(async () => {
    try {
      const result = await IntegratedRealEstateCalculator.calculateWithTimeline(timelineInputs);
      
      if (result.canUpgradeToTimeline) {
        // Show upgrade options
        console.log('Can upgrade to timeline');
      } else {
        // Timeline already created
        onTimelineCreate(result as any);
      }
    } catch (error) {
      console.error('Error creating timeline:', error);
    }
  }, [timelineInputs, onTimelineCreate]);

  // ===== RENDER METHODS =====

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
          <div className="grid grid-cols-5 gap-2">
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
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="text-xs font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">
                  {step.estimatedTime}p
                </div>
                {step.isOptional && (
                  <Badge variant="outline" className="text-xs mt-1">
                    Tùy chọn
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBasicModeContent = () => (
    <div className="space-y-6">
      {/* Learning Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Sự kiện Timeline cơ bản
          </CardTitle>
          <CardDescription>
            Học về các sự kiện quan trọng và ảnh hưởng của chúng đến khoản đầu tư
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningCards.map(card => (
              <Card
                key={card.id}
                className="p-4 hover:shadow-md transition-all cursor-pointer border-l-4"
                style={{ borderLeftColor: card.eventType ? EVENT_TYPE_CONFIG[card.eventType].color : '#gray' }}
                onClick={() => handleAddLearningEvent(card)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {card.icon}
                      <h4 className="font-semibold">{card.title}</h4>
                    </div>
                    <Badge
                      variant={
                        card.difficulty === 'EASY'
                          ? 'default'
                          : card.difficulty === 'MEDIUM'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {card.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {card.benefit}
                    </div>
                    {card.estimatedSavings && (
                      <div className="text-sm font-semibold text-blue-600">
                        Tiết kiệm ước tính: {card.estimatedSavings.toLocaleString('vi-VN')} ₫
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Thêm sự kiện này
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
          <CardDescription>
            Tạo timeline với cấu hình được đề xuất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={handleTimelineEnable}
              disabled={timelineInputs.enableTimeline}
              className="flex-1"
            >
              {timelineInputs.enableTimeline ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              {timelineInputs.enableTimeline ? 'Timeline đã kích hoạt' : 'Kích hoạt Timeline'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                // Generate recommended timeline
                console.log('Generating recommended timeline');
              }}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Tạo timeline đề xuất
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
          {/* Advanced Settings */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 font-semibold">
              <ChevronRight className="h-4 w-4" />
              Cài đặt kinh tế vĩ mô
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lạm phát hàng năm (%)</Label>
                  <Input
                    type="number"
                    value={timelineInputs.inflationRate}
                    onChange={(e) => setTimelineInputs(prev => ({
                      ...prev,
                      inflationRate: parseFloat(e.target.value) || 3.0
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tăng giá BĐS hàng năm (%)</Label>
                  <Input
                    type="number"
                    value={timelineInputs.appreciationRate}
                    onChange={(e) => setTimelineInputs(prev => ({
                      ...prev,
                      appreciationRate: parseFloat(e.target.value) || 5.0
                    }))}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Event Categories */}
          <div className="space-y-3">
            <h4 className="font-semibold">Loại sự kiện có sẵn</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    // Open event creation for this type
                    console.log('Creating event of type:', type);
                  }}
                >
                  <span className="mr-2">{config.icon}</span>
                  {config.description}
                </Button>
              ))}
            </div>
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
            <Button onClick={handleCreateTimeline} className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Tạo Timeline hoàn chỉnh
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