// src/components/AnimatedSection.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale";
  delay?: number;
  duration?: number;
}

const animations = {
  fadeUp: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  slideLeft: {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 }
  },
  slideRight: {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 }
  }
};

export default function AnimatedSection({ 
  children, 
  className = "",
  animation = "fadeUp",
  delay = 0,
  duration = 0.6
}: AnimatedSectionProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const selectedAnimation = animations[animation];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={selectedAnimation.initial}
      animate={inView ? selectedAnimation.animate : selectedAnimation.initial}
      transition={{ 
        duration,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger Children Animation
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1 
}: StaggerContainerProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}