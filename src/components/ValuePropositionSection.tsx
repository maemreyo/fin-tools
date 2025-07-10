// src/components/ValuePropositionSection.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Brain, 
  Target, 
  Shield, 
  TrendingUp, 
  Users,
  CheckCircle,
  Sparkles
} from "lucide-react";

export default function ValuePropositionSection() {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Hiểu bạn như chính bạn",
      description: "Chúng tôi không chỉ tính toán số liệu, mà hiểu được mục tiêu, hoàn cảnh và ước mơ của bạn để đưa ra lời khuyên phù hợp nhất.",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Thông minh & Cá nhân hóa",
      description: "AI phân tích profile tài chính của bạn và đưa ra gợi ý đầu tư được cá nhân hóa, phù hợp với khả năng và mục tiêu riêng.",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Chính xác & Toàn diện",
      description: "Phân tích 15+ chỉ số tài chính quan trọng với độ chính xác 99%, giúp bạn nhìn thấy toàn bộ bức tranh đầu tư.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ];

  const benefits = [
    "Tiết kiệm hàng giờ nghiên cứu và tính toán",
    "Tránh được những sai lầm đắt giá khi đầu tư",
    "Đưa ra quyết định dựa trên dữ liệu, không phải cảm tính",
    "So sánh nhiều kịch bản để chọn lựa tối ưu",
    "Hiểu rõ rủi ro và cách quản lý chúng"
  ];

  return (
    <section className="h-full bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col justify-center">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none px-4 py-2 text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Tại sao PropertyWise khác biệt?
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight mb-4">
            Hiểu bạn như chính bạn
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cố vấn thông minh cho quyết định bất động sản tối ưu
          </p>
        </div>

        {/* Main Value Props */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {values.map((value, index) => (
            <Card 
              key={index} 
              className={`${value.borderColor} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <CardContent className="p-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${value.color} rounded-xl text-white mb-6`}>
                  {value.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Benefits List */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Lợi ích mà bạn nhận được
            </h3>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">99%</div>
                <div className="text-blue-100">Độ chính xác</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">15+</div>
                <div className="text-green-100">Chỉ số phân tích</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-none">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">&lt;30s</div>
                <div className="text-purple-100">Thời gian tính</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-none">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-orange-100">Sẵn sàng hỗ trợ</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}