// src/components/CTASection.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight,
  Calculator,
  Sparkles,
  CheckCircle,
  Clock,
  Shield,
  Heart,
  TrendingUp,
  Star,
  Zap
} from "lucide-react";

interface CTASectionProps {
  onGetStarted?: () => void;
}

export default function CTASection({ onGetStarted }: CTASectionProps) {
  const benefits = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Miễn phí hoàn toàn",
      color: "text-green-600"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      text: "Kết quả trong 30 giây",
      color: "text-blue-600"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: "Không cần đăng ký",
      color: "text-purple-600"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      text: "Phân tích chuyên nghiệp",
      color: "text-orange-600"
    }
  ];

  const testimonialHighlights = [
    {
      text: "Tiết kiệm 200 triệu chi phí lãi vay",
      author: "Chị Lan Phương"
    },
    {
      text: "Lợi nhuận 18%/năm từ quyết định đúng",
      author: "Anh Minh Tuấn"
    },
    {
      text: "Tăng trưởng portfolio 25% trong năm",
      author: "Anh Quang Vinh"
    }
  ];

  return (
    <section className="h-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden flex flex-col justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M30%2030c0-6.627-5.373-12-12-12s-12%205.373-12%2012%205.373%2012%2012%2012%2012-5.373%2012-12zm12%200c0-6.627-5.373-12-12-12s-12%205.373-12%2012%205.373%2012%2012%2012%2012-5.373%2012-12z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-pink-400 to-red-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-20 animate-pulse delay-500"></div>

      <div className="relative container py-8">
        <div className="text-center mb-8">
          {/* Badge */}
          <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm mb-4 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Bắt đầu ngay
          </Badge>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Đừng để cơ hội
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              trượt khỏi tay
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-6">
            Hàng nghìn nhà đầu tư đã thành công với PropertyWise
          </p>
        </div>

        {/* Main CTA Card */}
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 mb-12">
          <CardContent className="p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: CTA Content */}
              <div className="text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  Bắt đầu ngay - Chỉ mất 2 phút!
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-white">
                      <div className={benefit.color}>
                        {benefit.icon}
                      </div>
                      <span className="text-sm">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold shadow-2xl transform hover:scale-105 transition-all duration-200"
                    onClick={onGetStarted}
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    Tính toán ngay - Miễn phí
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm bg-amber-700"
                  >
                    <Star className="h-5 w-5 mr-2" />
                    Xem demo
                  </Button>
                </div>
              </div>

              {/* Right: Success Stories */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4 text-center lg:text-left">
                  Câu chuyện thành công gần đây:
                </h4>
                
                {testimonialHighlights.map((highlight, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm mb-1">
                            &quot;{highlight.text}&quot;
                          </p>
                          <p className="text-blue-200 text-xs">
                            - {highlight.author}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              10,000+
            </div>
            <div className="text-blue-200 text-sm">Người dùng tin tưởng</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              50,000+
            </div>
            <div className="text-blue-200 text-sm">Phân tích đã thực hiện</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              4.9/5
            </div>
            <div className="text-blue-200 text-sm">Đánh giá trung bình</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              99%
            </div>
            <div className="text-blue-200 text-sm">Độ chính xác</div>
          </div>
        </div>

        {/* Final Push */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-medium">
              Hơn 500 người đã sử dụng PropertyWise trong 24h qua
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}