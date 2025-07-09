// src/components/ToastDemo.tsx
"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function ToastDemo() {
  const showSuccessToast = () => {
    toast.success("Tính toán thành công!", {
      description: "ROI: 12.5% - Dòng tiền: 2.5M ₫/tháng",
      action: {
        label: "Xem chi tiết",
        onClick: () => console.log("View details"),
      },
    });
  };

  const showErrorToast = () => {
    toast.error("Lỗi tính toán", {
      description: "Vui lòng kiểm tra lại thông tin đầu vào",
    });
  };

  const showWarningToast = () => {
    toast.warning("Cảnh báo dòng tiền", {
      description: "Dòng tiền âm -1.2M ₫/tháng, rủi ro tài chính cao",
    });
  };

  const showInfoToast = () => {
    toast.info("Thông tin hữu ích", {
      description: "Tỷ lệ vay 70% được khuyến nghị cho đầu tư an toàn",
    });
  };

  const showNormalToast = () => {
    toast("Đã lưu template thành công!", {
      description: "Studio Gia Lâm - Dữ liệu đã được điền vào form",
      action: {
        label: "Tính toán ngay",
        onClick: () => console.log("Calculate now"),
      },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Toast Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={showSuccessToast} variant="default" className="w-full justify-start">
          <CheckCircle className="h-4 w-4 mr-2" />
          Success Toast
        </Button>
        
        <Button onClick={showErrorToast} variant="destructive" className="w-full justify-start">
          <AlertCircle className="h-4 w-4 mr-2" />
          Error Toast
        </Button>
        
        <Button onClick={showWarningToast} variant="outline" className="w-full justify-start">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Warning Toast
        </Button>
        
        <Button onClick={showInfoToast} variant="secondary" className="w-full justify-start">
          <Info className="h-4 w-4 mr-2" />
          Info Toast
        </Button>
        
        <Button onClick={showNormalToast} variant="outline" className="w-full justify-start">
          Normal Toast
        </Button>
      </CardContent>
    </Card>
  );
}