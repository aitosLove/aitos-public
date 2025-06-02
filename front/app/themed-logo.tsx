'use client'

import { useEffect, useState } from 'react';
import { useTheme } from "next-themes";
import Image from "next/image";

export default function ThemedLogo({ size = "regular" }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only run once on initial mount to handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Set dimensions based on size prop
  const dimensions = size === "small" ? 32 : 80;
  const placeholderSize = size === "small" ? "w-8 h-8" : "w-20 h-20";
  
  // Early return placeholder during SSR
  if (!mounted) {
    return <div className={placeholderSize} />; // Placeholder during SSR to prevent layout shift
  }
  
  // Determine logo source based on resolved theme
  const logoSrc = resolvedTheme === "dark" ? "/aitos-w.png" : "/aitos.png";
  
  return (
    <Image
      src={logoSrc}
      alt="AITOS"
      width={dimensions}
      height={dimensions}
      className="rounded-none"
      priority // Add priority to improve loading performance for logo
    />
  );
}