"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RotatingTextProps {
  words: string[];
  className?: string;
  interval?: number;
  direction?: "up" | "down";
}

export default function RotatingText({
  words,
  className,
  interval = 3000,
  direction = "up",
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 300); // Half of animation duration
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={cn("inline-block relative overflow-hidden align-middle", className)}>
      <span
        className={cn(
          "inline-block transition-all duration-500 ease-in-out align-middle",
          direction === "up"
            ? isAnimating
              ? "-translate-y-full opacity-0"
              : "translate-y-0 opacity-100"
            : isAnimating
              ? "translate-y-full opacity-0"
              : "translate-y-0 opacity-100"
        )}
        key={currentIndex}
      >
        {words[currentIndex]}
      </span>
    </span>
  );
}

