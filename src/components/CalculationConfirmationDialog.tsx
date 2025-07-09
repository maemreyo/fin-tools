import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Lightbulb, Loader2 } from "lucide-react";
import { RealEstateInputs } from "@/types/real-estate";

interface CalculationConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pendingCalculation: RealEstateInputs | null;
  onConfirm: () => void;
  onCancel: () => void;
  isCalculating: boolean;
}

export const CalculationConfirmationDialog: React.FC<
  CalculationConfirmationDialogProps
> = ({
  isOpen,
  onOpenChange,
  pendingCalculation,
  onConfirm,
  onCancel,
  isCalculating,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Xác nhận tính toán
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn thực hiện phân tích đầu tư bất động sản này
            không?
          </DialogDescription>
        </DialogHeader>

        {pendingCalculation && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">
                Thông tin sẽ được phân tích:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Giá BDS:</span>
                  <span className="ml-2 font-medium">
                    {(pendingCalculation.giaTriBDS / 1000000000).toFixed(1)}B ₫
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tiền thuê:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {(pendingCalculation.tienThueThang / 1000000).toFixed(0)}M
                    ₫/tháng
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vay:</span>
                  <span className="ml-2 font-medium">
                    {pendingCalculation.tyLeVay.toFixed(2) ?? 0}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Thời gian:</span>
                  <span className="ml-2 font-medium">
                    {pendingCalculation.thoiGianVay} năm
                  </span>
                </div>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                <strong>Miễn phí:</strong> Tính toán này hoàn toàn miễn phí và
                không giới hạn số lần sử dụng.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onCancel}>
                Hủy
              </Button>
              <Button onClick={onConfirm} disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tính toán...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Bắt đầu phân tích
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
