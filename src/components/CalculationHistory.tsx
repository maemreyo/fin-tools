import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, BarChart3 } from "lucide-react";
import { CalculationResult } from "@/types/real-estate";

interface CalculationHistoryProps {
  history: CalculationResult[];
  onResultSelect: (result: CalculationResult) => void;
  onToggleComparison: () => void;
}

export const CalculationHistory: React.FC<CalculationHistoryProps> = ({
  history,
  onResultSelect,
  onToggleComparison,
}) => {
  

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>Lịch Sử Tính Toán</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onToggleComparison}>
            <BarChart3 className="h-4 w-4 mr-2" />
            So sánh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {history?.slice(0, 6).map((result, index) => (
            <Card
              key={result.calculationId || index}
              className="cursor-pointer hover:shadow-sm transition-all border-gray-200"
              onClick={() => onResultSelect(result)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    Tính toán #{index + 1}
                  </div>
                  <Badge
                    variant={
                      (result.steps.dongTienRongBDS || 0) > 0
                        ? "default"
                        : "destructive"
                    }
                    className="text-xs shrink-0"
                  >
                    {(result.steps.dongTienRongBDS || 0) > 0 ? "Lời" : "Lỗ"}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI:</span>
                    <span
                      className={`font-semibold ${
                        (result.roiHangNam || 0) > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(result.roiHangNam || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dòng tiền:</span>
                    <span
                      className={`font-semibold ${
                        (result.steps.dongTienRongBDS || 0) > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {((result.steps.dongTienRongBDS || 0) / 1000000).toFixed(
                        1
                      )}
                      M ₫
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground pt-1 border-t">
                    {new Date(result.calculatedAt || "").toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
