// src/components/PricingSection.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Star,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  Calculator,
  BarChart3,
  Shield,
  Headphones,
  FileText,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PricingSection() {
  const plans = [
    {
      name: "Miễn Phí",
      price: "0",
      period: "Mãi mãi",
      description: "Hoàn hảo để bắt đầu và khám phá PropertyWise",
      icon: <Calculator className="h-6 w-6" />,
      color: "from-gray-500 to-gray-600",
      borderColor: "border-gray-200",
      bgColor: "bg-gray-50",
      popular: false,
      features: [
        "1 phân tích mỗi tháng",
        "Tính toán ROI cơ bản",
        "Báo cáo PDF đơn giản",
      ],
      limitations: [
        "Không có so sánh kịch bản",
        "Không có phân tích rủi ro chi tiết",
        "Không có gợi ý cá nhân hóa",
        "Không có hỗ trợ trực tiếp",
        "Không lưu trữ lịch sử",
      ],
    },
    {
      name: "Cơ Bản",
      price: "99,000",
      period: "tháng",
      description: "Dành cho nhà đầu tư cá nhân muốn phân tích sâu hơn",
      icon: <Zap className="h-6 w-6" />,
      color: "from-orange-500 to-yellow-500",
      borderColor: "border-orange-200",
      bgColor: "bg-orange-50",
      popular: false,
      features: [
        "10 phân tích mỗi tháng",
        "Tất cả tính năng ROI & dòng tiền cơ bản",
        "So sánh kịch bản đơn giản",
        "Báo cáo PDF nâng cao",
        "Hỗ trợ email ưu tiên",
        "Lưu trữ 3 tháng lịch sử phân tích",
      ],
      limitations: [
        "Không có phân tích rủi ro chi tiết",
        "Không có gợi ý cá nhân hóa",
        "Không có hỗ trợ chat trực tiếp",
      ],
    },
    {
      name: "Chuyên Nghiệp",
      price: "299,000",
      period: "tháng",
      description: "Dành cho nhà đầu tư nghiêm túc muốn phân tích chuyên sâu",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "from-blue-500 to-indigo-500",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50",
      popular: true,
      features: [
        "Phân tích không giới hạn",
        "Tất cả tính năng ROI & dòng tiền",
        "So sánh kịch bản 'Mua Ngay vs. Tương Lai' đầy đủ",
        "Phân tích rủi ro chi tiết",
        "Báo cáo PDF chuyên nghiệp",
        "Gợi ý đầu tư cá nhân hóa",
        "Hỗ trợ chat trực tiếp",
        "Lưu trữ lịch sử phân tích không giới hạn",
      ],
      limitations: [],
    },
    {
      name: "Doanh Nghiệp",
      price: "999,000",
      period: "tháng",
      description: "Giải pháp toàn diện cho công ty và nhóm đầu tư",
      icon: <Crown className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50",
      popular: false,
      features: [
        "Tất cả tính năng Chuyên Nghiệp",
        "Quản lý nhiều dự án & người dùng",
        "Chia sẻ báo cáo với team",
        "API tích hợp",
        "Tùy chỉnh báo cáo theo thương hiệu",
        "Đào tạo và onboarding chuyên sâu",
        "Hỗ trợ ưu tiên 24/7",
        "Account manager riêng",
      ],
      limitations: [],
    },
  ];

  const faqs = [
    {
      question: "Tại sao cần trả phí khi có nhiều công cụ miễn phí?",
      answer:
        "PropertyWise không chỉ là máy tính đơn giản. Chúng tôi cung cấp phân tích chuyên sâu với 15+ chỉ số tài chính, AI gợi ý cá nhân hóa, và so sánh kịch bản phức tạp mà các công cụ miễn phí không có.",
    },
    {
      question: "Tôi có thể hủy đăng ký bất cứ lúc nào không?",
      answer:
        "Có, bạn có thể hủy đăng ký bất cứ lúc nào. Không có ràng buộc dài hạn và bạn vẫn có thể sử dụng gói Miễn Phí sau khi hủy.",
    },
    {
      question: "Có được hoàn tiền không?",
      answer:
        "Chúng tôi cung cấp chính sách hoàn tiền 100% trong vòng 7 ngày đầu nếu bạn không hài lòng với dịch vụ.",
    },
  ];

  return (
    <section className="h-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col justify-center">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none px-4 py-2 text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Chọn gói phù hợp
          </Badge>

          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent leading-tight mb-4">
            Bảng giá minh bạch
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bắt đầu miễn phí, nâng cấp khi cần
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`${
                plan.borderColor
              } border-2 hover:shadow-xl transition-all duration-300 relative ${
                plan.popular
                  ? "ring-2 ring-blue-500 ring-opacity-50 scale-105"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none px-4 py-2">
                    <Star className="h-4 w-4 mr-1" />
                    Phổ biến nhất
                  </Badge>
                </div>
              )}

              <CardContent className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${plan.color} rounded-xl text-white mb-4`}
                  >
                    {plan.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === "0" ? "Miễn phí" : `${plan.price}₫`}
                    </span>
                    {plan.price !== "0" && (
                      <span className="text-gray-500 text-sm">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.map((limitation, limitIndex) => (
                    <div
                      key={limitIndex}
                      className="flex items-start gap-3 opacity-50"
                    >
                      <div className="flex-shrink-0 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">×</span>
                      </div>
                      <span className="text-gray-500 text-sm line-through">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      : "bg-white border-2 border-gray-200 text-gray-900 hover:bg-gray-50"
                  }`}
                  size="lg"
                >
                  {plan.price === "0" ? "Bắt đầu miễn phí" : "Chọn gói này"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison in Dialog */}
        <div className="text-center mt-8 mb-16">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-lg px-8 py-4">
                <FileText className="h-5 w-5 mr-2" />
                So sánh chi tiết các gói
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-gray-900 text-center mb-4">
                  So sánh chi tiết các gói
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600 mb-8">
                  Tìm hiểu sự khác biệt giữa các gói để chọn lựa phù hợp nhất
                  với nhu cầu của bạn.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Tính năng
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900">
                        Miễn Phí
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-orange-600">
                        Cơ Bản
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-blue-600">
                        Chuyên Nghiệp
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-purple-600">
                        Doanh Nghiệp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Số lượng phân tích</td>
                      <td className="text-center py-3 px-4">1/tháng</td>
                      <td className="text-center py-3 px-4">10/tháng</td>
                      <td className="text-center py-3 px-4 text-blue-600">
                        Không giới hạn
                      </td>
                      <td className="text-center py-3 px-4 text-purple-600">
                        Không giới hạn
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">So sánh kịch bản</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4">Giới hạn</td>
                      <td className="text-center py-3 px-4 text-green-600">
                        ✓
                      </td>
                      <td className="text-center py-3 px-4 text-green-600">
                        ✓
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Phân tích rủi ro</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4 text-green-600">
                        ✓
                      </td>
                      <td className="text-center py-3 px-4 text-green-600">
                        ✓
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Gợi ý cá nhân hóa</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4 text-green-600">
                        ✓
                      </td>
                      <td className="text-center py-3 px-4 text-green-600">
                        ✓
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Hỗ trợ</td>
                      <td className="text-center py-3 px-4">Email</td>
                      <td className="text-center py-3 px-4">Email ưu tiên</td>
                      <td className="text-center py-3 px-4">Chat + Email</td>
                      <td className="text-center py-3 px-4">
                        24/7 + Account Manager
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Lưu trữ lịch sử</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4">3 tháng</td>
                      <td className="text-center py-3 px-4 text-green-600">
                        Không giới hạn
                      </td>
                      <td className="text-center py-3 px-4 text-green-600">
                        Không giới hạn
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        Quản lý nhiều dự án/người dùng
                      </td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4 text-green-600">
                        ✓
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">API tích hợp</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4">×</td>
                      <td className="text-center py-3 px-4 text-green-600">
                        ✓
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
