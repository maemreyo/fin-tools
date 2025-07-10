// UPDATED: 2025-01-16 - Enhanced features section for PropertyWise real estate focus
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  BarChart3, 
  Target, 
  Shield, 
  TrendingUp, 
  PieChart,
  Zap,
  Brain,
  Eye,
  Sparkles
} from 'lucide-react';

export default function FeaturesSection() {
  const mainFeatures = [
    {
      icon: <Calculator className="h-8 w-8" />,
      title: 'Phân Tích ROI Thông Minh',
      description: 'Tính toán chính xác ROI, IRR, NPV và 15+ chỉ số tài chính quan trọng khác với công thức được kiểm chứng bởi chuyên gia.',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'So Sánh Kịch Bản Đầu Tư',
      description: 'Đối chiếu "Mua Ngay vs. Mua Tương Lai" với các điều kiện kinh tế khác nhau để tìm thời điểm đầu tư tối ưu.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Đánh Giá Rủi Ro Toàn Diện',
      description: 'Phân tích rủi ro thị trường, thanh khoản, lãi suất và đưa ra chiến lược quản lý rủi ro phù hợp.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const additionalFeatures = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Dự Báo Dòng Tiền',
      description: 'Mô phỏng dòng tiền 10-30 năm với các kịch bản tăng trưởng khác nhau'
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: 'Phân Tích Chi Phí',
      description: 'Tính toán chi tiết tất cả chi phí ẩn: thuế, phí, bảo trì, cơ hội'
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI Gợi Ý Cá Nhân',
      description: 'Đưa ra khuyến nghị đầu tư dựa trên profile và mục tiêu của bạn'
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: 'Báo Cáo Trực Quan',
      description: 'Biểu đồ và dashboard dễ hiểu, xuất PDF chuyên nghiệp'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Tính Toán Nhanh',
      description: 'Kết quả trong vòng 30 giây, cập nhật real-time khi thay đổi'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Tối Ưu Hóa Đầu Tư',
      description: 'Gợi ý cách tối ưu hóa cấu trúc tài chính và thời điểm đầu tư'
    }
  ];

  return (
    <section className="h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col justify-center">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none px-4 py-2 text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Tính năng chuyên dụng
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent leading-tight mb-4">
            Công cụ phân tích toàn diện
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bộ công cụ chuyên nghiệp cho quyết định đầu tư thông minh
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className={`${feature.borderColor} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
            >
              <CardContent className="p-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl text-white mb-6`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Và còn nhiều tính năng khác
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-600">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              15+
            </div>
            <div className="text-sm text-gray-600">Chỉ số phân tích</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              99%
            </div>
            <div className="text-sm text-gray-600">Độ chính xác</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              30s
            </div>
            <div className="text-sm text-gray-600">Thời gian tính</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-sm text-gray-600">Hỗ trợ</div>
          </div>
        </div>
      </div>
    </section>
  );
}
