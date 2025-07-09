/**
 * EVENT MANAGEMENT UI COMPONENTS
 * Forms và interfaces for creating, editing, and managing timeline events
 */

"use client";

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Info,
  Lightbulb,
  Wand2
} from 'lucide-react';

import {
  TimelineEvent,
  TimelineEventType,
  CashPaymentEvent,
  LoanDisbursementEvent,
  EarlyPaymentEvent,
  InterestRateChangeEvent,
  CashFlowUpdateEvent
} from '@/types/timeline';
import { RealEstateInputs } from '@/types/real-estate';
import { 
  EVENT_TYPE_CONFIG, 
  EVENT_TEMPLATES, 
  getEventTemplate,
  getMonthDisplayName,
  monthToYearMonth 
} from '@/lib/timeline-constants';
import { TimelineValidator } from '@/lib/timeline-validation';
import { formatVND, parseVND } from '@/lib/financial-utils';

// ===== VALIDATION SCHEMAS =====

const baseEventSchema = z.object({
  name: z.string().min(1, 'Tên sự kiện không được để trống'),
  description: z.string().optional(),
  month: z.number().min(1, 'Tháng phải từ 1').max(240, 'Tháng không được vượt quá 240'),
  isActive: z.boolean().default(true),
});

const cashPaymentSchema = baseEventSchema.extend({
  type: z.literal(TimelineEventType.CASH_PAYMENT),
  amount: z.number().min(1000000, 'Số tiền tối thiểu 1 triệu VND'),
  purpose: z.enum(['down_payment', 'renovation', 'fees', 'other']),
  affectsCashFlow: z.boolean().default(false),
});

const loanDisbursementSchema = baseEventSchema.extend({
  type: z.literal(TimelineEventType.LOAN_DISBURSEMENT),
  amount: z.number().min(1000000, 'Số tiền vay tối thiểu 1 triệu VND'),
  interestRate: z.number().min(0.1, 'Lãi suất tối thiểu 0.1%').max(50, 'Lãi suất tối đa 50%'),
  gracePeriodMonths: z.number().min(0).max(60).optional(),
});

const earlyPaymentSchema = baseEventSchema.extend({
  type: z.literal(TimelineEventType.EARLY_PAYMENT),
  amount: z.number().min(1000000, 'Số tiền trả trước tối thiểu 1 triệu VND'),
  penaltyRate: z.number().min(0, 'Phí phạt không được âm').max(10, 'Phí phạt tối đa 10%'),
});

const interestRateChangeSchema = baseEventSchema.extend({
  type: z.literal(TimelineEventType.INTEREST_RATE_CHANGE),
  newRate: z.number().min(0.1, 'Lãi suất tối thiểu 0.1%').max(50, 'Lãi suất tối đa 50%'),
  oldRate: z.number().min(0.1).max(50),
  reason: z.enum(['promotion_end', 'market_change', 'bank_policy', 'user_request']),
});

const cashFlowUpdateSchema = baseEventSchema.extend({
  type: z.literal(TimelineEventType.CASH_FLOW_UPDATE),
  incomeChange: z.number().default(0),
  expenseChange: z.number().default(0),
  rentalIncomeChange: z.number().default(0),
  changeType: z.enum(['salary_increase', 'rent_increase', 'expense_increase', 'other']),
  changePercent: z.number().min(-50, 'Giảm tối đa 50%').max(200, 'Tăng tối đa 200%'),
});

// ===== COMPONENT INTERFACES =====

interface EventManagementProps {
  events: TimelineEvent[];
  inputs: RealEstateInputs;
  onEventCreate: (event: TimelineEvent) => void;
  onEventUpdate: (event: TimelineEvent) => void;
  onEventDelete: (eventId: string) => void;
  onEventDuplicate: (event: TimelineEvent) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: 'BASIC' | 'ADVANCED';
  suggestedMonth?: number;
}

interface EventFormProps {
  event?: TimelineEvent;
  inputs: RealEstateInputs;
  suggestedMonth?: number;
  onSubmit: (event: TimelineEvent) => void;
  onCancel: () => void;
  mode?: 'BASIC' | 'ADVANCED';
}

// ===== MAIN EVENT MANAGEMENT COMPONENT =====

export const EventManagement: React.FC<EventManagementProps> = ({
  events,
  inputs,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onEventDuplicate,
  isOpen = false,
  onOpenChange,
  mode = 'BASIC',
  suggestedMonth
}) => {
  const [selectedEventType, setSelectedEventType] = useState<TimelineEventType | null>(null);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'templates'>('create');

  // Filter event types based on mode
  const availableEventTypes = useMemo(() => {
    const basicTypes = [
      TimelineEventType.CASH_PAYMENT,
      TimelineEventType.LOAN_DISBURSEMENT,
      TimelineEventType.START_LOAN_PAYMENTS,
      TimelineEventType.EARLY_PAYMENT,
      TimelineEventType.INTEREST_RATE_CHANGE
    ];

    const advancedTypes = [
      TimelineEventType.PRINCIPAL_GRACE_PERIOD,
      TimelineEventType.PHASED_DISBURSEMENT,
      TimelineEventType.CASH_FLOW_UPDATE,
      TimelineEventType.PAYMENT_FEE_SCHEDULE
    ];

    return mode === 'BASIC' ? basicTypes : [...basicTypes, ...advancedTypes];
  }, [mode]);

  // Validate events
  const validation = useMemo(() => {
    const validator = new TimelineValidator();
    return validator.validate(events, inputs);
  }, [events, inputs]);

  const handleEventSubmit = (event: TimelineEvent) => {
    if (editingEvent) {
      onEventUpdate({ ...event, id: editingEvent.id });
      setEditingEvent(null);
    } else {
      onEventCreate({
        ...event,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      });
    }
    setSelectedEventType(null);
  };

  const handleEventEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setSelectedEventType(event.type);
    setActiveTab('create');
  };

  const handleEventCancel = () => {
    setEditingEvent(null);
    setSelectedEventType(null);
  };

  const handleTemplateSelect = (template: any) => {
    const newEvent: Partial<TimelineEvent> = {
      ...template.defaultValues,
      month: suggestedMonth || 1,
      name: template.name,
      description: template.description
    };
    
    setSelectedEventType(template.type);
    // Pre-fill form with template data
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quản Lý Sự Kiện Timeline
            <Badge variant={mode === 'BASIC' ? 'default' : 'secondary'}>
              {mode === 'BASIC' ? 'Cơ bản' : 'Nâng cao'}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            {mode === 'BASIC' 
              ? 'Tạo và quản lý các sự kiện cơ bản cho timeline đầu tư'
              : 'Quản lý toàn bộ sự kiện và tối ưu hóa timeline'
            }
          </SheetDescription>
        </SheetHeader>

        {/* Validation Summary */}
        {validation.errors.length > 0 && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Có {validation.errors.length} lỗi và {validation.warnings.length} cảnh báo cần xử lý
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as any)} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">
              {editingEvent ? 'Chỉnh sửa' : 'Tạo mới'}
            </TabsTrigger>
            <TabsTrigger value="manage">Quản lý ({events.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* CREATE/EDIT TAB */}
          <TabsContent value="create" className="space-y-4">
            {!selectedEventType ? (
              <EventTypeSelector
                availableTypes={availableEventTypes}
                onSelect={setSelectedEventType}
                mode={mode}
              />
            ) : (
              <EventForm
                event={editingEvent || undefined}
                inputs={inputs}
                suggestedMonth={suggestedMonth}
                onSubmit={handleEventSubmit}
                onCancel={handleEventCancel}
                mode={mode}
              />
            )}
          </TabsContent>

          {/* MANAGE TAB */}
          <TabsContent value="manage" className="space-y-4">
            <EventList
              events={events}
              validation={validation}
              onEdit={handleEventEdit}
              onDelete={onEventDelete}
              onDuplicate={onEventDuplicate}
            />
          </TabsContent>

          {/* TEMPLATES TAB */}
          <TabsContent value="templates" className="space-y-4">
            <EventTemplates
              templates={EVENT_TEMPLATES.filter(t => 
                mode === 'BASIC' ? t.category === 'BASIC' : true
              )}
              onSelect={handleTemplateSelect}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

// ===== EVENT TYPE SELECTOR =====

interface EventTypeSelectorProps {
  availableTypes: TimelineEventType[];
  onSelect: (type: TimelineEventType) => void;
  mode: 'BASIC' | 'ADVANCED';
}

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  availableTypes,
  onSelect,
  mode
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Chọn loại sự kiện</h3>
        <p className="text-sm text-muted-foreground">
          {mode === 'BASIC' 
            ? 'Các sự kiện cơ bản phù hợp cho người mới bắt đầu'
            : 'Toàn bộ sự kiện timeline cho phân tích chuyên sâu'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {availableTypes.map(type => {
          const config = EVENT_TYPE_CONFIG[type];
          return (
            <Card
              key={type}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => onSelect(type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{config.description}</h4>
                      <Badge variant={config.category === 'BASIC' ? 'default' : 'secondary'}>
                        {config.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.tooltip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ===== EVENT FORM =====

const EventForm: React.FC<EventFormProps> = ({
  event,
  inputs,
  suggestedMonth,
  onSubmit,
  onCancel,
  mode
}) => {
  const [eventType] = useState<TimelineEventType>(
    event?.type || TimelineEventType.CASH_PAYMENT
  );

  const form = useForm({
    resolver: zodResolver(getSchemaForEventType(eventType)),
    defaultValues: getDefaultValues(event, eventType, suggestedMonth),
  });

  const config = EVENT_TYPE_CONFIG[eventType];

  const handleSubmit = (data: any) => {
    const eventData: TimelineEvent = {
      ...data,
      type: eventType,
      id: event?.id || '',
      createdAt: event?.createdAt || new Date(),
      isActive: data.isActive ?? true,
    };
    onSubmit(eventData);
  };

  return (
    <div className="space-y-6">
      {/* Event Type Header */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
          style={{ backgroundColor: config.color }}
        >
          {config.icon}
        </div>
        <div>
          <h3 className="font-semibold">{config.description}</h3>
          <p className="text-sm text-muted-foreground">{config.tooltip}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sự kiện *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên sự kiện" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tháng thực hiện *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min={1}
                        max={240}
                        placeholder="1-240"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">
                        {field.value && getMonthDisplayName(field.value)}
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả (tùy chọn)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả chi tiết về sự kiện này"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event-specific Fields */}
          {renderEventSpecificFields(eventType, form, inputs)}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Hủy
            </Button>
            <div className="flex gap-2">
              {event && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    // Duplicate functionality
                    const duplicated = { ...event };
                    delete (duplicated as any).id;
                    duplicated.name = `${duplicated.name} (Copy)`;
                    duplicated.month = Math.min(240, duplicated.month + 1);
                    onSubmit(duplicated);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Nhân bản
                </Button>
              )}
              <Button type="submit">
                {event ? 'Cập nhật' : 'Tạo sự kiện'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

// ===== EVENT LIST =====

interface EventListProps {
  events: TimelineEvent[];
  validation: any;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: string) => void;
  onDuplicate: (event: TimelineEvent) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  validation,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.month - b.month);
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Chưa có sự kiện nào</h3>
        <p className="text-muted-foreground">
          Bắt đầu bằng cách tạo sự kiện đầu tiên cho timeline
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedEvents.map(event => {
        const config = EVENT_TYPE_CONFIG[event.type];
        const hasError = validation.errors.some((error: any) =>
          error.affectedEvents.includes(event.id)
        );
        const hasWarning = validation.warnings.some((warning: any) =>
          warning.affectedMonths.includes(event.month)
        );

        return (
          <Card key={event.id} className={`${hasError ? 'border-red-200' : hasWarning ? 'border-yellow-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{event.name}</h4>
                      <Badge variant="outline">
                        {getMonthDisplayName(event.month)}
                      </Badge>
                      {hasError && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Lỗi
                        </Badge>
                      )}
                      {hasWarning && !hasError && (
                        <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Cảnh báo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.description || config.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(event)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(event.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ===== EVENT TEMPLATES =====

interface EventTemplatesProps {
  templates: any[];
  onSelect: (template: any) => void;
}

const EventTemplates: React.FC<EventTemplatesProps> = ({ templates, onSelect }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Templates Sự Kiện
        </h3>
        <p className="text-sm text-muted-foreground">
          Sử dụng templates có sẵn để tạo sự kiện nhanh chóng
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {templates.map(template => {
          const config = EVENT_TYPE_CONFIG[template.type];
          return (
            <Card
              key={template.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => onSelect(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      <Badge variant={template.category === 'BASIC' ? 'default' : 'secondary'}>
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ===== HELPER FUNCTIONS =====

function getSchemaForEventType(type: TimelineEventType) {
  switch (type) {
    case TimelineEventType.CASH_PAYMENT:
      return cashPaymentSchema;
    case TimelineEventType.LOAN_DISBURSEMENT:
      return loanDisbursementSchema;
    case TimelineEventType.EARLY_PAYMENT:
      return earlyPaymentSchema;
    case TimelineEventType.INTEREST_RATE_CHANGE:
      return interestRateChangeSchema;
    case TimelineEventType.CASH_FLOW_UPDATE:
      return cashFlowUpdateSchema;
    default:
      return baseEventSchema;
  }
}

function getDefaultValues(
  event: TimelineEvent | undefined,
  type: TimelineEventType,
  suggestedMonth?: number
) {
  if (event) return event;

  const config = EVENT_TYPE_CONFIG[type];
  return {
    name: config.description,
    description: '',
    month: suggestedMonth || 1,
    isActive: true,
    type,
  };
}

function renderEventSpecificFields(
  eventType: TimelineEventType,
  form: any,
  inputs: RealEstateInputs
) {
  switch (eventType) {
    case TimelineEventType.CASH_PAYMENT:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền (VND) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1000000}
                      step={1000000}
                      placeholder="1,000,000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mục đích *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn mục đích" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="down_payment">Thanh toán trước</SelectItem>
                      <SelectItem value="renovation">Sửa chữa, trang trí</SelectItem>
                      <SelectItem value="fees">Phí, thuế</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="affectsCashFlow"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Ảnh hưởng dòng tiền hàng tháng
                  </FormLabel>
                  <FormDescription>
                    Kích hoạt nếu đây là chi phí định kỳ hàng tháng
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      );

    case TimelineEventType.LOAN_DISBURSEMENT:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền giải ngân (VND) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1000000}
                      step={1000000}
                      placeholder="2,000,000,000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Tối đa: {formatVND(inputs.giaTriBDS * (inputs.tyLeVay / 100))}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lãi suất (%/năm) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0.1}
                      max={50}
                      step={0.1}
                      placeholder="8.0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="gracePeriodMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thời gian ân hạn (tháng)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Số tháng chỉ trả lãi, không trả gốc (0 = không ân hạn)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case TimelineEventType.EARLY_PAYMENT:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền trả trước (VND) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1000000}
                      step={1000000}
                      placeholder="500,000,000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="penaltyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phí phạt (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      placeholder="1.0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Phí phạt trả nợ trước hạn (0-10%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default EventManagement;