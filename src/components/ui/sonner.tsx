"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      className="toaster group"
      style={
        {
          // Solid backgrounds instead of transparent
          "--normal-bg": theme === "dark" ? "hsl(var(--background))" : "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": theme === "dark" ? "hsl(142 76% 15%)" : "hsl(142 76% 95%)",
          "--success-text": theme === "dark" ? "hsl(142 76% 85%)" : "hsl(142 76% 25%)",
          "--error-bg": theme === "dark" ? "hsl(0 84% 15%)" : "hsl(0 84% 95%)",
          "--error-text": theme === "dark" ? "hsl(0 84% 85%)" : "hsl(0 84% 25%)",
          "--warning-bg": theme === "dark" ? "hsl(38 92% 15%)" : "hsl(38 92% 95%)",
          "--warning-text": theme === "dark" ? "hsl(38 92% 85%)" : "hsl(38 92% 25%)",
          "--info-bg": theme === "dark" ? "hsl(217 91% 15%)" : "hsl(217 91% 95%)",
          "--info-text": theme === "dark" ? "hsl(217 91% 85%)" : "hsl(217 91% 25%)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          // Ensure solid background with slight shadow for better visibility
          backgroundColor: "var(--normal-bg)",
          color: "var(--normal-text)",
          border: "1px solid var(--normal-border)",
          backdropFilter: "blur(8px)",
          boxShadow: theme === "dark" 
            ? "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)" 
            : "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
        },
        ...props.toastOptions,
      }}
      {...props}
    />
  )
}

export { Toaster }
