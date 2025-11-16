"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface LogoProps {
  href?: string;
  logoHeight?: number;
  className?: string;
  src?: string;
}

export default function Logo({
  href = "/",
  logoHeight = 32,
  className = "",
  src = "/assets/logos/SS_logo.png",
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if image exists on mount
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(false);
    };
    img.src = src;
  }, [src]);


  // If image failed to load, show text only
  if (imageError) {
    return (
      <Link 
        href={href} 
        className="inline-flex items-center gap-2.5 focus:outline-none active:outline-none focus-visible:outline-none no-underline"
        style={{ 
          textDecoration: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span 
          className={`font-bold tracking-tight ${className}`}
          style={{
            fontSize: `${logoHeight * 0.7}px`,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #E5E5E5 50%, #B3B3B3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
          }}
        >
          Supershares
        </span>
      </Link>
    );
  }

  // Show logo image + text side by side
  if (imageLoaded && !imageError) {
    return (
      <Link 
        href={href} 
        className="inline-flex items-center gap-2.5 focus:outline-none active:outline-none focus-visible:outline-none no-underline"
        style={{ 
          textDecoration: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <img
          src={src}
          alt="Supershares Logo"
          height={logoHeight}
          width={logoHeight}
          className="object-contain flex-shrink-0"
          style={{ 
            height: `${logoHeight}px`,
            width: 'auto',
            display: 'block'
          }}
          onError={() => setImageError(true)}
        />
        <span 
          className={`font-bold tracking-tight ${className}`}
          style={{
            fontSize: `${logoHeight * 0.7}px`,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #E5E5E5 50%, #B3B3B3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
          }}
        >
          Supershares
        </span>
      </Link>
    );
  }

  // Default: show text while checking
  return (
    <Link 
      href={href} 
      className="group inline-flex items-center gap-2.5 focus:outline-none active:outline-none focus-visible:outline-none no-underline"
      style={{ 
        textDecoration: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
        <span 
          className={`font-bold tracking-tight ${className}`}
          style={{
            fontSize: `${logoHeight * 0.7}px`,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #E5E5E5 50%, #B3B3B3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
          }}
        >
          Supershares
        </span>
    </Link>
  );
}

