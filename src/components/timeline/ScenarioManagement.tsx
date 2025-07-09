/**
 * SCENARIO MANAGEMENT SYSTEM
 * Save, load, compare and organize timeline scenarios
 */

"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Save,
  FolderOpen,
  Copy,
  Trash2,
  Download,
  Upload,
  Share,
  Star,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  Filter,
  Search,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

import { TimelineScenario, TimelineEvent } from '@/types/timeline';
import { TimelineEnabledInputs } from '@/types/timeline-integration';
import { formatVND } from '@/lib/financial-utils';

// ===== INTERFACES =====

interface ScenarioMetadata {
  id: string;
  name: string;
  description?: string;
  category: 'BASIC' | 'INVESTMENT' | 'OPTIMIZATION' | 'CUSTOM';
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  lastModified: Date;
  version: number;
}

interface SavedScenario extends ScenarioMetadata {
  scenario: TimelineScenario;
  inputs: TimelineEnabledInputs;
  events: TimelineEvent[];
  thumbnail?: string; // Base64 encoded preview image
}

interface ScenarioManagementProps {
  currentScenario?: TimelineScenario;
  currentInputs?: TimelineEnabledInputs;
  currentEvents?: TimelineEvent[];
  onScenarioLoad: (scenario: SavedScenario) => void;
  onScenarioDelete?: (scenarioId: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ScenarioSaveProps {
  scenario: TimelineScenario;
  inputs: TimelineEnabledInputs;
  events: TimelineEvent[];
  onSave: (savedScenario: SavedScenario) => void;
  existingScenario?: SavedScenario;
}

// ===== SCENARIO STORAGE UTILITY =====

class ScenarioStorage {
  private static STORAGE_KEY = 'timeline-scenarios';
  private static VERSION = '1.0';

  static save(scenario: SavedScenario): void {
    const scenarios = this.getAll();
    const existingIndex = scenarios.findIndex(s => s.id === scenario.id);
    
    if (existingIndex >= 0) {
      scenarios[existingIndex] = {
        ...scenario,
        lastModified: new Date(),
        version: scenario.version + 1
      };
    } else {
      scenarios.push(scenario);
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        version: this.VERSION,
        scenarios: scenarios
      }));
    } catch (error) {
      console.error('Failed to save scenario:', error);
      throw new Error('Không thể lưu kịch bản. Có thể bộ nhớ đã đầy.');
    }
  }

  static getAll(): SavedScenario[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      if (parsed.version !== this.VERSION) {
        // Handle version migration if needed
        console.warn('Scenario storage version mismatch');
      }

      return (parsed.scenarios || []).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        lastModified: new Date(s.lastModified)
      }));
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      return [];
    }
  }

  static delete(scenarioId: string): void {
    const scenarios = this.getAll().filter(s => s.id !== scenarioId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      version: this.VERSION,
      scenarios: scenarios
    }));
  }

  static export(scenarioIds?: string[]): string {
    const scenarios = this.getAll();
    const exportData = scenarioIds 
      ? scenarios.filter(s => scenarioIds.includes(s.id))
      : scenarios;

    return JSON.stringify({
      version: this.VERSION,
      exportedAt: new Date().toISOString(),
      scenarios: exportData
    }, null, 2);
  }

  static import(jsonData: string): SavedScenario[] {
    try {
      const data = JSON.parse(jsonData);
      if (!data.scenarios || !Array.isArray(data.scenarios)) {
        throw new Error('Invalid export format');
      }

      return data.scenarios.map((s: any) => ({
        ...s,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(s.createdAt),
        lastModified: new Date(),
        version: 1
      }));
    } catch (error) {
      throw new Error('Không thể đọc file. Định dạng không hợp lệ.');
    }
  }
}

// ===== SCENARIO SAVE DIALOG =====

const ScenarioSaveDialog: React.FC<ScenarioSaveProps> = ({
  scenario,
  inputs,
  events,
  onSave,
  existingScenario
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: existingScenario?.name || `Kịch bản ${new Date().toLocaleDateString('vi-VN')}`,
    description: existingScenario?.description || '',
    category: existingScenario?.category || 'CUSTOM' as const,
    tags: existingScenario?.tags.join(', ') || '',
    isFavorite: existingScenario?.isFavorite || false
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên kịch bản');
      return;
    }

    const savedScenario: SavedScenario = {
      id: existingScenario?.id || `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isFavorite: formData.isFavorite,
      createdAt: existingScenario?.createdAt || new Date(),
      lastModified: new Date(),
      version: existingScenario?.version || 1,
      scenario,
      inputs,
      events,
      thumbnail: generateThumbnail(scenario) // Simplified thumbnail generation
    };

    try {
      ScenarioStorage.save(savedScenario);
      onSave(savedScenario);
      setIsOpen(false);
      
      toast.success(existingScenario ? 'Đã cập nhật kịch bản' : 'Đã lưu kịch bản mới', {
        description: formData.name
      });
    } catch (error) {
      toast.error('Lỗi lưu kịch bản', {
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {existingScenario ? 'Cập nhật' : 'Lưu kịch bản'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingScenario ? 'Cập nhật kịch bản' : 'Lưu kịch bản mới'}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin để lưu timeline scenario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Tên kịch bản *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên kịch bản"
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về kịch bản này"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Danh mục</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  category: e.target.value as SavedScenario['category']
                }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="BASIC">Cơ bản</option>
                <option value="INVESTMENT">Đầu tư</option>
                <option value="OPTIMIZATION">Tối ưu hóa</option>
                <option value="CUSTOM">Tùy chỉnh</option>
              </select>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="favorite"
              checked={formData.isFavorite}
              onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
            />
            <Label htmlFor="favorite">Đánh dấu yêu thích</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            {existingScenario ? 'Cập nhật' : 'Lưu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ===== MAIN SCENARIO MANAGEMENT COMPONENT =====

export const ScenarioManagement: React.FC<ScenarioManagementProps> = ({
  currentScenario,
  currentInputs,
  currentEvents,
  onScenarioLoad,
  onScenarioDelete,
  isOpen = false,
  onOpenChange
}) => {
  const [scenarios, setScenarios] = useState<SavedScenario[]>(ScenarioStorage.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedScenarios, setSelectedScenarios] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  // Filter scenarios
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scenario => {
      const matchesSearch = !searchTerm || 
        scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = filterCategory === 'ALL' || 
        filterCategory === 'FAVORITES' ? scenario.isFavorite : scenario.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [scenarios, searchTerm, filterCategory]);

  // Handlers
  const handleRefresh = () => {
    setScenarios(ScenarioStorage.getAll());
  };

  const handleSaveCurrentScenario = (savedScenario: SavedScenario) => {
    setScenarios(prev => {
      const existing = prev.findIndex(s => s.id === savedScenario.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = savedScenario;
        return updated;
      }
      return [...prev, savedScenario];
    });
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    onScenarioLoad(scenario);
    onOpenChange?.(false);
    
    toast.success('Đã tải kịch bản', {
      description: scenario.name
    });
  };

  const handleDeleteScenario = (scenarioId: string) => {
    try {
      ScenarioStorage.delete(scenarioId);
      setScenarios(prev => prev.filter(s => s.id !== scenarioId));
      onScenarioDelete?.(scenarioId);
      
      toast.success('Đã xóa kịch bản');
    } catch (error) {
      toast.error('Lỗi xóa kịch bản');
    }
    setDeleteDialogOpen(null);
  };

  const handleDuplicateScenario = (scenario: SavedScenario) => {
    const duplicated: SavedScenario = {
      ...scenario,
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${scenario.name} (Copy)`,
      createdAt: new Date(),
      lastModified: new Date(),
      version: 1
    };

    try {
      ScenarioStorage.save(duplicated);
      setScenarios(prev => [...prev, duplicated]);
      
      toast.success('Đã nhân bản kịch bản', {
        description: duplicated.name
      });
    } catch (error) {
      toast.error('Lỗi nhân bản kịch bản');
    }
  };

  const handleExportScenarios = (scenarioIds?: string[]) => {
    try {
      const exportData = ScenarioStorage.export(scenarioIds);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timeline-scenarios-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Đã xuất kịch bản', {
        description: `${scenarioIds?.length || scenarios.length} kịch bản`
      });
    } catch (error) {
      toast.error('Lỗi xuất kịch bản');
    }
  };

  const handleImportScenarios = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedScenarios = ScenarioStorage.import(e.target?.result as string);
        
        // Save imported scenarios
        importedScenarios.forEach(scenario => {
          ScenarioStorage.save(scenario);
        });
        
        setScenarios(ScenarioStorage.getAll());
        
        toast.success('Đã nhập kịch bản', {
          description: `${importedScenarios.length} kịch bản được thêm`
        });
      } catch (error) {
        toast.error('Lỗi nhập kịch bản', {
          description: error instanceof Error ? error.message : 'File không hợp lệ'
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const toggleFavorite = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const updated = { ...scenario, isFavorite: !scenario.isFavorite, lastModified: new Date() };
    ScenarioStorage.save(updated);
    setScenarios(prev => prev.map(s => s.id === scenarioId ? updated : s));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Quản lý Kịch bản Timeline
              </DialogTitle>
              <DialogDescription>
                Lưu, tải và so sánh các kịch bản timeline khác nhau
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save current scenario */}
              {currentScenario && (
                <ScenarioSaveDialog
                  scenario={currentScenario}
                  inputs={currentInputs!}
                  events={currentEvents!}
                  onSave={handleSaveCurrentScenario}
                />
              )}
              
              {/* Import/Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExportScenarios()}>
                    <Download className="h-4 w-4 mr-2" />
                    Xuất tất cả
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => document.getElementById('import-file')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Nhập từ file
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRefresh}>
                    <Plus className="h-4 w-4 mr-2" />
                    Làm mới
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportScenarios}
                className="hidden"
              />
            </div>
          </div>
        </DialogHeader>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm kịch bản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="filter">Lọc:</Label>
            <select
              id="filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="ALL">Tất cả</option>
              <option value="FAVORITES">Yêu thích</option>
              <option value="BASIC">Cơ bản</option>
              <option value="INVESTMENT">Đầu tư</option>
              <option value="OPTIMIZATION">Tối ưu hóa</option>
              <option value="CUSTOM">Tùy chỉnh</option>
            </select>
          </div>
        </div>

        {/* Scenarios List */}
        <ScrollArea className="flex-1 max-h-[400px]">
          {filteredScenarios.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Chưa có kịch bản nào</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Không tìm thấy kịch bản phù hợp' : 'Tạo kịch bản đầu tiên bằng cách lưu timeline hiện tại'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredScenarios.map(scenario => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onLoad={() => handleLoadScenario(scenario)}
                  onDelete={() => setDeleteDialogOpen(scenario.id)}
                  onDuplicate={() => handleDuplicateScenario(scenario)}
                  onToggleFavorite={() => toggleFavorite(scenario.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa kịch bản này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDialogOpen && handleDeleteScenario(deleteDialogOpen)}
                className="bg-red-600 hover:bg-red-700"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

// ===== SCENARIO CARD COMPONENT =====

interface ScenarioCardProps {
  scenario: SavedScenario;
  onLoad: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onLoad,
  onDelete,
  onDuplicate,
  onToggleFavorite
}) => {
  const stats = useMemo(() => {
    const monthlyBreakdowns = scenario.scenario.monthlyBreakdowns;
    const avgCashFlow = monthlyBreakdowns.reduce((sum, m) => sum + m.finalCashFlow, 0) / monthlyBreakdowns.length;
    
    return {
      totalInterest: scenario.scenario.totalInterestPaid,
      payoffMonth: scenario.scenario.payoffMonth,
      avgCashFlow,
      eventCount: scenario.events.length,
      roi: scenario.scenario.roiHangNam
    };
  }, [scenario]);

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{scenario.name}</h4>
              <Badge variant={
                scenario.category === 'BASIC' ? 'default' :
                scenario.category === 'INVESTMENT' ? 'secondary' :
                scenario.category === 'OPTIMIZATION' ? 'destructive' : 'outline'
              }>
                {scenario.category}
              </Badge>
              {scenario.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            
            {scenario.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {scenario.description}
              </p>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
              <div>
                <div className="text-muted-foreground">ROI</div>
                <div className="font-semibold text-green-600">
                  {stats.roi.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Dòng tiền TB</div>
                <div className={`font-semibold ${stats.avgCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatVND(stats.avgCashFlow)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Sự kiện</div>
                <div className="font-semibold">
                  {stats.eventCount}
                </div>
              </div>
            </div>

            {/* Tags */}
            {scenario.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {scenario.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {scenario.lastModified.toLocaleDateString('vi-VN')}
              </span>
              <span>v{scenario.version}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="h-8 w-8 p-0"
            >
              <Star className={`h-4 w-4 ${scenario.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onLoad}>
                  <Eye className="h-4 w-4 mr-2" />
                  Tải kịch bản
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Nhân bản
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ===== UTILITY FUNCTIONS =====

function generateThumbnail(scenario: TimelineScenario): string {
  // Simplified thumbnail generation
  // In a real implementation, this could generate a canvas-based chart
  const data = {
    events: scenario.events.length,
    cashFlow: scenario.monthlyBreakdowns[0]?.finalCashFlow || 0,
    roi: scenario.roiHangNam
  };
  
  return btoa(JSON.stringify(data));
}

export default ScenarioManagement;