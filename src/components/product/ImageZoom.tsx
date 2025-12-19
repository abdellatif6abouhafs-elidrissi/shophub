'use client';

import { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  return (
    <div
      ref={containerRef}
      className={`group relative cursor-zoom-in overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Original Image */}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-opacity duration-200"
        style={{ opacity: isZoomed ? 0 : 1 }}
        priority
      />

      {/* Zoomed Image */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: isZoomed ? 1 : 0,
          backgroundImage: `url(${src})`,
          backgroundSize: '200%',
          backgroundPosition: `${position.x}% ${position.y}%`,
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Zoom Indicator */}
      <div
        className={`absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-opacity ${
          isZoomed ? 'opacity-0' : 'opacity-100 group-hover:opacity-100'
        }`}
      >
        <ZoomIn className="h-3 w-3" />
        Hover to zoom
      </div>
    </div>
  );
}
