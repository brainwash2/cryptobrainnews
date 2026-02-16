'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function AppImage({ src, alt, fill, className, priority }: any) {
  const [error, setError] = useState(false);
  
  // High-quality crypto placeholder if image fails
  const fallback = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000";

  return (
    <Image
      src={error || !src ? fallback : src}
      alt={alt || "CryptoBrain"}
      fill={fill}
      className={`${className} ${error ? 'opacity-50 grayscale' : ''}`}
      priority={priority}
      onError={() => setError(true)}
      unoptimized
    />
  );
}
