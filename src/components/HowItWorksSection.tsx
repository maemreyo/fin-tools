// src/components/HowItWorksSection.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  DollarSign, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  CheckCircle
} from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      icon: <Home className="h-8 w-8" />,
      title: "Nhập thông tin cơ bản",
      description: "Chỉ cần giá nhà và số tiền bạn có. Đơn giản như vậy thôi!",
      details: [
        "Giá trị bất động sản",
        "Số tiền có thể đầu tư",
        "Mục tiêu đầu tư (tùy chọn)"
      ],
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      step: "02", 
      icon: <BarChart3 className="h-8 w-8" />,
      title: "AI phân tích thông minh",
      description: "Hệ thống tự động tính toán 15+ chỉ số tài chính quan trọng trong vòng 30 giây.",
      details: [
        "Phân tích ROI & dòng tiền",
        "Đánh giá rủi ro đầu tư", 
        "So sánh các kịch bản"
      ],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      step: "03",
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Nhận kết quả & quyết định",
      description: "Báo cáo chi tiết với gợi ý cá nhân hóa giúp bạn đưa ra quyết định thông minh.",
      details: [
        "Báo cáo phân tích chi tiết",
        "Gợi ý đầu tư cá nhân hóa",
        "Kế hoạch hành động cụ thể"
      ],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50", 
      borderColor: "border-purple-200"
    }
  ];

  return (
    <section className="h-full bg-white flex flex-col justify-center">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none px-4 py-2 text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Đơn giản như 1-2-3
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent leading-tight mb-4">
            Cách thức hoạt động
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            3 bước đơn giản để có phân tích đầu tư chuyên nghiệp
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8"></div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 mx-8"></div>
              <div className="w-8 h-8"></div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-green-200 to-purple-200 mx-8"></div>
              <div className="w-8 h-8"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className={`${step.borderColor} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}>
                  <CardContent className="p-8 text-center">
                    {/* Step Number */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.color} rounded-full text-white text-xl font-bold mb-6 relative z-10`}>
                      {step.step}
                    </div>
                    
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 ${step.bgColor} rounded-lg text-gray-700 mb-4`}>
                      {step.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {step.description}
                    </p>
                    
                    {/* Details */}
                    <div className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          {detail}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-6">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 via-green-50 to-purple-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Sẵn sàng bắt đầu?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Chỉ mất 2 phút để có được phân tích đầu tư chuyên nghiệp. 
              Hoàn toàn miễn phí và không cần đăng ký.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Thử ngay - Miễn phí
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}