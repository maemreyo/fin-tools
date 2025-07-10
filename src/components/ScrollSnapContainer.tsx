// src/components/ScrollSnapContainer.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronUp, ChevronDown, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrollSnapContainerProps {
  children: React.ReactNode;
  sections: Array<{
    id: string;
    title: string;
    color?: string;
  }>;
}

export default function ScrollSnapContainer({ children, sections }: ScrollSnapContainerProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Hide scroll indicator after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(sections[index].id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToNext = () => {
    if (currentSection < sections.length - 1) {
      scrollToSection(currentSection + 1);
    }
  };

  const scrollToPrev = () => {
    if (currentSection > 0) {
      scrollToSection(currentSection - 1);
    }
  };

  return (
    <div className="relative h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide">
      {/* Scroll Snap Container */}
      <div className="scroll-smooth">
        {React.Children.map(children, (child, index) => (
          <SectionWrapper
            key={sections[index]?.id || index}
            sectionId={sections[index]?.id || `section-${index}`}
            onInView={() => setCurrentSection(index)}
          >
            {child}
          </SectionWrapper>
        ))}
      </div>

      {/* Navigation Dots */}
      <motion.div 
        className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        {sections.map((section, index) => (
          <motion.button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className={`group relative w-3 h-3 rounded-full transition-all duration-300 ${
              currentSection === index 
                ? 'bg-blue-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Tooltip */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {section.title}
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Scroll Navigation Arrows */}
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ delay: 0.5 }}
          >
            {currentSection > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={scrollToPrev}
                className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            
            {currentSection < sections.length - 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={scrollToNext}
                className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50 origin-left"
        style={{
          scaleX: (currentSection + 1) / sections.length
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: (currentSection + 1) / sections.length }}
        transition={{ duration: 0.3 }}
      />

      {/* Mobile Section Indicator */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm font-medium text-gray-700">
            {currentSection + 1} / {sections.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Section Wrapper with Intersection Observer
interface SectionWrapperProps {
  children: React.ReactNode;
  sectionId: string;
  onInView: () => void;
}

function SectionWrapper({ children, sectionId, onInView }: SectionWrapperProps) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      onInView();
    }
  }, [inView, onInView]);

  return (
    <motion.div
      ref={ref}
      id={sectionId}
      className="h-screen snap-start snap-always flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: false, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}