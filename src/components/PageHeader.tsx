
import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Brain, Zap, CheckCircle, Calculator, Sparkles } from 'lucide-react';

interface PageHeaderProps {
  calculationCount: number;
  hasCurrentResult: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ calculationCount, hasCurrentResult }) => {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg mb-6 border border-primary/20">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Công cụ tính toán thông minh</span>
            </div>
            <div className="h-4 w-px bg-primary/20" />
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">AI-Powered</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Tính Toán Đầu Tư Bất Động Sản
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            <span className="font-semibold text-blue-600">Hiểu bạn như chính bạn.</span>{' '} 
            Chỉ cần giá nhà và số tiền bạn có - chúng tôi sẽ tính toán tất cả còn lại.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Tính toán real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Phân tích rủi ro thông minh</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Gợi ý tối ưu hóa</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Tính toán</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{calculationCount}</p>
              <p className="text-sm text-blue-700">Phân tích đã thực hiện</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-900">AI Insights</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {hasCurrentResult ? 'Sẵn sàng' : 'Chờ dữ liệu'}
              </p>
              <p className="text-sm text-purple-700">Trạng thái phân tích</p>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
