"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Zap,
  Shield,
  Target,
  BookOpen,
  Wand2,
  X,
  Save,
} from "lucide-react";

import { RealEstateInputs } from "@/types/real-estate";
import { TimelineEvent, TimelineEventType } from "@/types/timeline";
import {
  EVENT_TYPE_CONFIG,
  EVENT_TEMPLATES,
  getMonthDisplayName,
} from "@/lib/timeline-constants";
import { TimelineValidator } from "@/lib/timeline-validation";

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
  mode?: "BASIC" | "ADVANCED";
  suggestedMonth?: number;
}

interface EventFormData {
  type: TimelineEventType;
  name: string;
  description: string;
  month: number;
  amount?: number;
  interestRate?: number;
  newRate?: number;
  reason?: string;
  purpose?: string;
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
  mode = "BASIC",
  suggestedMonth,
}) => {
  const [activeTab, setActiveTab] = useState<"create" | "manage" | "templates">(
    "create"
  );
  const [selectedEventType, setSelectedEventType] =
    useState<TimelineEventType | null>(null);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    type: TimelineEventType.EARLY_PAYMENT,
    name: "",
    description: "",
    month: suggestedMonth || 1,
    amount: 0,
  });

  // Filter event types based on mode
  const availableEventTypes = useMemo(() => {
    const basicTypes = [
      TimelineEventType.CASH_PAYMENT,
      TimelineEventType.LOAN_DISBURSEMENT,
      TimelineEventType.EARLY_PAYMENT,
      TimelineEventType.INTEREST_RATE_CHANGE,
    ];

    const advancedTypes = [
      TimelineEventType.PRINCIPAL_GRACE_PERIOD,
      TimelineEventType.PHASED_DISBURSEMENT,
      TimelineEventType.CASH_FLOW_UPDATE,
      TimelineEventType.PAYMENT_FEE_SCHEDULE,
    ];

    return mode === "BASIC" ? basicTypes : [...basicTypes, ...advancedTypes];
  }, [mode]);

  // Validate events
  const validation = useMemo(() => {
    const validator = new TimelineValidator();
    return validator.validate(events, inputs);
  }, [events, inputs]);

  // ===== EVENT HANDLERS =====

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (
        !formData.name ||
        !formData.type ||
        formData.month < 1 ||
        formData.month > 240
      ) {
        toast.error("Vui lòng nhập đầy đủ thông tin hợp lệ");
        return;
      }

      const newEvent: TimelineEvent = {
        id:
          editingEvent?.id ||
          `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: formData.type,
        name: formData.name,
        description: formData.description,
        month: formData.month,
        isActive: true,
        createdAt: editingEvent?.createdAt || new Date(),
        // Add type-specific fields
        ...(formData.amount && { amount: formData.amount }),
        ...(formData.interestRate && { interestRate: formData.interestRate }),
        ...(formData.newRate && { newRate: formData.newRate }),
        ...(formData.reason && { reason: formData.reason }),
        ...(formData.purpose && { purpose: formData.purpose }),
      } as TimelineEvent;

      if (editingEvent) {
        onEventUpdate(newEvent);
        toast.success("Sự kiện đã được cập nhật");
      } else {
        onEventCreate(newEvent);
        toast.success("Sự kiện đã được tạo");
      }

      // Reset form
      setFormData({
        type: TimelineEventType.EARLY_PAYMENT,
        name: "",
        description: "",
        month: suggestedMonth || 1,
        amount: 0,
      });
      setEditingEvent(null);
      setSelectedEventType(null);
      setActiveTab("manage");
    },
    [formData, editingEvent, onEventCreate, onEventUpdate, suggestedMonth]
  );

  const handleEventEdit = useCallback((event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData({
      type: event.type,
      name: event.name,
      description: event.description || "",
      month: event.month,
      amount: (event as any).amount || 0,
      interestRate: (event as any).interestRate || 0,
      newRate: (event as any).newRate || 0,
      reason: (event as any).reason || "",
      purpose: (event as any).purpose || "",
    });
    setSelectedEventType(event.type);
    setActiveTab("create");
  }, []);

  const handleEventCancel = useCallback(() => {
    setEditingEvent(null);
    setSelectedEventType(null);
    setFormData({
      type: TimelineEventType.EARLY_PAYMENT,
      name: "",
      description: "",
      month: suggestedMonth || 1,
      amount: 0,
    });
  }, [suggestedMonth]);

  const handleTemplateSelect = useCallback(
    (template: any) => {
      setFormData({
        type: template.type,
        name: template.name,
        description: template.description,
        month: suggestedMonth || 1,
        amount: template.defaultValues.amount || 0,
        interestRate: template.defaultValues.interestRate || 0,
        newRate: template.defaultValues.newRate || 0,
        reason: template.defaultValues.reason || "",
        purpose: template.defaultValues.purpose || "",
      });
      setSelectedEventType(template.type);
      setActiveTab("create");
    },
    [suggestedMonth]
  );

  // ===== RENDER METHODS =====

  const renderEventTypeSelector = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Chọn loại sự kiện</h3>
        <p className="text-sm text-muted-foreground">
          {mode === "BASIC"
            ? "Các sự kiện cơ bản phù hợp cho người mới bắt đầu"
            : "Tất cả các loại sự kiện để tối ưu hóa timeline"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {availableEventTypes.map((eventType) => {
          const config = EVENT_TYPE_CONFIG[eventType];
          return (
            <Card
              key={eventType}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => {
                setSelectedEventType(eventType);
                setFormData((prev) => ({ ...prev, type: eventType }));
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{config.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      config.category === "BASIC" ? "default" : "secondary"
                    }
                  >
                    {config.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderEventForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-white"
          style={{ backgroundColor: EVENT_TYPE_CONFIG[formData.type].color }}
        >
          {EVENT_TYPE_CONFIG[formData.type].icon}
        </div>
        <div>
          <h3 className="font-semibold">
            {EVENT_TYPE_CONFIG[formData.type].name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {editingEvent ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
          </p>
        </div>
      </div>

      {/* Basic Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Tên sự kiện *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Nhập tên sự kiện"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Mô tả chi tiết về sự kiện"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="month">Tháng thực hiện *</Label>
          <Input
            id="month"
            type="number"
            value={formData.month}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                month: parseInt(e.target.value) || 1,
              }))
            }
            min="1"
            max="240"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Tháng 1-240 (20 năm timeline)
          </p>
        </div>

        {/* Type-specific fields */}
        {(formData.type === TimelineEventType.EARLY_PAYMENT ||
          formData.type === TimelineEventType.CASH_PAYMENT) && (
          <div>
            <Label htmlFor="amount">Số tiền (VND) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: parseInt(e.target.value) || 0,
                }))
              }
              min="0"
              step="1000000"
              required
            />
          </div>
        )}

        {formData.type === TimelineEventType.INTEREST_RATE_CHANGE && (
          <div className="space-y-2">
            <div>
              <Label htmlFor="newRate">Lãi suất mới (%/năm) *</Label>
              <Input
                id="newRate"
                type="number"
                value={formData.newRate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newRate: parseFloat(e.target.value) || 0,
                  }))
                }
                min="0"
                max="50"
                step="0.1"
                required
              />
            </div>
            <div>
              <Label htmlFor="reason">Lý do thay đổi</Label>
              <Select
                value={formData.reason}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, reason: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotion_end">Kết thúc ưu đãi</SelectItem>
                  <SelectItem value="market_change">
                    Thay đổi thị trường
                  </SelectItem>
                  <SelectItem value="bank_policy">
                    Chính sách ngân hàng
                  </SelectItem>
                  <SelectItem value="user_request">
                    Yêu cầu khách hàng
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {formData.type === TimelineEventType.CASH_PAYMENT && (
          <div>
            <Label htmlFor="purpose">Mục đích thanh toán</Label>
            <Select
              value={formData.purpose}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, purpose: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn mục đích" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="down_payment">Thanh toán trước</SelectItem>
                <SelectItem value="renovation">Cải tạo</SelectItem>
                <SelectItem value="fees">Phí dịch vụ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {editingEvent ? "Cập nhật" : "Tạo sự kiện"}
        </Button>
        <Button type="button" variant="outline" onClick={handleEventCancel}>
          <X className="h-4 w-4 mr-2" />
          Hủy
        </Button>
      </div>
    </form>
  );

  const renderEventList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Danh sách sự kiện ({events.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Quản lý các sự kiện đã tạo trong timeline
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Chưa có sự kiện nào</h3>
            <p className="text-sm text-muted-foreground">
              Bắt đầu tạo sự kiện để xây dựng timeline
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const config = EVENT_TYPE_CONFIG[event.type];
            const hasError = validation.errors.some((error) =>
              error.affectedEvents.includes(event.id)
            );
            const hasWarning = validation.warnings.some((warning) =>
              warning.affectedMonths.includes(event.month)
            );

            return (
              <Card
                key={event.id}
                className={`${
                  hasError
                    ? "border-red-200"
                    : hasWarning
                    ? "border-yellow-200"
                    : ""
                }`}
              >
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
                            <Badge
                              variant="outline"
                              className="border-yellow-400 text-yellow-600"
                            >
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
                        onClick={() => handleEventEdit(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEventDuplicate(event)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEventDelete(event.id)}
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
      )}
    </div>
  );

  const renderTemplates = () => (
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
        {EVENT_TEMPLATES.filter((template) =>
          mode === "BASIC" ? template.category === "BASIC" : true
        ).map((template) => {
          const config = EVENT_TYPE_CONFIG[template.type];
          return (
            <Card
              key={template.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => handleTemplateSelect(template)}
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
                      <Badge
                        variant={
                          template.category === "BASIC"
                            ? "default"
                            : "secondary"
                        }
                      >
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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[600px] sm:w-[800px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quản Lý Sự Kiện Timeline
            <Badge variant={mode === "BASIC" ? "default" : "secondary"}>
              {mode === "BASIC" ? "Cơ bản" : "Nâng cao"}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            {mode === "BASIC"
              ? "Tạo và quản lý các sự kiện cơ bản cho timeline đầu tư"
              : "Quản lý toàn bộ sự kiện và tối ưu hóa timeline"}
          </SheetDescription>
        </SheetHeader>

        {/* Validation Summary */}
        {validation.errors.length > 0 && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Có {validation.errors.length} lỗi và {validation.warnings.length}{" "}
              cảnh báo cần xử lý
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(tab) => setActiveTab(tab as any)}
          className="mt-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">
              {editingEvent ? "Chỉnh sửa" : "Tạo mới"}
            </TabsTrigger>
            <TabsTrigger value="manage">Quản lý ({events.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* CREATE/EDIT TAB */}
          <TabsContent value="create" className="space-y-4">
            {!selectedEventType ? renderEventTypeSelector() : renderEventForm()}
          </TabsContent>

          {/* MANAGE TAB */}
          <TabsContent value="manage" className="space-y-4">
            {renderEventList()}
          </TabsContent>

          {/* TEMPLATES TAB */}
          <TabsContent value="templates" className="space-y-4">
            {renderTemplates()}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default EventManagement;
