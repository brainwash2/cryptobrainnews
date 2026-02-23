'use client';
import { useState } from 'react';

const FALLBACK_SRC = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200';

export default function AppImage({ src, alt = 'Image', className, priority, fill, ...rest }: any) {
  const [error, setError] = useState(false);
  const resolvedSrc = error || !src ? FALLBACK_SRC : src;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={`object-cover ${className || ''} ${fill ? 'absolute inset-0 w-full h-full' : ''}`}
      onError={() => setError(true)}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  );
}
