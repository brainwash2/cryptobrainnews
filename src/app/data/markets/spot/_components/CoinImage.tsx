'use client';

interface CoinImageProps {
  src: string;
  alt: string;
}

export default function CoinImage({ src, alt }: CoinImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-5 h-5 rounded-full flex-shrink-0"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
