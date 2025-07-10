// src/components/FAQSection.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle,
  Sparkles,
  Calculator,
  Shield,
  DollarSign,
  BarChart3,
  Users,
  Headphones
} from "lucide-react";

export default function FAQSection() {
  const faqCategories = [
    {
      title: "Câu hỏi thường gặp",
      icon: <HelpCircle className="h-5 w-5" />,
      color: "from-blue-500 to-indigo-500",
      faqs: [
        {
          question: "PropertyWise là gì?",
          answer: "Nền tảng phân tích đầu tư bất động sản thông minh sử dụng AI. Chỉ cần nhập giá nhà và số tiền có, bạn sẽ có phân tích toàn diện trong 30 giây."
        },
        {
          question: "Khác gì so với công cụ khác?",
          answer: "PropertyWise cung cấp 15+ chỉ số chuyên nghiệp, so sánh kịch bản, AI gợi ý cá nhân hóa và báo cáo PDF chuyên nghiệp."
        },
        {
          question: "Có cần kiến thức tài chính không?",
          answer: "Không! Được thiết kế cho mọi người với giải thích rõ ràng và hướng dẫn chi tiết."
        },
        {
          question: "Có miễn phí không?",
          answer: "Có gói miễn phí với tính năng cơ bản. Nâng cấp để có thêm tính năng chuyên nghiệp."
        }
      ]
    }
  ];

  return (
    <section className="h-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col justify-center">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none px-4 py-2 text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            FAQ
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-red-900 bg-clip-text text-transparent leading-tight mb-4">
            Câu hỏi thường gặp
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những câu hỏi phổ biến nhất về PropertyWise
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center text-white`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {category.title}
                </h3>
              </div>

              {/* FAQ Items */}
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem 
                    key={faqIndex} 
                    value={`${categoryIndex}-${faqIndex}`}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white mx-auto mb-6">
              <Headphones className="h-8 w-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Vẫn còn thắc mắc?
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn. 
              Hãy liên hệ qua email hoặc chat trực tiếp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-4 py-2">
                📧 support@propertywise.vn
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
                💬 Chat trực tiếp 24/7
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 border-purple-300 px-4 py-2">
                📞 Hotline: 1900-xxxx
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}