// src/components/AboutSection.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Target, 
  Heart, 
  Users,
  Award,
  Sparkles,
  TrendingUp,
  Shield,
  Lightbulb,
  Globe,
  CheckCircle
} from "lucide-react";

export default function AboutSection() {
  const team = [
    {
      name: "Nguyễn Minh Tuấn",
      role: "Founder & CEO",
      avatar: "/api/placeholder/80/80",
      description: "10+ năm kinh nghiệm đầu tư BĐS, cựu chuyên viên phân tích tài chính tại các ngân hàng lớn.",
      expertise: ["Phân tích tài chính", "Đầu tư BĐS", "Fintech"]
    },
    {
      name: "Trần Thị Lan",
      role: "CTO & Co-founder", 
      avatar: "/api/placeholder/80/80",
      description: "Chuyên gia AI/ML với 8 năm kinh nghiệm, từng làm việc tại các công ty công nghệ hàng đầu.",
      expertise: ["AI/Machine Learning", "Data Science", "Product Development"]
    },
    {
      name: "Lê Văn Hải",
      role: "Head of Product",
      avatar: "/api/placeholder/80/80", 
      description: "Chuyên gia UX/UI với niềm đam mê tạo ra những sản phẩm thân thiện và dễ sử dụng.",
      expertise: ["Product Design", "User Experience", "Market Research"]
    }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Tận tâm với khách hàng",
      description: "Chúng tôi đặt lợi ích của khách hàng lên hàng đầu, luôn lắng nghe và cải thiện sản phẩm dựa trên phản hồi thực tế.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Minh bạch & Chính xác",
      description: "Mọi công thức tính toán đều được công khai và kiểm chứng bởi chuyên gia. Không có 'hộp đen' trong phân tích của chúng tôi.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Đổi mới liên tục",
      description: "Chúng tôi không ngừng nghiên cứu và áp dụng công nghệ mới để mang đến trải nghiệm tốt nhất cho người dùng.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Cộng đồng đầu tư",
      description: "Xây dựng cộng đồng nhà đầu tư thông minh, chia sẻ kiến thức và kinh nghiệm để cùng nhau phát triển.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const milestones = [
    {
      year: "07/2025",
      title: "Khởi đầu ý tưởng",
      description: "PropertyWise được thai nghén từ nhu cầu thực tế của các nhà đầu tư cá nhân"
    },
    {
      year: "07/2025",
      title: "Ra mắt MVP",
      description: "Phiên bản đầu tiên với các tính năng cơ bản, nhận được phản hồi tích cực từ 1000+ người dùng"
    },
    {
      year: "07/2025",
      title: "Tích hợp AI",
      description: "Bổ sung tính năng gợi ý cá nhân hóa và phân tích rủi ro thông minh"
    },
    {
      year: "07/2025",
      title: "Mở rộng tính năng",
      description: "Ra mắt so sánh kịch bản và công cụ dự báo thị trường"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Người dùng tin tưởng", icon: <Users className="h-5 w-5" /> },
    { value: "50,000+", label: "Phân tích đã thực hiện", icon: <TrendingUp className="h-5 w-5" /> },
    { value: "4.9/5", label: "Đánh giá trung bình", icon: <Award className="h-5 w-5" /> },
    { value: "99%", label: "Độ chính xác", icon: <CheckCircle className="h-5 w-5" /> }
  ];

  return (
    <section className="h-full bg-white flex flex-col justify-center">
      <div className="container py-8">
        {/* Header */}
        {/* <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none px-4 py-2 text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Về chúng tôi
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight mb-4">
            Câu chuyện PropertyWise
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Đội ngũ chuyên gia tài chính và công nghệ
          </p>
        </div> */}

        {/* Mission & Vision */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Sứ mệnh</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Làm cho việc phân tích đầu tư bất động sản trở nên đơn giản, chính xác và 
                dễ tiếp cận với mọi người. Chúng tôi tin rằng ai cũng xứng đáng có được 
                những công cụ phân tích chuyên nghiệp để đưa ra quyết định đầu tư thông minh.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Tầm nhìn</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Trở thành nền tảng phân tích đầu tư bất động sản hàng đầu Việt Nam, 
                nơi mọi nhà đầu tư - từ người mới bắt đầu đến chuyên gia - đều có thể 
                tìm thấy những insights có giá trị để tối ưu hóa portfolio của mình.
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Stats */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-2 border-gray-100 hover:border-blue-200 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div> */}

        {/* Values */}
        {/* <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Giá trị cốt lõi
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${value.color} rounded-lg flex items-center justify-center text-white`}>
                      {value.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {value.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}

        {/* Team */}
        {/* <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Đội ngũ sáng lập
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    {member.name}
                  </h4>
                  
                  <p className="text-blue-600 font-medium text-sm mb-3">
                    {member.role}
                  </p>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {member.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.expertise.map((skill, skillIndex) => (
                      <Badge key={skillIndex} className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}

        {/* Timeline */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Hành trình phát triển
          </h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="border-2 border-gray-100">
                      <CardContent className="p-6">
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none mb-3">
                          {milestone.year}
                        </Badge>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {milestone.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}