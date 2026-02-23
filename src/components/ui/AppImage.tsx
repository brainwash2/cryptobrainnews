'use client';
import { useState } from 'react';

const FALLBACK_SRC = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000';

export default function AppImage({ src, alt = 'CryptoBrain', className, priority, fill, ...rest }: any) {
  const [error, setError] = useState(false);
  const resolvedSrc = error || !src ? FALLBACK_SRC : src;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={`${className ?? ''} w-full h-full object-cover`}
      onError={() => setError(true)}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  );
}
