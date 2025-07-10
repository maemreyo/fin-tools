// UPDATED: 2025-01-16 - Complete landing page redesign for PropertyWise
"use client";

import { useRouter } from "next/navigation";
import HeroSection from "@/components/HeroSection";
import ValuePropositionSection from "@/components/ValuePropositionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import ScrollSnapContainer from "@/components/ScrollSnapContainer";

export default function HomePage() {
  const router = useRouter();

  const handleScrollToForm = () => {
    router.push("/calculator");
  };

  const sections = [
    { id: "hero", title: "Trang chủ", color: "blue" },
    { id: "value-prop", title: "Giá trị cốt lõi", color: "indigo" },
    { id: "how-it-works", title: "Cách hoạt động", color: "green" },
    { id: "features", title: "Tính năng", color: "purple" },
    { id: "testimonials", title: "Đánh giá", color: "emerald" },
    { id: "pricing", title: "Bảng giá", color: "blue" },
    { id: "about", title: "Về chúng tôi", color: "indigo" },
    { id: "faq", title: "FAQ", color: "orange" },
    { id: "cta", title: "Bắt đầu", color: "gradient" }
  ];

  return (
    <ScrollSnapContainer sections={sections}>
      <HeroSection onScrollToForm={handleScrollToForm} />
      <ValuePropositionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <AboutSection />
      <FAQSection />
      <CTASection onGetStarted={handleScrollToForm} />
    </ScrollSnapContainer>
  );
}
