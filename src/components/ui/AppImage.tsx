'use client';
import { useState } from 'react';
 
const FALLBACK = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800';
 
interface Props {
  src?: string | null;
  alt?: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}
 
export default function AppImage({ src, alt = '', className = '', fill, priority, width, height, ...rest }: Props) {
  const [errored, setErrored] = useState(false);
  const resolved = errored || !src ? FALLBACK : src;
 
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={`object-cover${fill ? ' absolute inset-0 w-full h-full' : ''}${className ? ' ' + className : ''}`}
      onError={() => setErrored(true)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      width={fill ? undefined : (width || undefined)}
      height={fill ? undefined : (height || undefined)}
      {...rest}
    />
  );
}
