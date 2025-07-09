/**
 * TIMELINE DASHBOARD - MAIN INTEGRATION COMPONENT
 * Complete timeline interface integrating all components
 */

"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  Calendar,
  BarChart3,
  Settings,
  Save,
  Download,
  Share,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';

import { RealEstateInputs, CalculationResult } from '@/types/real-estate';
import { 
  TimelineEvent, 
  TimelineScenario, 
  MonthlyBreakdown,
  TimelineEventType 
} from '@/types/timeline';
import { TimelineEnabledInputs, TimelineAwareResult } from '@/types/timeline-integration';

// Import timeline components
import TimelineVisualization from './TimelineVisualization';
import EventManagement from './EventManagement';
import ProgressiveDisclosureUI from './ProgressiveDisclosureUI';

// Import engines and utilities
import { TimelineSimulationEngine, createTimelineScenario } from '@/lib/timeline-engine';
import { IntegratedRealEstateCalculator } from '@/lib/timeline-integration';
import { TimelineValidator } from '@/lib/timeline-validation';
import { formatVND } from '@/lib/financial-utils';

// ===== COMPONENT INTERFACES =====

interface TimelineDashboardProps {
  initialInputs: RealEstateInputs;
  initialResult?: CalculationResult;
  onScenarioSave?: (scenario: TimelineScenario) => void;
  onScenarioLoad?: (scenarioId: string) => void;
  mode?: 'INTEGRATED' | 'STANDALONE';
}

interface DashboardState {
  inputs: TimelineEnabledInputs;
  events: TimelineEvent[];
  currentScenario: TimelineScenario | null;
  isCalculating: boolean;
  hasUnsavedChanges: boolean;
  validationResult: any;
  activeView: 'SETUP' | 'TIMELINE' | 'ANALYSIS';
  timelineMode: 'BASIC' | 'EXPERT';
}

// ===== MAIN TIMELINE DASHBOARD =====

export const TimelineDashboard: React.FC<TimelineDashboardProps> = ({
  initialInputs,
  initialResult,
  onScenarioSave,
  onScenarioLoad,
  mode = 'INTEGRATED'
}) => {
  // ===== STATE MANAGEMENT =====
  
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    inputs: {
      ...initialInputs,
      enableTimeline: false,
      timelineStartDate: new Date(),
      includeInflation: false,
      inflationRate: 3.0,
      includePropertyAppreciation: false,
      appreciationRate: 5.0
    },
    events: [],
    currentScenario: null,
    isCalculating: false,
    hasUnsavedChanges: false,
    validationResult: null,
    activeView: 'SETUP',
    timelineMode: 'BASIC'
  });

  // UI State
  const [eventManagementOpen, setEventManagementOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isAutoRecalculate, setIsAutoRecalculate] = useState(true);

  // ===== COMPUTED VALUES =====

  const canCreateTimeline = useMemo(() => {
    return !!(
      dashboardState.inputs.giaTriBDS &&
      dashboardState.inputs.tyLeVay &&
      dashboardState.inputs.enableTimeline
    );
  }, [dashboardState.inputs]);

  const timelineStats = useMemo(() => {
    if (!dashboardState.currentScenario) return null;

    const scenario = dashboardState.currentScenario;
    const monthlyBreakdowns = scenario.monthlyBreakdowns;
    
    const negativeCashFlowMonths = monthlyBreakdowns.filter(m => m.finalCashFlow < 0).length;
    const averageCashFlow = monthlyBreakdowns.reduce((sum, m) => sum + m.finalCashFlow, 0) / monthlyBreakdowns.length;
    const totalInterestSaved = scenario.totalInterestPaid;
    
    return {
      totalMonths: monthlyBreakdowns.length,
      negativeCashFlowMonths,
      averageCashFlow,
      totalInterestSaved,
      payoffMonth: scenario.payoffMonth,
      complexity: scenario.complexity,
      hasErrors: scenario.hasErrors,
      errorCount: scenario.errors.length,
      warningCount: scenario.warnings.length
    };
  }, [dashboardState.currentScenario]);

  // ===== EVENT HANDLERS =====

  const handleInputsChange = useCallback((newInputs: TimelineEnabledInputs) => {
    setDashboardState(prev => ({
      ...prev,
      inputs: newInputs,
      hasUnsavedChanges: true
    }));

    // Auto-recalculate if enabled and timeline is ready
    if (isAutoRecalculate && newInputs.enableTimeline && canCreateTimeline) {
      handleRecalculateTimeline(newInputs);
    }
  }, [isAutoRecalculate, canCreateTimeline]);

  const handleEventAdd = useCallback((month: number) => {
    setSelectedMonth(month);
    setEventManagementOpen(true);
  }, []);

  const handleEventCreate = useCallback((event: TimelineEvent) => {
    setDashboardState(prev => ({
      ...prev,
      events: [...prev.events, event],
      hasUnsavedChanges: true
    }));

    setEventManagementOpen(false);
    
    // Auto-recalculate if enabled
    if (isAutoRecalculate && canCreateTimeline) {
      handleRecalculateTimeline();
    }

    toast.success('Đã thêm sự kiện thành công', {
      description: `${event.name} - Tháng ${event.month}`,
    });
  }, [isAutoRecalculate, canCreateTimeline]);

  const handleEventUpdate = useCallback((updatedEvent: TimelineEvent) => {
    setDashboardState(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === updatedEvent.id ? updatedEvent : e),
      hasUnsavedChanges: true
    }));

    if (isAutoRecalculate && canCreateTimeline) {
      handleRecalculateTimeline();
    }

    toast.success('Đã cập nhật sự kiện', {
      description: updatedEvent.name,
    });
  }, [isAutoRecalculate, canCreateTimeline]);

  const handleEventDelete = useCallback((eventId: string) => {
    const event = dashboardState.events.find(e => e.id === eventId);
    
    setDashboardState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== eventId),
      hasUnsavedChanges: true
    }));

    if (isAutoRecalculate && canCreateTimeline) {
      handleRecalculateTimeline();
    }

    toast.success('Đã xóa sự kiện', {
      description: event?.name || 'Sự kiện đã được xóa',
    });
  }, [dashboardState.events, isAutoRecalculate, canCreateTimeline]);

  const handleEventMove = useCallback((eventId: string, newMonth: number) => {
    const event = dashboardState.events.find(e => e.id === eventId);
    if (!event) return;

    const updatedEvent = { ...event, month: newMonth };
    handleEventUpdate(updatedEvent);

    toast.success('Đã di chuyển sự kiện', {
      description: `${event.name} → Tháng ${newMonth}`,
    });
  }, [dashboardState.events, handleEventUpdate]);

  const handleRecalculateTimeline = useCallback(async (customInputs?: TimelineEnabledInputs) => {
    const inputs = customInputs || dashboardState.inputs;
    
    if (!inputs.enableTimeline || !canCreateTimeline) {
      return;
    }

    setDashboardState(prev => ({ ...prev, isCalculating: true }));

    try {
      // Validate events first
      const validator = new TimelineValidator();
      const validation = validator.validate(dashboardState.events, inputs);
      
      if (validation.errors.length > 0) {
        toast.error('Có lỗi trong timeline', {
          description: `${validation.errors.length} lỗi cần khắc phục`,
        });
        
        setDashboardState(prev => ({
          ...prev,
          validationResult: validation,
          isCalculating: false
        }));
        return;
      }

      // Create timeline scenario
      const scenario = await createTimelineScenario(
        inputs,
        dashboardState.events,
        `Timeline Scenario - ${new Date().toLocaleDateString('vi-VN')}`
      );

      setDashboardState(prev => ({
        ...prev,
        currentScenario: scenario,
        validationResult: validation,
        isCalculating: false,
        hasUnsavedChanges: false
      }));

      // Auto-navigate to timeline view if successful
      if (dashboardState.activeView === 'SETUP') {
        setDashboardState(prev => ({ ...prev, activeView: 'TIMELINE' }));
      }

      toast.success('Timeline đã được tạo thành công!', {
        description: `${scenario.monthlyBreakdowns.length} tháng được mô phỏng`,
      });

    } catch (error) {
      console.error('Timeline calculation error:', error);
      setDashboardState(prev => ({ ...prev, isCalculating: false }));
      
      toast.error('Lỗi tính toán timeline', {
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo timeline',
      });
    }
  }, [dashboardState.inputs, dashboardState.events, canCreateTimeline, dashboardState.activeView]);

  const handleTimelineCreate = useCallback((scenario: TimelineScenario) => {
    setDashboardState(prev => ({
      ...prev,
      currentScenario: scenario,
      activeView: 'TIMELINE',
      hasUnsavedChanges: false
    }));

    toast.success('Timeline đã được tạo!', {
      description: 'Chuyển sang tab Timeline để xem chi tiết',
    });
  }, []);

  const handleSaveScenario = useCallback(() => {
    if (!dashboardState.currentScenario) return;

    if (onScenarioSave) {
      onScenarioSave(dashboardState.currentScenario);
      setDashboardState(prev => ({ ...prev, hasUnsavedChanges: false }));
      
      toast.success('Đã lưu kịch bản', {
        description: dashboardState.currentScenario.scenarioName,
      });
    }
  }, [dashboardState.currentScenario, onScenarioSave]);

  const handleExportScenario = useCallback(() => {
    if (!dashboardState.currentScenario) return;

    const exportData = {
      ...dashboardState.currentScenario,
      exportedAt: new Date().toISOString(),
      inputs: dashboardState.inputs,
      events: dashboardState.events
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-scenario-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Đã xuất timeline', {
      description: 'File JSON đã được tải về',
    });
  }, [dashboardState.currentScenario, dashboardState.inputs, dashboardState.events]);

  // ===== RENDER METHODS =====

  const renderDashboardHeader = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Timeline Dashboard
              <Badge variant={dashboardState.timelineMode === 'BASIC' ? 'default' : 'secondary'}>
                {dashboardState.timelineMode === 'BASIC' ? 'Cơ bản' : 'Chuyên gia'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {dashboardState.inputs.enableTimeline 
                ? 'Timeline đã được kích hoạt - Quản lý và phân tích 240 tháng đầu tư'
                : 'Cấu hình timeline để phân tích chi tiết khoản đầu tư bất động sản'
              }
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-recalculate toggle */}
            <Button
              variant={isAutoRecalculate ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsAutoRecalculate(!isAutoRecalculate)}
            >
              {isAutoRecalculate ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              {isAutoRecalculate ? 'Auto' : 'Manual'}
            </Button>

            {/* Manual recalculate */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRecalculateTimeline()}
              disabled={!canCreateTimeline || dashboardState.isCalculating}
            >
              <RotateCcw className="h-4 w-4" />
              {dashboardState.isCalculating ? 'Đang tính...' : 'Tính lại'}
            </Button>

            {/* Save/Export */}
            {dashboardState.currentScenario && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveScenario}
                  disabled={!dashboardState.hasUnsavedChanges}
                >
                  <Save className="h-4 w-4" />
                  Lưu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportScenario}
                >
                  <Download className="h-4 w-4" />
                  Xuất
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status indicators */}
        {timelineStats && (
          <div className="flex items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant={timelineStats.hasErrors ? 'destructive' : 'default'}>
                {timelineStats.hasErrors ? (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                ) : (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {timelineStats.hasErrors ? `${timelineStats.errorCount} lỗi` : 'Hợp lệ'}
              </Badge>
              {timelineStats.warningCount > 0 && (
                <Badge variant="outline">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {timelineStats.warningCount} cảnh báo
                </Badge>
              )}
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="text-sm space-x-4">
              <span>Sự kiện: <strong>{dashboardState.events.length}</strong></span>
              <span>Dòng tiền TB: <strong>{formatVND(timelineStats.averageCashFlow)}</strong></span>
              <span>Trả hết nợ: <strong>Tháng {timelineStats.payoffMonth}</strong></span>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );

  const renderQuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hành động nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEventManagementOpen(true)}
            disabled={!dashboardState.inputs.enableTimeline}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm sự kiện
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDashboardState(prev => ({ ...prev, activeView: 'TIMELINE' }))}
            disabled={!dashboardState.currentScenario}
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem timeline
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDashboardState(prev => ({ ...prev, activeView: 'ANALYSIS' }))}
            disabled={!dashboardState.currentScenario}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Phân tích
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Generate AI suggestions
              console.log('Generating AI suggestions');
            }}
            disabled={!dashboardState.currentScenario}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Gợi ý AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ===== MAIN RENDER =====

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      {renderDashboardHeader()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Validation Alerts */}
      {dashboardState.validationResult?.errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Có {dashboardState.validationResult.errors.length} lỗi trong timeline. 
            Vui lòng kiểm tra và sửa các sự kiện để tiếp tục.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={dashboardState.activeView}
        onValueChange={(view) => setDashboardState(prev => ({ 
          ...prev, 
          activeView: view as 'SETUP' | 'TIMELINE' | 'ANALYSIS' 
        }))}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="SETUP" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cài đặt
          </TabsTrigger>
          <TabsTrigger 
            value="TIMELINE" 
            disabled={!dashboardState.currentScenario}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger 
            value="ANALYSIS" 
            disabled={!dashboardState.currentScenario}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Phân tích
          </TabsTrigger>
        </TabsList>

        {/* SETUP TAB */}
        <TabsContent value="SETUP" className="space-y-6">
          <ProgressiveDisclosureUI
            inputs={dashboardState.inputs}
            onInputsChange={handleInputsChange}
            onTimelineCreate={handleTimelineCreate}
            initialMode={dashboardState.timelineMode}
            showWizard={true}
          />
        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value="TIMELINE" className="space-y-6">
          {dashboardState.currentScenario ? (
            <TimelineVisualization
              scenario={dashboardState.currentScenario}
              events={dashboardState.events}
              onEventAdd={handleEventAdd}
              onEventEdit={(event) => {
                // Handle event editing
                console.log('Editing event:', event);
              }}
              onEventDelete={handleEventDelete}
              onEventMove={handleEventMove}
              isEditable={true}
              showCashFlow={true}
              showValidationIssues={true}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Timeline chưa được tạo</h3>
                <p className="text-muted-foreground mb-4">
                  Vui lòng hoàn tất cài đặt và tạo timeline trước
                </p>
                <Button onClick={() => setDashboardState(prev => ({ ...prev, activeView: 'SETUP' }))}>
                  <Settings className="h-4 w-4 mr-2" />
                  Quay lại cài đặt
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ANALYSIS TAB */}
        <TabsContent value="ANALYSIS" className="space-y-6">
          {dashboardState.currentScenario ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Chỉ số chính
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Tổng lãi phải trả</div>
                      <div className="text-xl font-bold text-red-600">
                        {formatVND(dashboardState.currentScenario.totalInterestPaid)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Trả hết nợ</div>
                      <div className="text-xl font-bold">
                        Tháng {dashboardState.currentScenario.payoffMonth}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">ROI hàng năm</div>
                      <div className="text-xl font-bold text-green-600">
                        {dashboardState.currentScenario.roiHangNam.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">NPV</div>
                      <div className="text-xl font-bold">
                        {formatVND(dashboardState.currentScenario.netPresentValue)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cash Flow Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Phân tích dòng tiền
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {timelineStats && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Dòng tiền trung bình/tháng:</span>
                        <span className={`font-semibold ${timelineStats.averageCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatVND(timelineStats.averageCashFlow)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tháng dòng tiền âm:</span>
                        <span className={`font-semibold ${timelineStats.negativeCashFlowMonths > 12 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {timelineStats.negativeCashFlowMonths}/{timelineStats.totalMonths}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Độ phức tạp:</span>
                        <Badge variant={timelineStats.complexity === 'BASIC' ? 'default' : 'secondary'}>
                          {timelineStats.complexity}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có dữ liệu phân tích</h3>
                <p className="text-muted-foreground">
                  Tạo timeline trước để xem phân tích chi tiết
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Event Management Sheet */}
      <EventManagement
        events={dashboardState.events}
        inputs={dashboardState.inputs}
        onEventCreate={handleEventCreate}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        onEventDuplicate={(event) => {
          const duplicated = { ...event };
          delete (duplicated as any).id;
          duplicated.name = `${duplicated.name} (Copy)`;
          duplicated.month = Math.min(240, duplicated.month + 1);
          handleEventCreate(duplicated);
        }}
        isOpen={eventManagementOpen}
        onOpenChange={setEventManagementOpen}
        mode={dashboardState.timelineMode}
        suggestedMonth={selectedMonth || undefined}
      />
    </div>
  );
};

export default TimelineDashboard;