import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Real Estate Calculator - Tính Toán Đầu Tư Bất Động Sản",
  description: "Công cụ phân tích dòng tiền và ROI cho đầu tư bất động sản tại Việt Nam. Tính toán chính xác, so sánh kịch bản, đưa ra quyết định đầu tư thông minh.",
  keywords: "bất động sản, đầu tư, ROI, dòng tiền, calculator, Việt Nam",
  authors: [{ name: "Real Estate Calculator Team" }],
  openGraph: {
    title: "Real Estate Calculator - Tính Toán Đầu Tư Bất Động Sản",
    description: "Công cụ phân tích dòng tiền và ROI cho đầu tư bất động sản tại Việt Nam",
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
        <main className="relative">
          {children}
        </main>
        
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
          expand={true}
          richColors
        />
      </body>
    </html>
  );
}