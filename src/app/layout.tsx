import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropertyWise - Cố Vấn Bất Động Sản Thông Minh",
  description: "Hiểu bạn như chính bạn. Chỉ cần giá nhà và số tiền bạn có - chúng tôi sẽ tính toán tất cả còn lại. Phân tích ROI, dòng tiền, rủi ro và so sánh các kịch bản đầu tư với gợi ý cá nhân hóa.",
  keywords: "bất động sản, đầu tư, ROI, dòng tiền, PropertyWise, cố vấn thông minh, phân tích đầu tư, Việt Nam",
  authors: [{ name: "PropertyWise Team" }],
  openGraph: {
    title: "PropertyWise - Cố Vấn Bất Động Sản Thông Minh",
    description: "Hiểu bạn như chính bạn. Chỉ cần giá nhà và số tiền bạn có - chúng tôi sẽ tính toán tất cả còn lại.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
        suppressHydrationWarning
      >
        <div className="relative bg-background">
          <Header />
          <main>{children}</main>
          {/* <Footer /> */}
        </div>
        
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          expand={true}
          richColors
        />
        
        {/* Scroll to Top */}
        <ScrollToTop />
      </body>
    </html>
  );
}