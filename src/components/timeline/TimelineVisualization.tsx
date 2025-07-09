/**
 * TIMELINE VISUALIZATION COMPONENT
 * Visual representation of 240-month timeline với drag-drop events
 */

"use client";

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  ZoomIn,
  ZoomOut,
  Calendar,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

import { 
  TimelineEvent, 
  TimelineEventType, 
  MonthlyBreakdown,
  TimelineScenario 
} from '@/types/timeline';
import { EVENT_TYPE_CONFIG, TIMELINE_CONFIG, getMonthDisplayName, monthToYearMonth } from '@/lib/timeline-constants';
import { formatVND } from '@/lib/financial-utils';

// ===== COMPONENT PROPS =====

interface TimelineVisualizationProps {
  scenario: TimelineScenario;
  events: TimelineEvent[];
  onEventAdd?: (month: number) => void;
  onEventEdit?: (event: TimelineEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventMove?: (eventId: string, newMonth: number) => void;
  isEditable?: boolean;
  showCashFlow?: boolean;
  showValidationIssues?: boolean;
}

// ===== ZOOM & VIEW TYPES =====

type ZoomLevel = 'YEAR' | 'QUARTER' | 'MONTH';
type ViewMode = 'EVENTS_ONLY' | 'CASH_FLOW' | 'COMBINED';

interface ViewSettings {
  zoomLevel: ZoomLevel;
  viewMode: ViewMode;
  startMonth: number;
  endMonth: number;
  showEventTypes: TimelineEventType[];
  showOnlyProblems: boolean;
}

// ===== TIMELINE VISUALIZATION COMPONENT =====

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  scenario,
  events,
  onEventAdd,
  onEventEdit,
  onEventDelete,
  onEventMove,
  isEditable = false,
  showCashFlow = true,
  showValidationIssues = true
}) => {
  // ===== STATE =====
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    zoomLevel: 'QUARTER',
    viewMode: 'COMBINED',
    startMonth: 1,
    endMonth: 60, // First 5 years by default
    showEventTypes: Object.values(TimelineEventType),
    showOnlyProblems: false
  });
  
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [dragOverMonth, setDragOverMonth] = useState<number | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);

  // ===== COMPUTED VALUES =====

  const visibleMonths = useMemo(() => {
    const months = [];
    for (let month = viewSettings.startMonth; month <= Math.min(viewSettings.endMonth, TIMELINE_CONFIG.TOTAL_MONTHS); month++) {
      months.push(month);
    }
    return months;
  }, [viewSettings.startMonth, viewSettings.endMonth]);

  const monthWidth = useMemo(() => {
    switch (viewSettings.zoomLevel) {
      case 'YEAR': return 60; // 60px per month for year view
      case 'QUARTER': return 120; // 120px per month for quarter view  
      case 'MONTH': return 200; // 200px per month for detailed view
    }
  }, [viewSettings.zoomLevel]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Filter by visible months
      if (event.month < viewSettings.startMonth || event.month > viewSettings.endMonth) {
        return false;
      }
      
      // Filter by event types
      if (!viewSettings.showEventTypes.includes(event.type)) {
        return false;
      }
      
      // Filter by problems only
      if (viewSettings.showOnlyProblems) {
        const hasError = scenario.errors.some(error => 
          error.affectedEvents.includes(event.id)
        );
        const hasWarning = scenario.warnings.some(warning => 
          warning.affectedMonths.includes(event.month)
        );
        return hasError || hasWarning;
      }
      
      return true;
    });
  }, [events, viewSettings, scenario.errors, scenario.warnings]);

  const eventsByMonth = useMemo(() => {
    const groups: { [month: number]: TimelineEvent[] } = {};
    filteredEvents.forEach(event => {
      if (!groups[event.month]) groups[event.month] = [];
      groups[event.month].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const cashFlowData = useMemo(() => {
    if (!showCashFlow) return null;
    
    return scenario.monthlyBreakdowns
      .filter(breakdown => 
        breakdown.month >= viewSettings.startMonth && 
        breakdown.month <= viewSettings.endMonth
      );
  }, [scenario.monthlyBreakdowns, viewSettings.startMonth, viewSettings.endMonth, showCashFlow]);

  // ===== EVENT HANDLERS =====

  const handleZoomIn = useCallback(() => {
    setViewSettings(prev => {
      const currentRange = prev.endMonth - prev.startMonth;
      const newRange = Math.max(12, Math.floor(currentRange * 0.7)); // Zoom in by 30%
      const centerMonth = Math.floor((prev.startMonth + prev.endMonth) / 2);
      const newStart = Math.max(1, centerMonth - Math.floor(newRange / 2));
      const newEnd = Math.min(TIMELINE_CONFIG.TOTAL_MONTHS, newStart + newRange);
      
      return {
        ...prev,
        startMonth: newStart,
        endMonth: newEnd,
        zoomLevel: newRange <= 24 ? 'MONTH' : newRange <= 60 ? 'QUARTER' : 'YEAR'
      };
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewSettings(prev => {
      const currentRange = prev.endMonth - prev.startMonth;
      const newRange = Math.min(TIMELINE_CONFIG.TOTAL_MONTHS, Math.floor(currentRange * 1.4)); // Zoom out by 40%
      const centerMonth = Math.floor((prev.startMonth + prev.endMonth) / 2);
      const newStart = Math.max(1, centerMonth - Math.floor(newRange / 2));
      const newEnd = Math.min(TIMELINE_CONFIG.TOTAL_MONTHS, newStart + newRange);
      
      return {
        ...prev,
        startMonth: newStart,
        endMonth: newEnd,
        zoomLevel: newRange <= 24 ? 'MONTH' : newRange <= 60 ? 'QUARTER' : 'YEAR'
      };
    });
  }, []);

  const handleMonthClick = useCallback((month: number) => {
    if (isEditable && onEventAdd) {
      onEventAdd(month);
    }
  }, [isEditable, onEventAdd]);

  const handleEventDragStart = useCallback((eventId: string, e: React.DragEvent) => {
    setDraggedEvent(eventId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleEventDragOver = useCallback((month: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverMonth(month);
  }, []);

  const handleEventDrop = useCallback((month: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedEvent && onEventMove && month !== dragOverMonth) {
      onEventMove(draggedEvent, month);
    }
    setDraggedEvent(null);
    setDragOverMonth(null);
  }, [draggedEvent, dragOverMonth, onEventMove]);

  const handleEventClick = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event.id);
    if (onEventEdit) {
      onEventEdit(event);
    }
  }, [onEventEdit]);

  // ===== RENDER HELPERS =====

  const renderMonthHeader = (month: number) => {
    const { year, monthInYear } = monthToYearMonth(month);
    const isYearStart = monthInYear === 1;
    
    return (
      <div
        key={month}
        className={`flex-shrink-0 border-r border-gray-200 ${isYearStart ? 'border-r-2 border-r-blue-300' : ''}`}
        style={{ width: monthWidth }}
      >
        <div className="p-2 text-center">
          <div className="text-xs text-muted-foreground">
            T{monthInYear}
          </div>
          {isYearStart && (
            <div className="text-sm font-semibold text-blue-600">
              Năm {year}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCashFlowChart = () => {
    if (!cashFlowData || viewSettings.viewMode === 'EVENTS_ONLY') return null;

    const maxCashFlow = Math.max(...cashFlowData.map(d => Math.abs(d.finalCashFlow)));
    const chartHeight = 60;

    return (
      <div className="h-16 border-b border-gray-200 bg-gray-50">
        <div className="flex h-full">
          {visibleMonths.map(month => {
            const breakdown = cashFlowData.find(d => d.month === month);
            const cashFlow = breakdown?.finalCashFlow || 0;
            const barHeight = Math.abs(cashFlow) / maxCashFlow * chartHeight * 0.8;
            const isPositive = cashFlow >= 0;
            
            return (
              <div
                key={month}
                className="flex-shrink-0 border-r border-gray-200 flex items-end justify-center p-1"
                style={{ width: monthWidth }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-2 ${isPositive ? 'bg-green-500' : 'bg-red-500'} rounded-t`}
                      style={{ height: Math.max(2, barHeight) }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div>Tháng {month}</div>
                      <div className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {formatVND(cashFlow)}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventLane = (laneIndex: number) => {
    const maxLanes = 3; // Maximum event lanes
    
    return (
      <div key={laneIndex} className="h-12 border-b border-gray-100">
        <div className="flex h-full">
          {visibleMonths.map(month => {
            const monthEvents = eventsByMonth[month] || [];
            const laneEvent = monthEvents[laneIndex];
            const isDragOver = dragOverMonth === month && draggedEvent;
            
            return (
              <div
                key={month}
                className={`flex-shrink-0 border-r border-gray-200 flex items-center justify-center p-1 relative
                  ${isDragOver ? 'bg-blue-100' : ''}
                  ${isEditable ? 'cursor-pointer hover:bg-gray-50' : ''}
                `}
                style={{ width: monthWidth }}
                onClick={() => handleMonthClick(month)}
                onDragOver={(e) => handleEventDragOver(month, e)}
                onDrop={(e) => handleEventDrop(month, e)}
              >
                {laneEvent && (
                  <EventMarker
                    event={laneEvent}
                    isSelected={selectedEvent === laneEvent.id}
                    isDragging={draggedEvent === laneEvent.id}
                    onDragStart={handleEventDragStart}
                    onClick={handleEventClick}
                    onDelete={onEventDelete}
                    isEditable={isEditable}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderValidationIssues = () => {
    if (!showValidationIssues || (!scenario.errors.length && !scenario.warnings.length)) {
      return null;
    }

    return (
      <div className="h-6 border-b border-gray-200 bg-yellow-50">
        <div className="flex h-full">
          {visibleMonths.map(month => {
            const hasError = scenario.errors.some(error => 
              error.affectedMonths.includes(month)
            );
            const hasWarning = scenario.warnings.some(warning => 
              warning.affectedMonths.includes(month)
            );
            
            return (
              <div
                key={month}
                className="flex-shrink-0 border-r border-gray-200 flex items-center justify-center"
                style={{ width: monthWidth }}
              >
                {hasError && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div className="font-semibold text-red-600">Lỗi tháng {month}</div>
                        {scenario.errors
                          .filter(e => e.affectedMonths.includes(month))
                          .map(error => (
                            <div key={error.type} className="text-xs">{error.message}</div>
                          ))
                        }
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
                {hasWarning && !hasError && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div className="font-semibold text-yellow-600">Cảnh báo tháng {month}</div>
                        {scenario.warnings
                          .filter(w => w.affectedMonths.includes(month))
                          .map(warning => (
                            <div key={warning.type} className="text-xs">{warning.message}</div>
                          ))
                        }
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline: {scenario.scenarioName}
              <Badge variant={scenario.complexity === 'BASIC' ? 'default' : 'secondary'}>
                {scenario.complexity}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={viewSettings.endMonth - viewSettings.startMonth >= TIMELINE_CONFIG.TOTAL_MONTHS}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={viewSettings.endMonth - viewSettings.startMonth <= 12}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              {/* View Mode Toggle */}
              <Button
                variant={viewSettings.viewMode === 'COMBINED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewSettings(prev => ({ 
                  ...prev, 
                  viewMode: prev.viewMode === 'COMBINED' ? 'EVENTS_ONLY' : 'COMBINED' 
                }))}
              >
                {viewSettings.viewMode === 'COMBINED' ? <DollarSign className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
              </Button>
              
              {/* Add Event */}
              {isEditable && onEventAdd && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEventAdd(viewSettings.startMonth)}
                >
                  <Plus className="h-4 w-4" />
                  Thêm sự kiện
                </Button>
              )}
            </div>
          </div>
          
          {/* Timeline Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>Hiển thị: Tháng {viewSettings.startMonth} - {viewSettings.endMonth}</div>
            <div>Zoom: {viewSettings.zoomLevel}</div>
            <div>Sự kiện: {filteredEvents.length}/{events.length}</div>
            {scenario.errors.length > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                {scenario.errors.length} lỗi
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="relative">
            {/* Month Headers */}
            <div className="flex border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
              {visibleMonths.map(renderMonthHeader)}
            </div>
            
            {/* Cash Flow Chart */}
            {renderCashFlowChart()}
            
            {/* Validation Issues */}
            {renderValidationIssues()}
            
            {/* Event Lanes */}
            <div ref={timelineRef}>
              {[0, 1, 2].map(renderEventLane)}
            </div>
            
            {/* Timeline Footer */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div>Tổng lãi: {formatVND(scenario.totalInterestPaid)}</div>
                  <div>Trả hết nợ: Tháng {scenario.payoffMonth}</div>
                </div>
                <div className="flex items-center gap-2">
                  {scenario.hasErrors ? (
                    <Badge variant="destructive">Có lỗi</Badge>
                  ) : (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Hợp lệ
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

// ===== EVENT MARKER COMPONENT =====

interface EventMarkerProps {
  event: TimelineEvent;
  isSelected: boolean;
  isDragging: boolean;
  onDragStart: (eventId: string, e: React.DragEvent) => void;
  onClick: (event: TimelineEvent) => void;
  onDelete?: (eventId: string) => void;
  isEditable: boolean;
}

const EventMarker: React.FC<EventMarkerProps> = ({
  event,
  isSelected,
  isDragging,
  onDragStart,
  onClick,
  onDelete,
  isEditable
}) => {
  const config = EVENT_TYPE_CONFIG[event.type];
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`
            relative group rounded px-2 py-1 text-xs font-medium border cursor-pointer
            transition-all duration-200 min-w-0 max-w-full
            ${isSelected ? 'ring-2 ring-blue-500 z-20' : ''}
            ${isDragging ? 'opacity-50 z-30' : 'z-10'}
            hover:scale-105 hover:shadow-md
          `}
          style={{ 
            backgroundColor: config.color + '20',
            borderColor: config.color,
            color: config.color
          }}
          draggable={isEditable}
          onDragStart={(e) => onDragStart(event.id, e)}
          onClick={(e) => {
            e.stopPropagation();
            onClick(event);
          }}
        >
          <div className="flex items-center gap-1">
            <span>{config.icon}</span>
            <span className="truncate">{event.name}</span>
          </div>
          
          {/* Edit/Delete buttons */}
          {isEditable && isSelected && (
            <div className="absolute -top-8 left-0 flex gap-1 bg-white border rounded shadow-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(event);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm max-w-xs">
          <div className="font-semibold flex items-center gap-2">
            <span>{config.icon}</span>
            {event.name}
          </div>
          <div className="text-muted-foreground">
            Tháng {event.month} - {getMonthDisplayName(event.month)}
          </div>
          {event.description && (
            <div className="mt-1">{event.description}</div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {config.tooltip}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default TimelineVisualization;