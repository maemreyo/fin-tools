// src/components/TestimonialsSection.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  Quote,
  Sparkles,
  TrendingUp,
  Shield,
  Heart
} from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Anh Minh Tuấn",
      role: "Nhà đầu tư cá nhân",
      location: "TP.HCM",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "PropertyWise đã giúp tôi tiết kiệm hàng tuần nghiên cứu. Chỉ cần nhập giá nhà và số tiền có, tôi đã có được phân tích chi tiết về ROI và rủi ro. Quyết định mua căn hộ 3.2 tỷ ở Quận 7 dựa trên báo cáo này và hiện tại đang có lợi nhuận 18%/năm.",
      highlight: "Lợi nhuận 18%/năm",
      category: "success"
    },
    {
      name: "Chị Lan Phương", 
      role: "Chuyên viên tài chính",
      location: "Hà Nội",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "Tôi đã sử dụng nhiều công cụ tính toán khác nhưng PropertyWise thực sự khác biệt. Tính năng so sánh 'Mua Ngay vs. Mua Tương Lai' đã giúp tôi nhận ra rằng nên đợi thêm 6 tháng để có điều kiện tài chính tốt hơn. Kết quả là tôi tiết kiệm được 200 triệu chi phí lãi vay.",
      highlight: "Tiết kiệm 200 triệu",
      category: "smart"
    },
    {
      name: "Anh Đức Hải",
      role: "Kỹ sư IT",
      location: "Đà Nẵng", 
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "Giao diện rất dễ sử dụng, báo cáo chi tiết và chính xác. Đặc biệt thích tính năng phân tích rủi ro - giúp tôi hiểu rõ những gì có thể xảy ra trong các tình huống khác nhau. Đã giới thiệu cho 5 người bạn và ai cũng hài lòng.",
      highlight: "Giới thiệu cho 5 bạn",
      category: "trust"
    },
    {
      name: "Chị Thu Hà",
      role: "Giám đốc kinh doanh",
      location: "TP.HCM",
      avatar: "/api/placeholder/64/64", 
      rating: 5,
      content: "Trước đây tôi luôn lo lắng khi đầu tư bất động sản vì không biết tính toán. PropertyWise như một cố vấn tài chính cá nhân, giải thích rõ ràng từng chỉ số và đưa ra gợi ý phù hợp với hoàn cảnh của tôi. Giờ tôi tự tin hơn rất nhiều.",
      highlight: "Tự tin hơn rất nhiều",
      category: "confidence"
    },
    {
      name: "Anh Quang Vinh",
      role: "Doanh nhân",
      location: "Cần Thơ",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "Công cụ này đã thay đổi cách tôi nhìn nhận đầu tư bất động sản. Thay vì dựa vào cảm tính, giờ tôi có dữ liệu cụ thể để quyết định. Portfolio bất động sản của tôi đã tăng trưởng 25% trong năm qua nhờ những quyết định đúng đắn.",
      highlight: "Tăng trưởng 25%",
      category: "growth"
    },
    {
      name: "Chị Mai Linh",
      role: "Nhân viên văn phòng",
      location: "Hà Nội",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "Tôi là người mới bắt đầu đầu tư bất động sản và PropertyWise đã hướng dẫn tôi từng bước một cách rất dễ hiểu. Đặc biệt thích phần FAQ và giải thích thuật ngữ. Cảm ơn team đã tạo ra công cụ tuyệt vời này!",
      highlight: "Dễ hiểu cho người mới",
      category: "beginner"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Người dùng tin tưởng" },
    { value: "4.9/5", label: "Đánh giá trung bình" },
    { value: "95%", label: "Khách hàng hài lòng" },
    { value: "50,000+", label: "Phân tích đã thực hiện" }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success': return <TrendingUp className="h-4 w-4" />;
      case 'smart': return <Shield className="h-4 w-4" />;
      case 'trust': return <Heart className="h-4 w-4" />;
      case 'confidence': return <Star className="h-4 w-4" />;
      case 'growth': return <TrendingUp className="h-4 w-4" />;
      case 'beginner': return <Heart className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success': return 'from-green-500 to-emerald-500';
      case 'smart': return 'from-blue-500 to-indigo-500';
      case 'trust': return 'from-purple-500 to-pink-500';
      case 'confidence': return 'from-orange-500 to-red-500';
      case 'growth': return 'from-green-500 to-teal-500';
      case 'beginner': return 'from-pink-500 to-rose-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <section className="h-full bg-white flex flex-col justify-center">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none px-4 py-2 text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Khách hàng nói gì
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent leading-tight mb-4">
            Câu chuyện thành công
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hàng nghìn nhà đầu tư tin tưởng PropertyWise
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="h-8 w-8 text-green-500 opacity-50" />
                  <Badge className={`bg-gradient-to-r ${getCategoryColor(testimonial.category)} text-white border-none px-2 py-1 text-xs`}>
                    {getCategoryIcon(testimonial.category)}
                    <span className="ml-1">{testimonial.highlight}</span>
                  </Badge>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  &quot;{testimonial.content}&quot;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {testimonial.role} • {testimonial.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Bạn cũng muốn có câu chuyện thành công như vậy?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Hãy bắt đầu hành trình đầu tư thông minh của bạn ngay hôm nay. 
              Miễn phí và chỉ mất 2 phút.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
                ✓ Miễn phí hoàn toàn
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-4 py-2">
                ✓ Không cần đăng ký
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 border-purple-300 px-4 py-2">
                ✓ Kết quả ngay lập tức
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}