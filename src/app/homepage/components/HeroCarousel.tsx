'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface CarouselSlide {
  id: string;
  headline: string;
  summary: string;
  image: string;
  alt: string;
  category: string;
  articleUrl: string;
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
}

const HeroCarousel = ({ slides }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHydrated, slides.length]);

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  if (!isHydrated) {
    return (
      <div className="relative w-full h-[500px] bg-card">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground font-caption">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] bg-card overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Link href={slide.articleUrl} className="block h-full">
            <div className="relative h-full">
              <AppImage
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                <div className="max-w-4xl">
                  <span className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-bold font-caption mb-4">
                    {slide.category}
                  </span>
                  <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 font-heading">
                    {slide.headline}
                  </h2>
                  <p className="text-lg text-white/90 line-clamp-2">
                    {slide.summary}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white transition-smooth"
        aria-label="Previous slide"
      >
        <Icon name="ChevronLeftIcon" size={24} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white transition-smooth"
        aria-label="Next slide"
      >
        <Icon name="ChevronRightIcon" size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 transition-smooth ${
              index === currentSlide ? 'bg-primary' : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
