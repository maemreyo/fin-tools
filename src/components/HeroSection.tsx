"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import AnimatedSection, { StaggerContainer } from "@/components/AnimatedSection";
import {
  Calculator,
  Home,
  TrendingUp,
  Shield,
  Target,
  Sparkles,
  ArrowRight,
  BarChart3,
  PieChart,
  Zap,
  Award,
  CheckCircle,
  Star,
  Heart,
  Brain,
  Eye,
  Lightbulb,
} from "lucide-react";

interface HeroSectionProps {
  calculationCount?: number;
  hasCurrentResult?: boolean;
  onScrollToForm?: () => void;
}

export default function HeroSection({
  calculationCount = 0,
  hasCurrentResult = false,
  onScrollToForm,
}: HeroSectionProps) {
  const features = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "Hiểu bạn",
      description: "Chỉ cần giá nhà và số tiền có",
    },
    {
      icon: <Calculator className="h-5 w-5" />,
      title: "Tính toán",
      description: "Phân tích toàn diện tự động",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "So sánh",
      description: "Đánh giá ưu nhược điểm",
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Quyết định",
      description: "Lựa chọn tối ưu nhất",
    },
  ];

  const stats = [
    {
      value: calculationCount.toLocaleString(),
      label: "Tính toán đã thực hiện",
    },
    { value: "15+", label: "Chỉ số phân tích" },
    { value: "99%", label: "Độ chính xác" },
    { value: "< 30s", label: "Thời gian tính toán" },
  ];

  return (
    <div className="relative overflow-hidden h-full flex flex-col justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M30%2030c0-6.627-5.373-12-12-12s-12%205.373-12%2012%205.373%2012%2012%2012%2012-5.373%2012-12zm12%200c0-6.627-5.373-12-12-12s-12%205.373-12%2012%205.373%2012%2012%2012%2012-5.373%2012-12z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="relative container py-8">
        <div className="text-center mb-8">
          {/* Status Badge */}
          <AnimatedSection animation="fadeIn" delay={0.2}>
            <div className="flex justify-center mb-4">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                PropertyWise - Cố vấn bất động sản thông minh
              </Badge>
            </div>
          </AnimatedSection>

          {/* Main Headline */}
          <AnimatedSection animation="fadeUp" delay={0.4}>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight mb-4">
              Hiểu bạn như chính bạn
            </h1>
          </AnimatedSection>

          {/* Slogan */}
          <div className="max-w-3xl mx-auto mb-6">
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Chỉ cần{" "}
              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                giá nhà
              </span>{" "}
              và{" "}
              <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                số tiền bạn có
              </span>{" "}
              - chúng tôi sẽ tính toán tất cả còn lại.
            </p>
          </div>

          {/* Sub-description */}
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-8">
            Phân tích ROI, dòng tiền, rủi ro và so sánh các kịch bản đầu tư. Đưa
            ra quyết định thông minh với dữ liệu chi tiết và gợi ý cá nhân hóa.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              onClick={onScrollToForm}
            >
              <Calculator className="h-5 w-5 mr-2" />
              Bắt đầu tính toán ngay
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-200 hover:bg-blue-50"
            >
              <Eye className="h-5 w-5 mr-2" />
              Xem ví dụ demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 border-blue-100 hover:border-blue-200 transition-all hover:shadow-lg"
            >
              <CardContent className="p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Tại sao chọn chúng tôi?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Không chỉ là máy tính, mà là cố vấn thông minh giúp bạn đưa ra
                quyết định đầu tư tốt nhất
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Chính xác</h3>
                <p className="text-sm text-gray-600">
                  Công thức tính toán được kiểm chứng bởi chuyên gia tài chính
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full text-blue-600 mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Nhanh chóng
                </h3>
                <p className="text-sm text-gray-600">
                  Phân tích hoàn chỉnh trong vòng 30 giây với giao diện thân
                  thiện
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full text-purple-600 mb-4">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Toàn diện</h3>
                <p className="text-sm text-gray-600">
                  So sánh kịch bản, phân tích rủi ro và gợi ý tối ưu hóa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        {hasCurrentResult && (
          <div className="mt-8 text-center">
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-4 w-4 mr-2" />
              Bạn đã có kết quả tính toán. Tiếp tục so sánh các kịch bản khác
              nhau!
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
