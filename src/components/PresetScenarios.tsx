
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { PresetScenario } from '@/types/real-estate';

interface PresetScenariosProps {
  scenarios: PresetScenario[];
  selectedPreset: PresetScenario | null;
  onPresetSelect: (preset: PresetScenario) => void;
  onHide: () => void;
}

export const PresetScenarios: React.FC<PresetScenariosProps> = ({
  scenarios,
  selectedPreset,
  onPresetSelect,
  onHide,
}) => {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-900">Mẫu Có Sẵn</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onHide}>
            Ẩn
          </Button>
        </div>
        <CardDescription className="text-amber-700">
          Chọn mẫu để bắt đầu nhanh với thông số thực tế
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((preset) => (
            <Card
              key={preset.id}
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 bg-white group ${
                selectedPreset?.id === preset.id
                  ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                  : 'border-amber-200 hover:border-amber-400'
              }`}
              onClick={() => onPresetSelect(preset)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">
                        {preset.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                    {selectedPreset?.id === preset.id && (
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Giá BDS:</span>
                      <span className="font-medium">
                        {((preset.inputs.giaTriBDS ?? 0) / 1000000000).toFixed(1)}B ₫
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tiền thuê:</span>
                      <span className="font-medium text-green-600">
                        {((preset.inputs.tienThueThang ?? 0) / 1000000).toFixed(0)}M ₫/tháng
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Vay:</span>
                      <span className="font-medium">
                        {preset.inputs.tyLeVay ?? 0}% - {preset.inputs.thoiGianVay ?? 0} năm
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {preset.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {preset.location}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-600 group-hover:text-blue-700">
                      <span>Chọn</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
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
