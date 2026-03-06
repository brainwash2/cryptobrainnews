'use client';
import { useState, ImgHTMLAttributes } from 'react';

const FALLBACK_SRC = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200';

interface AppImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
}

export default function AppImage({ src, alt = 'Image', className, priority, fill, ...rest }: AppImageProps) {
  const [error, setError] = useState(false);
  const resolvedSrc = error || !src ? FALLBACK_SRC : src;

  return (
    <img
      src={resolvedSrc as string}
      alt={alt}
      className={`object-cover ${className || ''} ${fill ? 'absolute inset-0 w-full h-full' : ''}`}
      onError={() => setError(true)}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  );
}
