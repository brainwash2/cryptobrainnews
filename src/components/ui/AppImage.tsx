'use client';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

const FALLBACK_SRC =
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000';

interface AppImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src?: string | null;
  alt?: string;
}

export default function AppImage({
  src,
  alt = 'CryptoBrain',
  className,
  ...rest
}: AppImageProps) {
  const [error, setError] = useState(false);

  const resolvedSrc = error || !src ? FALLBACK_SRC : src;

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      className={`${className ?? ''} ${error ? 'opacity-50 grayscale' : ''}`}
      onError={() => setError(true)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...rest}
    />
  );
}
